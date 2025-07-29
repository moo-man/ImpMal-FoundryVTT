import { EquipSlots } from "./components/equip-slots";
import { EquippableItemModel } from "./components/equippable";
import { HitLocationsModel } from "./components/hit-locations";
import { TraitListModel } from "./components/traits";
import { ModListModel } from "./modification";
let fields = foundry.data.fields;

export class ProtectionModel extends EquippableItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.protection"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.traits = new fields.EmbeddedDataField(TraitListModel),
        schema.category = new fields.StringField();
        schema.armour = new fields.NumberField();
        schema.locations = new fields.EmbeddedDataField(HitLocationsModel);
        schema.damage = new fields.ObjectField({});
        schema.rended = new fields.ObjectField({});
        schema.slots = new fields.EmbeddedDataField(EquipSlots);
        schema.mods = new fields.EmbeddedDataField(ModListModel);
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
        this.mods.prepareMods(this.parent);
        this.traits.compute();
    }

    getOtherEffects()
    {
        return super.getOtherEffects()
        .concat(Object.values(this.traits.traitEffects("protection")))
        .concat(this.categoryEffect || [])
        .concat((this.mods.documents || [])
            .reduce((prev, current) => prev.concat(current.effects.contents), []));
    }

    computeOwned(actor) 
    {
        // Must put this in OwnerDerived, as normal preparation applies double
        // See https://github.com/foundryvtt/foundryvtt/issues/7987
        
        this._applyModifications();

        if (this.traits.has("mastercrafted"))
        {
            this.armour += 2;
        }
    }

    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user);
            
        // If location label is modified, try to parse which location keys to use
        let locationLabel = foundry.utils.getProperty(options.changed, "system.locations.label");
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

        let damage = foundry.utils.getProperty(options.changed, "system.damage");
        if (damage)
        {
            for(let key in damage)
            {
                damage[key] = Math.clamp(damage[key], 0, this.armour);
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

    get categoryEffect()
    {
        let effectData = game.impmal.config.protectionCategoryEffects[this.category];
        if (effectData)
        {
            let effect = new ActiveEffect.implementation(effectData, {parent: this.parent});
            effect.updateSource({img : this.parent.img, "flags.impmal.path" : `${this.schema.fieldPath}.categoryEffect`})
            return effect;
        }
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

    _addModelProperties()
    {
        if (this.parent.actor)
        {
            this.slots.relative = this.parent.actor.items;
            this.slots.list.forEach(i => i.relative = this.slots.relative);
        }
    }
}