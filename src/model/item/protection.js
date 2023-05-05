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

    preUpdateChecks(data)
    {
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
    }

    
    summaryData()
    {
        let data = super.summaryData();
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
