import ArmourConfig from "../../apps/armour-config";
import DocumentChoice from "../../apps/document-choice";
import ChatHelpers from "../../system/chat-helpers";
import TokenHelpers from "../../system/token-helpers";
import ImpMalSheetMixin from "../mixins/sheet-mixin";

export default class ImpMalActorSheet extends ImpMalSheetMixin(WarhammerActorSheet)
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static get defaultOptions()
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "actor"]);
        options.resizable = true;
        options.scrollY = [".tab-content"];
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        options.dragDrop.push({dragSelector : ".list .list-item:not(.no-drag)"});
        return options;
    }

    get template()
    {
        if (this.actor.limited)
        {
            return `systems/impmal/templates/actor/limited-sheet.hbs`;
        }
        else 
        {
            return `systems/impmal/templates/actor/${this.actor.type}-sheet.hbs`;
        }
    }

    async getData()
    {
        let data = await super.getData();
        data.system = data.actor.system;
        data.items = this.organizeItems(data);
        data.effects = this.organizeEffects(data);
        data.hitLocations = this.formatHitLocations(data);
        data.conditions = this.formatConditions(data);
        data.conditions = data.conditions.filter(i => i.id != "dead");
        data.defendingAgainst = this.actor.defendingAgainst;
        data.factionsExpanded = this.factionsExpanded;
        data.enriched = foundry.utils.expandObject({
            "system.notes.player" : await TextEditor.enrichHTML(data.actor.system.notes.player, {async: true}),
            "system.notes.gm" : await TextEditor.enrichHTML(data.actor.system.notes.gm, {async: true}),
        });

        return data;
    }


    organizeItems(data)
    {
        let sheetItems = data.actor.itemTypes;

        for(let key in sheetItems)
        {
            if (sheetItems[key] instanceof Array)
            {
                sheetItems[key] = sheetItems[key].sort((a, b) => a.sort - b.sort);
            }
        }

        sheetItems.equipped = {
            melee : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.isMelee),
            ranged : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.isRanged),
            protection : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category != "shield"),
            shield : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category == "shield"),
            equipment : sheetItems.equipment.filter(i => i.system.equipped.value),
            vehicle : data.system.vehicle?.itemTypes.weapon
        };

        return sheetItems;
    }

    organizeEffects(data)
    {
        let sorted = Array.from(data.actor.allApplicableEffects(true)).sort((a, b) => a.sort - b.sort);
        let effects = {
            active: sorted.filter(e => e.isTemporary && !e.disabled),
            passive : sorted.filter(e => !e.isTemporary && !e.disabled),
            disabled : sorted.filter(e => e.disabled)
        };

        return effects;
    }



    formatHitLocations(data)
    {
        if (data.actor.system.combat?.hitLocations)
        {
            let locations = foundry.utils.deepClone(data.actor.system.combat.hitLocations);
            return Object.keys(locations)
                .map(i => 
                {
                    data.actor.system.combat.hitLocations[i].key = i;
                    return data.actor.system.combat.hitLocations[i];
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

    /**
     * By default, Foundry prevents editing of any property that is being affected by Active Effects
     * I don't like this, so to prevent feedback loops of constant updating, diff the update object
     * with the *derived* actor data
     *
     * @param {Object} updateData
     * @returns
     */
    _getSubmitData(updateData = {})
    {
        this.actor.overrides = {};
        const data = super._getSubmitData(updateData);

        // Diff the update with the derived actor data to unwanted constant incremental updates
        const diff = foundry.utils.diffObject(foundry.utils.flattenObject(this.object.toObject(false)), data);
        return diff;
    }

    activateListeners(html)
    {
        super.activateListeners(html);
        if (!this.isEditable)
        {
            return;
        }
        this.addGenericListeners(html);
        html.find(".property-edit").on("change", this._onPropertyEdit.bind(this));
        html.find(".property-toggle").on("click", this._onPropertyToggle.bind(this));
        html.find(".inc-dec").on("mousedown", this._onIncDec.bind(this));
        html.find(".ammo-selector").on("change", this._onChangeAmmo.bind(this));
        html.find(".reload").on("click", this._onReload.bind(this));
        html.find(".roll").on("click", this._onRollClick.bind(this));
        html.find(".trait-action").on("click", this._onTraitClick.bind(this));
        html.find(".remove-singleton").on("click", this._onRemoveSingleton.bind(this));
        html.find(".remove-ref").on("click", this._onRemoveReference.bind(this));
        html.find(".trait-roll").on("click", this._onTraitRoll.bind(this));
        html.find(".target-test").on("click", this._onTargetTest.bind(this));
        html.find(".create-spec").on("click", this._onCreateSpecialisation.bind(this));
        html.find(".warp").on("click", this._onWarpClick.bind(this));
        html.find(".purge").on("click", this._onPurgeClick.bind(this));
        html.find(".resist-effect").on("click", this._onResistEffect.bind(this));
        html.find(".list-summary-context").on("contextmenu", this._onItemSummary.bind(this));
        html.find(".defending-against").on("mouseover", this._onHoverInAttacker.bind(this));
        html.find(".defending-against").on("mouseout", this._onHoverOutAttacker.bind(this));
        html.find(".defending-against").on("click", this._onClickAttacker.bind(this));
        html.find(".defending-against .remove-opposed").on("click", this._onRemoveOpposed.bind(this));
        html.find(".influence .faction-expand").on("click", this._onToggleInfluence.bind(this));
        html.find(".influence-source button").on("click", this._onInfluenceSourceCreate.bind(this));
        html.find(".influence-source input").on("change", this._onInfluenceSourceEdit.bind(this));
        html.find(".influence-source .source-delete").on("click", this._onInfluenceSourceDelete.bind(this));
        html.find(".influence-source button,input,.source-delete").click(ev => ev.stopPropagation());
        html.find(".location").on("click", this._toggleLocationDropdown.bind(this));
        html.find(".list-hover").on("mouseenter", this._onListHoverIn.bind(this));
        html.find(".list-hover").on("mouseleave", this._onListHoverOut.bind(this));
        html.find("button.action").on("click", this._onActionClick.bind(this));
        html.find(".damage-armour").on("mousedown", this._onDamageArmour.bind(this));
        html.find(".trigger-script").on("click", this._onTriggerScript.bind(this));
        html.find(".armour-config").on("click", this._onClickArmourConfig.bind(this));
        html.find(".clear-action").on("click", this._onClearAction.bind(this));
        html.on("click", ".use-item", this._onUseItem.bind(this));
    }


    /**
     *  Generic property editing via the sheet, supports editing items with the `data-id` property,
     *  can specify ("data-collection" as "effects" to edit effects instead)
     */
    _onPropertyEdit(event)
    {
        let target = event.currentTarget.dataset.target;
        let value = event.target.value;

        let document = this._getDocument(event) || this.actor;

        if (Number.isNumeric(value))
        {
            value = Number(value);
        }


        return document.update({[target] : value}).then(updated => 
        {
            if (this._isPatronDocument(updated))
            {
                warhammer.utility.log("Rerendering Sheet from Patron Update");
                this.render(true);
            }
        });
    }

    _onPropertyToggle(event)
    {
        let target = event.currentTarget.dataset.target;
        let document = this._getDocument(event) || this.actor;
        let value = event.target.value;
     
        value = !getProperty(document, target);
     
        return document.update({[target] : value}).then(updated => 
        {
            if (this._isPatronDocument(updated))
            {
                warhammer.utility.log("Rerendering Sheet from Patron Update");
                this.render(true);
            }
        });
    }

    _onIncDec(ev)
    {
        let id = this._getId(ev);
        let item = this.actor.items.get(id);
        let button = ev.button == 0 ? "left" : "right";

        if (button =="left")
        {
            item.update(item.system.increase());
        }
        if (button =="right")
        {
            item.update(item.system.decrease());
        }
    }

    _onChangeAmmo(ev)
    {
        let id = this._getId(ev);
        let item = this.actor.items.get(id);

        item.update({"system.ammo.id" : ev.target.value});
    }

    _onReload(ev)
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

    _onRollClick(ev)
    {
        let type = ev.currentTarget.dataset.type;  // characteristic, skill, etc.
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

    _onTraitClick(ev)
    {
        let itemId = this._getId(ev);      
        if(ev.currentTarget.dataset.action == "attack")
        {
            this.actor.setupTraitTest(itemId);
        }
    }

    _onRemoveSingleton(ev)
    {
        let type = ev.currentTarget.dataset.type;

        this.actor.update(this.actor.system[type]?.delete());
    }

    
    _onRemoveReference(ev)
    {
        ev.stopPropagation();
        this.actor.update({[`${ev.currentTarget.dataset.path}.uuid`] : ""});
    }

    _onTraitRoll(ev)
    {
        let itemId = this._getId(ev);      
        let item = this.actor.items.get(itemId);
        new Roll(item.system.roll.formula).roll({async: true}).then(roll => roll.toMessage({speaker : ChatMessage.getSpeaker({actor : this.actor}), flavor : item.system.roll.label}));
    }

    _onTargetTest(ev)
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

    async _onCreateSpecialisation(ev)
    {
        let skill = this._getKey(ev);
        
        let specialisations = await game.impmal.utility.getAllItems("specialisation");

        specialisations = specialisations.filter(i => i.system.skill == skill);
        let choice = [];
        if (specialisations.length)
        {
            choice = await DocumentChoice.create(specialisations, 1, {text : game.i18n.localize("IMPMAL.ChooseSpecialisation")});
        }

        if (choice[0])
        {
            Item.create(choice[0].toObject(), {parent: this.actor});
        }

        else 
        {
            Item.create({
                type : "specialisation",
                name : game.i18n.format("IMPMAL.SkillSpecialisation", {skill : game.impmal.config.skills[skill]}), 
                system : {skill}, 
            }, {renderSheet:true, parent: this.actor});
        }
            
    }

    _onWarpClick()
    {
        this.actor.setupSkillTest({key : "psychic"}, {context : {warp: this.actor.system.warp.state}});
    }

    _onPurgeClick()
    {
        this.actor.purge();
    }

    _onHoverInAttacker() 
    {
        let test = game.messages.get(this.actor.getFlag("impmal", "opposed"))?.test;
        ChatHelpers.highlightMessage(test.context.messageId);
        TokenHelpers.highlightToken(test.context.speaker.token);
    }

    _onHoverOutAttacker() 
    {
        let test = game.messages.get(this.actor.getFlag("impmal", "opposed"))?.test;
        ChatHelpers.unhighlightMessage(test.context.messageId);
        TokenHelpers.unhighlightToken(test.context.speaker.token);
    }

    _onClickAttacker() 
    {
        let test = game.messages.get(this.actor.getFlag("impmal", "opposed"))?.test;
        ChatHelpers.scrollToMessage(test.context.messageId);
    }

    _onRemoveOpposed()
    {
        this.actor.clearOpposed();
    }

    _onResistEffect(ev)
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

    async _onItemSummary(ev) 
    {
        ev.preventDefault();
        let parent = $(ev.currentTarget).parents(".list-item");
        let summary = parent.find(".summary");
        let document = this._getDocument(ev);
    
        if (summary.hasClass("active")) // If summary active, remove
        {
            summary.slideUp(200, () => summary.empty());
            summary.toggleClass("active");
        }
        else 
        {
            // Add a div with the item summary below the item
            let summaryData = await document?.system?.summaryData();
            if (!summaryData)
            {
                warhammer.utility.log(`No Summary Data found for Document ${document?.name}`, {force : true});
                return;
            }

            let summaryHTML = await renderTemplate("systems/impmal/templates/item/partials/item-summary.hbs", summaryData);

            summary.hide();
            summary.html(summaryHTML);
            summary.slideDown(200);
            summary.toggleClass("active");
        }
    }

    
    _onToggleInfluence(ev)
    {
        let target = ev.currentTarget;
        let sources = $(target).parents(".list-item").find(".influence-source");
        let faction = this._getType(ev);

        if (sources.hasClass("collapsed"))
        {
            sources.slideDown({
                duration: 200, 
                start: () => sources.css("display", "flex")
            });

            sources.toggleClass("expanded");
            sources.toggleClass("collapsed");
            this.factionsExpanded[faction] = true;
        }
        else 
        {
            sources.slideUp(200);
            sources.toggleClass("collapsed");
            sources.toggleClass("expanded");
            delete this.factionsExpanded[faction];
        }
    }

    
    _onInfluenceSourceEdit(ev)
    {
        ev.stopPropagation();
        let index = this._getIndex(ev);
        let faction = this._getType(ev);
        let property = ev.currentTarget.dataset.property;
        let value = ev.target.value;
        if (Number.isNumeric(value))
        {
            value = Number(value);
        }
        this.actor.update({"system.influence" : this.actor.system.influence.editSource(faction, index, {[property] : value})});
    }

    _onInfluenceSourceDelete(ev)
    {
        ev.stopPropagation();
        let index = this._getIndex(ev);
        let faction = this._getType(ev);
        this.actor.update({"system.influence" : this.actor.system.influence.deleteSource(faction, index)});
    }

    _onInfluenceSourceCreate(ev)
    {
        ev.stopPropagation();
        let faction = this._getType(ev);
        this.actor.update({"system.influence" : this.actor.system.influence.addSource(faction)});
    }

    _onListHoverIn(ev)
    {
        let img = $(ev.currentTarget).find("img");
        let button = $(ev.currentTarget).find(".use-item");
        if (img.length)
        {
            img.hide();
            if (button.length == 0)
            {
                $(`<a class="use-item"><i class="fa-solid fa-comment"></i></a>`).insertAfter(img);
            }
        }
    }
    
    _onListHoverOut(ev)
    {
        let img = $(ev.currentTarget).find("img");
        let button = $(ev.currentTarget).find(".use-item");
        if (img.length)
        {
            img.show();
        }
        if (button.length)
        {
            button.remove();
        }
    }


    _onActionClick(ev)
    {
        this.actor.useAction(ev.target.dataset.action);
    }

    _onUseItem(ev)
    {
        ev.stopPropagation();
        let uuid = this._getUUID(ev);
        let id = this._getId(ev);

        return this.actor.useItem({id, uuid});
    }
    
    _onClickArmourConfig()
    {
        new ArmourConfig(this.object).render(true);
    }

    _onClearAction()
    {
        this.actor.clearAction();
    }

    _onDamageArmour(ev)
    {
        ev.stopPropagation();
        let key = this._getKey(ev);
        let id = this._getId(ev);
        let value = ev.button == 0 ? 1 : -1;
        this.actor.damageArmour(key, value, this.actor.items.get(id));
    }

    _toggleLocationDropdown(ev)
    {
        let details = $(ev.currentTarget).find(".location-details");
        if (details.hasClass("collapsed"))
        {
            details.slideDown(200);
        }
        else 
        {
            details.slideUp(200);
        }
        details.toggleClass("collapsed");
    }

    //#endregion
}