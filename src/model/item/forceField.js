import { EquippableItemModel } from "./components/equippable";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class ForceFieldModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel),
        schema.protection = new fields.StringField();
   
        schema.overload = new fields.SchemaField({
            value : new fields.NumberField(),
            collapsed : new fields.BooleanField()
        });
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }

    /**
     * 
     * @param {Number} damage Damage value to reduce
     * @param {Array} modifiers List of {value, label} objects for damage reduction sources
     * @returns Reduced damage
     */
    async applyField(damage, modifiers)
    {
        let roll = await new Roll(this.protection).roll({async: true});
        if (damage >= this.overload.value)
        {
            this.parent.update({"system.equipped.value" : false, "system.overload.collapsed" : true});
            ui.notifications.notify(game.i18n.localize("IMPMAL.ForceFieldCollapsed"));
        }
        roll.toMessage({flavor : game.i18n.localize("IMPMAL.ForceFieldProtection"), speaker : {alias: this.parent.name}});

        if (modifiers instanceof Array)
        {
            modifiers.push({value : -roll.total, label : game.i18n.localize("IMPMAL.Forcefield")});
        }
        
        return damage - roll.total;
    }

    async preUpdateChecks(data)
    {
        await super.preUpdateChecks(data);
        if (data?.system?.equipped?.value == true && this.overload.collapsed)
        {
            data.system.equipped.value = false;
            ui.notifications.notify(game.i18n.localize("IMPMAL.CannotEquipForceField"));
        }
    }

    summaryData()
    {
        let data = super.summaryData();
        data.details.item.protection = `${game.i18n.localize("IMPMAL.Protection")}: ${this.protection}`,
        data.details.item.overload = `${game.i18n.localize("IMPMAL.Overload")}: ${this.overload.value}`,
        data.tags = data.tags.concat(this.traits.htmlArray);
        return data;
    }
}