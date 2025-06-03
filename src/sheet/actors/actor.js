import { ActorConfigForm } from "../../apps/actor-config";
import BuyAmmoForm from "../../apps/buy-ammo";
import { SpeedConfigForm } from "../../apps/speed-config";
import ChatHelpers from "../../system/chat-helpers";
import IMSheetMixin from "../mixin";

export default class IMActorSheet extends IMSheetMixin(WarhammerActorSheetV2)
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static DEFAULT_OPTIONS = {
        classes: ["impmal"],
        window : {
          controls : [
            {
              icon : 'fa-solid fa-gear',
              label : "Actor Settings",
              action : "configureActor"
            }
          ],
        },
        position: {
            height: 800
        },
        actions : {
          rollTest : this._onRollTest,
          toggleSummary : this._toggleSummary,
          
            configureActor : this._onConfigureActor,
            slotItem : this._onSlotItem,
            speedConfig : this._onSpeedConfig,
            reload : this._onReload,
            createSpecialisation : this._onCreateSpecialisation,
            useTrait: this._onTraitClick,
            rollWarp: this._onWarpClick,
            purge: this._onPurgeClick,
            showAttacker: this._onClickAttacker,
            removeOpposed: this._onRemoveOpposed,
            resistEffect: this._onResistEffect,
            toggleInfluence: this._onToggleInfluence,
            slotRemove: this._onSlotRemove,
            useItem: this._onUseItem,
            clearAction: this._onClearAction,
            damageArmour: {buttons: [0, 2], handler : this._onDamageArmour},
            useAction: this._onActionClick,
            expandFaction : this._onFactionExpand,
            expandRow : this._onExpandRow,
            createSource : this._onInfluenceSourceCreate,
            deleteSource : this._onInfluenceSourceDelete,
            editSource : this._onInfluenceSourceEdit,
            clickMag : this._onClickMag

        },
        defaultTab : "main"
      }    

    static _onConfigureActor(ev) 
    {
        new ActorConfigForm(this.actor).render(true);
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.conditions = this.formatConditions();
        context.factionsExpanded = this.factionsExpanded;
        context.items.equipped = this.getEquippedItems();
        context.hitLocations = this.formatHitLocations();
        return context;
    }

    async _handleEnrichment() 
    {
        return foundry.utils.expandObject({
            "system.notes.player" : await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.notes.player, {async: true, secrets : this.document.isOwner, relativeTo: this.document}),
            "system.notes.gm" : await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.notes.gm, {async: true, secrets : this.document.isOwner, relativeTo: this.document}),
        });
    }


    getEquippedItems()
    {
        let sheetItems = this.actor.itemTypes;
        return {
            melee : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.isMelee),
            ranged : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.isRanged),
            protection : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category != "shield"),
            shield : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category == "shield"),
            equipment : sheetItems.equipment.filter(i => i.system.equipped.value)
            // vehicle : data.system.vehicle?.itemTypes.weapon
        };
    }

    _prepareTabs(options) 
    {
        let tabs = super._prepareTabs(options);
        if (this.actor.itemTypes.power.length == 0)
        {
            delete tabs.powers;
        }
        return tabs;
    }

    async _onDropItem(data, ev)
    {
        let document = await Item.fromDropData(data);
        let sustaining = ev.target.closest(".sustaining")
        let slot = ev.target.closest(".slot")

        // If dropped into a sustained power section, or a slot. 
        // Only applies to items already owned by the actor
        if ((sustaining || slot) && document.actor?.uuid == this.actor.uuid)
        {
            // If power, add power to sustained list of powers
            if (sustaining && document.type == "power" && document.parent?.uuid == this.actor.uuid)
            {
                this.document.update(this.document.system.warp.sustaining.add(document));
            }
            // If physical item, slot into whatever item dropped into
            else if (slot && document.system.isPhysical)
            {
                let index = slot.dataset.index;
                let dropItem = this.actor.items.get(ev.target.closest(".list-row")?.dataset.id);
                dropItem?.update(dropItem.system.slots.slotItem(document, index));
            }
            else 
            {
                super._onDropItem(data, ev);
            }
        }
        else 
        {
            super._onDropItem(data, ev);
        }
    }

    formatHitLocations()
    {
        if (this.actor.system.combat?.hitLocations)
        {
            let locations = foundry.utils.deepClone(this.actor.system.combat.hitLocations);
            return Object.keys(locations)
                .map(i => 
                {
                    this.actor.system.combat.hitLocations[i].key = i;
                    return this.actor.system.combat.hitLocations[i];
                })
                .sort((a, b) => a.range[0] - b.range[0])
                .map(i =>
                {
                    if (i.range[0] != i.range[1])
                    {
                        i.displayRange = `${i.range[0]}-${i.range[1]}`;
                    }
                    else
                    {
                        i.displayRange = i.range[0];
                    }
                    return i;
                });
        }
    }

    
    formatConditions()
    {
        let conditions = foundry.utils.deepClone(CONFIG.statusEffects);
        conditions.forEach(c =>
        {
            c.boolean = !game.impmal.config.tieredCondition[c.id];
            c.existing = this.document.hasCondition(c.id);
            c.opacity = 30;

            // Conditions have 1 or 2 pips, two for minor/major
            // If condition existis on actor, it must have at least one filled pip
            c.pips = [{filled : c.existing, type : "minor"}]; 

            // If not boolean (minor/major), add another pip, filled if major
            if (!c.boolean) 
            {
                c.pips.push({filled : c.existing?.isMajor, type : "major"});
            }

            if ((c.boolean && c.existing) || c.existing?.isMajor)
            {
                c.opacity = 100;
            }
            else if (c.existing?.isMinor)
            {
                c.opacity = 60;
            }
        });
        return conditions;
    }

    _getContextMenuOptions()
    { 
      let getParent = this._getParent.bind(this);
      return [
        {
          name: "Edit",
          icon: '<i class="fas fa-edit"></i>',
          condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
          callback: async li => {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            document.sheet.render(true);
          }
        },
        {
            name: "Buy Ammo",
            icon: '<i class="fa-solid fa-spinner"></i>',
            condition: li => {
              let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid
              if (uuid)
              {
                let parsed = foundry.utils.parseUuid(uuid);
                if (parsed.type == "Item")
                {
                    let item = this.document.items.get(parsed.id);
                    return item && item.type == "weapon" && item.system.isRanged
                }
            }
            },
            callback: async li => 
            {
              let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
              const document = await fromUuid(uuid);
              new BuyAmmoForm(document).render(true);
            }
        },
        {
          name: "Remove",
          icon: '<i class="fas fa-times"></i>',
          condition: li => {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid
            if (uuid)
            {
              let parsed = foundry.utils.parseUuid(uuid);
              if (parsed.type == "ActiveEffect")
              {
                return parsed.primaryId == this.document.id; // If an effect's parent is not this document, don't show the delete option
              }
              else if (parsed.type)
              {
                return true;
              }
              return false;
            }
            else return false;
          },
          callback: async li => 
          {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            document.delete();
          }
        },
        {
            name: "Duplicate",
            icon: '<i class="fa-solid fa-copy"></i>',
            condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
            callback: async li => 
            {
                let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
                const document = await fromUuid(uuid);
                this.actor.createEmbeddedDocuments("ActiveEffect", [document.toObject()]);
            }
          },
      ];
    }

    /**
     * Prevent effects from stacking up each form submission
   * @override
   */
    async _processSubmitData(event, form, submitData) {
        let diffData = foundry.utils.diffObject(this.document.toObject(false), submitData)
        await this.document.update(diffData);
      }


    _addEventListeners()
    {
        super._addEventListeners();

        this.element.querySelectorAll(".defending-against").forEach(e => e.addEventListener("mouseover", this._onHoverInAttacker.bind(this)));
        this.element.querySelectorAll(".defending-against").forEach(e => e.addEventListener("mouseout", this._onHoverOutAttacker.bind(this)));
        this.element.querySelectorAll(".influence-source input").forEach(e => e.addEventListener("change", this._onInfluenceSourceEdit.bind(this)));
        this.element.querySelectorAll(".add-effect").forEach(e => e.addEventListener("change", this._onAddEffect.bind(this)));
        this.element.querySelectorAll(".remove-sustaining").forEach(e => e.addEventListener("click", this._onRemoveSustaining.bind(this)))

        this.element.querySelectorAll(".influence-sources input").forEach(e => e.addEventListener("change", this.constructor._onInfluenceSourceEdit.bind(this)));


        this.element.querySelectorAll(".rollable").forEach(element => {
            element.addEventListener("mouseenter", ev => {
            let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img") ;
            if (img)
            {
                this._icon = img.src;
                img.src = "systems/impmal/assets/icons/d10.webp";
            }
            })
            element.addEventListener("mouseleave", ev => {
            let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img") ;
            if (img)
            {
                img.src = this._icon;
            }
            })
        });

        this.element.querySelectorAll(".droppable").forEach(e => e.addEventListener("dragenter", ev => {
            ev.target.classList.add("hover")
        }))
        this.element.querySelectorAll(".droppable").forEach(e => e.addEventListener("dragleave", ev => {
            ev.target.classList.remove("hover")
        }))
    }
  

    static _onSpeedConfig(ev)
    {
        new SpeedConfigForm(this.actor).render(true)
    }

    static _onReload(ev)
    {
        let id = this._getId(ev);
        let item = this.actor.items.get(id);

        try 
        {
            item.update(item.system.reload());
        }
        catch(e)
        {
            ui.notifications.error(e);
        }
    }

    static _onRollTest(ev, target)
    {
        let type = target.dataset.type;  // characteristic, skill, etc.
        let key = this._getKey(ev);                   // Non items, such as characteristic keys, or skill keys
        let itemId = this._getId(ev);                   // Item ids, if using skill items or weapons

        switch(type)
        {
        case "characteristic":
            return this.actor.setupCharacteristicTest(key);
        case "skill":
            return this.actor.setupSkillTest({itemId, key});
        case "weapon":
            return this.actor.setupWeaponTest(itemId);
        case "power":
            return this.actor.setupPowerTest(itemId);
        case "trait":
            return this.actor.setupTraitTest(itemId);
        case "item":
            return this.actor.setupTestFromItem(this.actor.items.get(itemId).uuid);
        }
    }

    static _onTraitClick(ev)
    {
        let itemId = this._getId(ev);      
        if(ev.currentTarget.dataset.action == "attack")
        {
            this.actor.setupTraitTest(itemId);
        }
    }

    
    static _onTraitRoll(ev)
    {
        let itemId = this._getId(ev);      
        let item = this.actor.items.get(itemId);
        new Roll(item.system.roll.formula).roll({async: true}).then(roll => roll.toMessage({speaker : ChatMessage.getSpeaker({actor : this.actor}), flavor : item.system.roll.label}));
    }

    static _onTargetTest(ev)
    {
        if (game.user.targets.size == 0)
        {
            ui.notifications.warn(game.i18n.localize("IMPMAL.TargetTokensPrompt"));
        }
        let itemId = this._getId(ev);      
        let item = this.actor.items.get(itemId);
        Array.from(game.user.targets).forEach(target => 
        {
            SocketHandlers.executeOnOwner(target.actor, "rollItemTest",{documentUuid : target.actor.uuid, itemUuid : item.uuid});
        });
        game.user.updateTokenTargets([]);
    }

    static async _onCreateSpecialisation(ev)
    {
        let skill = this._getKey(ev);
        
        let specialisations = await warhammer.utility.findAllItems("specialisation", "", true, ["system.skill"])

        specialisations = specialisations.filter(i => i.system.skill == skill);
        let choice = [];
        if (specialisations.length)
        {
            choice = await ItemDialog.create(specialisations, 1, {text : game.i18n.localize("IMPMAL.ChooseSpecialisation")});
        }

        if (choice[0])
        {
            Item.implementation.create((await fromUuid(choice[0].uuid)).toObject(), {parent: this.actor});
        }

        else 
        {
            Item.implementation.create({
                type : "specialisation",
                name : game.i18n.format("IMPMAL.SkillSpecialisation", {skill : game.impmal.config.skills[skill]}), 
                system : {skill}, 
            }, {renderSheet:true, parent: this.actor});
        }
            
    }

    static _onExpandRow(ev, target)
    {
      let dropdown = target.closest(".list-row").querySelector(".dropdown-content");
      if (dropdown.classList.contains("expanded"))
      {
          dropdown.classList.replace("expanded", "collapsed");
      }
      else if (dropdown.classList.contains("collapsed"))
      {
          dropdown.classList.replace("collapsed", "expanded");
      }
    }

    static _onFactionExpand(ev, target)
    {
        let faction = this._getKey(ev);
      let dropdown = target.closest(".list-row").querySelector(".dropdown-content");
      if (dropdown.classList.contains("expanded"))
      {
          dropdown.classList.replace("expanded", "collapsed");
          delete this.factionsExpanded[faction]
      }
      else if (dropdown.classList.contains("collapsed"))
      {
          dropdown.classList.replace("collapsed", "expanded");
          this.factionsExpanded[faction] = true;
      }
    }

    static _onInfluenceSourceEdit(ev)
    {
        ev.stopPropagation();
        let index = this._getIndex(ev);
        let faction = this._getKey(ev);
        let property = ev.target.dataset.property;
        let value = ev.target.value;
        if (!isNaN(value))
        {
            value = Number(value);
        }
        this.actor.update(this.actor.system.influence.editSource(faction, index, {[property] : value}));
    } 

    static _onInfluenceSourceDelete(ev, target)
    {
        ev.stopPropagation();
        let index = this._getIndex(ev);
        let faction = this._getKey(ev);
        this.actor.update(this.actor.system.influence.deleteSource(faction, index));
    }

    static _onInfluenceSourceCreate(ev, target)
    {
        ev.stopPropagation();
        let faction = this._getKey(ev);
        this.actor.update(this.actor.system.influence.addSource(faction));
    }

    static _onWarpClick()
    {
        this.actor.setupSkillTest({key : "psychic"}, {warp: this.actor.system.warp.state});
    }

    static _onPurgeClick()
    {
        this.actor.purge();
    }

    static _onClickAttacker() 
    {
        let test = this.actor.defendingAgainst
        ChatHelpers.scrollToMessage(test.message.id);
    }

    static _onRemoveOpposed()
    {
        this.actor.clearOpposed();
    }

    
    static async _toggleSummary(ev) 
    {
        ev.preventDefault();
        let document = this._getDocument(ev);
        let summaryData = await document?.system?.summaryData();
        let summaryHTML = await renderTemplate("systems/impmal/templates/item/partials/item-summary.hbs", summaryData);
        this._toggleDropdown(ev, summaryHTML);
    }

    
    _onHoverInAttacker() 
    {
        let test = this.actor.defendingAgainst
        ChatHelpers.highlightMessage(test.message.id);
        TokenHelpers.highlightToken(test.context.speaker.token);
    }

    _onHoverOutAttacker() 
    {
        let test = this.actor.defendingAgainst
        ChatHelpers.unhighlightMessage(test.message.id);
        TokenHelpers.unhighlightToken(test.context.speaker.token);
    }

    static _onResistEffect(ev)
    {
        let document = this._getDocument(ev);
        document?.resistEffect().then(success => 
        {
            if (success)
            {
                document.delete();
            }
        });
    }

    
    static _onToggleInfluence(ev, target)
    {
        let sources = target.closest(".list-item").querySelector(".influence-source");
        let faction = this._getType(ev);

        if (sources.classList.contains("collapsed"))
        {
            sources.classList.replace("expanded", "collapsed");
            sources.styles.display = "flex";
            this.factionsExpanded[faction] = true;
        }
        else 
        {
            sources.styles.display = "none";
            sources.classList.replace("collapsed", "expanded");
            delete this.factionsExpanded[faction];
        }
    }

    
    _onInfluenceSourceEdit(ev)
    {
        ev.stopPropagation()
        let index = this._getIndex(ev);
        let faction = this._getType(ev);
        let property = ev.currentTarget.dataset.property;
        let value = ev.target.value;
        if (Number.isNumeric(value))
        {
            value = Number(value);
        }
        this.actor.update(this.actor.system.influence.editSource(faction, index, {[property] : value}));
    }

    static _onActionClick(ev)
    {
        this.actor.useAction(ev.target.dataset.actionKey);
    }

    static async _onSlotItem(ev, target)
    {
        let choice = await ItemDialog.create(this.actor.items.contents.filter(i => i.system.isPhysical), 1, {text : "Select Item to place in slot", title : "Slot"});
        let item = this.actor.items.get(this._getParent(target, ".list-row")?.dataset.id);
        let slot = this._getParent(target, ".slot")
        if (item)
        {
            item.update(item.system.slots.slotItem(choice[0], slot.dataset.index));
        }
    }

    static _onSlotRemove(ev)
    {
        let document = this._getDocument(ev);
        let index = this._getIndex(ev);
        document.update(document.system.slots.edit(index, {id : ""}));
    }

    static _onUseItem(ev)
    {
        ev.stopPropagation()
        let uuid = this._getUUID(ev);
        let id = this._getId(ev);

        return this.actor.useItem({id, uuid});
    }
    
    static _onClickArmourConfig()
    {
        new ArmourConfig(this.object).render(true);
    }

    static _onClearAction(ev)
    {
        this.actor.clearAction();
    }

    static _onDamageArmour(ev)
    {
        ev.stopPropagation();
        let key = this._getKey(ev);
        let id = this._getId(ev);
        let value = ev.button == 0 ? 1 : -1;
        this.actor.damageArmour(key, value, this.actor.items.get(id));
    }

    _onAddEffect(ev)
    {
        let id = ev.target.value;
        let effectData = foundry.utils.deepClone(game.impmal.config.zoneEffects[id]);
        if (id && effectData)
        {
            foundry.utils.setProperty(effectData, "system.transferData.enableConditionScript", "");

            let token = this.actor.getActiveTokens()[0]?.document;
            if (token)
            {
                let inRegion = canvas.scene.regions.find(r => r.tokens.has(token));
                if (inRegion)
                {
                    foundry.utils.setProperty(effectData, "system.sourceData.zone", inRegion.uuid);
                }
            }

            foundry.utils.setProperty(effectData, "system.transferData.enableConditionScript", "");
            this.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
        }
    }

    _onRemoveSustaining(ev)
    {
        let index = this._getIndex(ev);
        this.actor.update(this.actor.system.warp.sustaining.remove(index));
        // this.actor.update(foundry.utils.mergeObject(this.actor.system.warp.sustaining.remove(index), {"system.warp.charge" : this.actor.system.warp.charge - document.system.rating}));
    }

    //#endregion
}