import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class AmmoModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.custom = new fields.BooleanField();
        schema.priceMultiplier = new fields.NumberField({initial: 1, min: 1});
        schema.addedTraits = new fields.EmbeddedDataField(TraitListModel);
        schema.removedTraits = new fields.EmbeddedDataField(TraitListModel);
        schema.usedWith = new fields.StringField();
        schema.damage = new fields.NumberField();
        return schema;
    }

    computeBase() 
    {
        super.computeBase();
        this.addedTraits.compute();
        this.removedTraits.compute();
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.details.item.damage = game.i18n.format("IMPMAL.ItemDisplayXDamage", {damage : this.damage});
        data.details.item.usedWith = game.i18n.format("IMPMAL.ItemDisplayUsedWith", {usedWith : this.usedWith});
        return data;
    }

    async allowCreation(data, options, user)
    {
        let allowed = await super.allowCreation();
        
        if (allowed && this.parent.actor && this.custom)
        {
            ui.notifications.error("Custom ammo must be applied to another non-custom ammo type");
            allowed = false; 
        }
        return allowed;
    }
}