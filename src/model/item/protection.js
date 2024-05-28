import { StringListModel } from "../shared/list";
import { EquippableItemModel } from "./components/equippable";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class ProtectionModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel),
        schema.category = new fields.StringField();
        schema.armour = new fields.NumberField();
        schema.locations = new fields.EmbeddedDataField(LocationListModel);
        schema.damage = new fields.ObjectField({});
        schema.rended = new fields.ObjectField({});
        return schema;
    }

    static labelMap = {
        "all" : ["rightLeg", "leftLeg", "rightArm", "leftArm", "body", "head"],
        "arms" : ["rightArm", "leftArm"],
        "legs" : ["rightLeg", "leftLeg"],
        "body" : ["body"],
        "head" : ["head"]
    };

    computeBase() 
    {
        super.computeBase();
        this.traits.compute();
    }

    computeOwnerDerived(actor) 
    {
        // Must put this in OwnerDerived, as normal preparation applies double
        // See https://github.com/foundryvtt/foundryvtt/issues/7987
        if (this.traits.has("mastercrafted"))
        {
            this.armour += 2;
        }
    }

    async preUpdateChecks(data)
    {
        await super.preUpdateChecks(data);
        // If location label is modified, try to parse which location keys to use
        let locationLabel = getProperty(data, "system.locations.label");
        if (locationLabel)
        {
            let keys = [];
            let locations = locationLabel.split(",").map(i => i.trim());
            for(let loc of locations)
            {
                keys = keys.concat(this.constructor.labelMap[loc.toLowerCase()] || []);
            }
            if (keys.length)
            {
                data.system.locations.list = keys;
            }
        }

        let damage = getProperty(data, "system.damage");
        if (damage)
        {
            for(let key in damage)
            {
                damage[key] = Math.clamped(damage[key], 0, this.armour);
            }
        }
    }

    get isDamaged() 
    {
        return Object.values(this.damage).some(i => i > 0);
    }

    get isRended() 
    {
        return Object.values(this.rended).some(i => i);
    }

    
    async summaryData()
    {
        let data = await super.summaryData();
        data.details.item.protection = `${game.i18n.localize("IMPMAL.Protection")}: ${this.protection}`,
        data.tags = data.tags.concat(
            game.impmal.config.protectionTypes[this.category], 
            game.i18n.format("IMPMAL.ItemDisplayXArmour", {armour : this.armour}), 
            this.traits.htmlArray);
        return data;
    }


}

class LocationListModel extends StringListModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.label = new fields.StringField();
        return schema;
    }

}
