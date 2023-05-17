import { SocketHandlers } from "../../system/socket-handlers";
import ImpMalSheetMixin from "../mixins/sheet-mixin";

export default class ImpMalActorSheet extends ImpMalSheetMixin(ActorSheet)
{
    static get defaultOptions()
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "actor"]);
        options.resizable = true;
        options.scrollY = [".tab-content"];
        options.tabs = [{ navSelector: ".sheet-tabs", contentSelector: ".tab-content", initial: "main" }];
        options.dragDrop.push({dragSelector : ".list .list-item"});
        return options;
    }

    get template()
    {
        return `systems/impmal/templates/actor/${this.actor.type}-sheet.hbs`;
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
        return data;
    }


    organizeItems(data)
    {
        let sheetItems = data.actor.itemCategories;

        for(let key in sheetItems)
        {
            if (sheetItems[key] instanceof Array)
            {
                sheetItems[key] = sheetItems[key].sort((a, b) => a.sort - b.sort);
            }
        }

        sheetItems.equipped = {
            melee : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.attackType == "melee"),
            ranged : sheetItems.weapon.filter(i => i.system.equipped.value && i.system.attackType == "ranged"),
            protection : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category != "shield"),
            shield : sheetItems.protection.filter(i => i.system.equipped.value).filter(i => i.system.category == "shield"),
            equipment : sheetItems.equipment.filter(i => i.system.equipped.value)
        };


        return sheetItems;
    }

    organizeEffects(data)
    {
        let sorted = data.actor.effects.contents.sort((a, b) => a.sort - b.sort);
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
            return Object.values(data.actor.system.combat.hitLocations)
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
        html.find(".property-edit").on("click", this._onPropertyEdit.bind(this));
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
        html.find(".list-summary-context").on("contextmenu", this._onItemSummary.bind(this));
    }



    /**
     *  Generic property editing via the sheet, supports editing items with the `data-id` property,
     *  can specify ("data-collection" as "effects" to edit effects instead)
     */
    _onPropertyEdit(event)
    {
        let id = this._getId(event);
        let target = event.currentTarget.dataset.target;
        let collection = event.currentTarget.dataset.collection || "items";
        let value = event.target.value;

        let doc = this.actor;
        if (id)
        {
            doc = this.actor[collection].get(id);
        }

        if (Number.isNumeric(value))
        {
            value = Number(value);
        }
        else if (event.currentTarget.classList.contains("boolean")) // toggling a boolean
        {
            value = !getProperty(doc, target);
        }


        return doc.update({[target] : value});
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

        this.actor.system[type]?.document?.delete();
    }

    
    _onRemoveReference(ev)
    {
        ev.stopPropagation();
        this.actor.update({[`${ev.currentTarget.dataset.path}.id`] : ""});
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

    _onCreateSpecialisation(ev)
    {
        let skill = this._getKey(ev);      

        Item.create({
            type : "specialisation",
            name : game.i18n.format("IMPMAL.SkillSpecialisation", {skill : game.impmal.config.skills[skill]}), 
            system : {skill}, 
        }, {renderSheet:true, parent: this.actor});
    }

    _onWarpClick()
    {
        this.actor.setupSkillTest({key : "psychic"}, {warp: this.actor.system.warp.state});
    }

    _onPurgeClick()
    {
        this.actor.setupSkillTest({key: "discipline", name: game.i18n.localize("IMPMAL.Psychic")}, {purge: true,  title : {append : ` - ${game.i18n.localize("IMPMAL.Purge")}`}});
    }

    async _onItemSummary(ev) 
    {
        ev.preventDefault();
        let parent = $(ev.currentTarget).parents(".list-item");
        let summary = parent.find(".summary");
        let id = this._getId(ev);
    
        if (summary.hasClass("active")) // If summary active, remove
        {
            summary.slideUp(200, () => summary.empty());
            summary.toggleClass("active");
        }
        else 
        {
            // Add a div with the item summary below the item
            let item = this.actor.items.get(id);
            if (!item)
            {
                return;
            }
            let summaryData = item.system.summaryData();
            let summaryHTML = await renderTemplate("systems/impmal/templates/item/partials/item-summary.hbs", summaryData);

            summary.hide();
            summary.html(summaryHTML);
            summary.slideDown(200);
            summary.toggleClass("active");
        }
    }

    //#endregion
}