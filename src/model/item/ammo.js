import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class AmmoModel extends PhysicalItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.ammo"];

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

    async applyCustomAmmo(ammo)
    {
        // Abort if this ammo is also custom, or if the applied ammo is not custom
        if (this.custom || !ammo.system.custom) 
        {
            return ui.notifications.error("IMPMAL.ErrorApplyCustomAmmo", {localize : true});
        }
         
        return this.parent.update({
            name: this.parent.name += ` (${ammo.name})`,
            system : {
                cost : ammo.system.priceMultiplier * this.cost,
                availability : ammo.system.availability,
                addedTraits : ammo.system.addedTraits,
                removedTraits : ammo.system.removedTraits,
                usedWith : ammo.system.usedWith,
                damage : ammo.system.damage
            }
        }).then(item => item.createEmbeddedDocuments("ActiveEffect", ammo.effects.contents));
    }
}