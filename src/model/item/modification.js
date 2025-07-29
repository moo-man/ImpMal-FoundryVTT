import { ImpMalItem } from "../../document/item";
import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class ModificationModel extends PhysicalItemModel
{
    static LOCALIZATION_PREFIXES = ["WH.Models.modification"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.type = new fields.StringField({initial: "weapon", choices : {weapon : "IMPMAL.Weapon", protection : "IMPMAL.Armour"}});
        schema.category = new fields.StringField();
        schema.usedWith = new fields.StringField();
        schema.addedTraits = new fields.EmbeddedDataField(TraitListModel);
        schema.removedTraits = new fields.EmbeddedDataField(TraitListModel);
        schema.disabled = new fields.BooleanField({initial : false});
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

        data.details.item.addedTraits = `<strong>${game.i18n.localize("IMPMAL.TraitsAdded")}</strong>: ${this.addedTraits.htmlArray}`,
        data.details.item.removedTraits = `<strong>${game.i18n.localize("IMPMAL.TraitsRemoved")}</strong>: ${this.removedTraits.htmlArray}`,
        data.details.item.addedTraits = game.i18n.format("IMPMAL.ItemDisplayXDamage", {damage : this.damage});
        data.details.item.usedWith = game.i18n.format("IMPMAL.ItemDisplayUsedWith", {usedWith : this.usedWith});
        data.tags.push(game.impmal.config.modificationTypes[this.category]);
        return data;
    }

    shouldTransferEffect(effect)
    {
        return super.shouldTransferEffect(effect);// && this.onDocument?.system?.shouldTransferEffect(effect);
    }

    effectIsApplicable(effect)
    {
        return false;
    }
}

export class ModListModel extends ListModel 
{
    static get listSchema() {return new foundry.data.fields.ObjectField()};

    effects={};

    prepareMods(document)
    {
        this.documents = this.list.map(e => new ImpMalItem(e));
        for(let mod of this.list)
        {
            // Store mod effects in a object (with id as keys) so manual scripts can work
            mod.effects.forEach(e => 
            {
                let modEffect = new ActiveEffect.implementation(e, {parent : document});
                foundry.utils.setProperty(modEffect, "flags.impmal.path", "system.mods.effects." + modEffect.id);
                
                modEffect.disabled = mod.system.disabled;
                this.effects[modEffect.id] = modEffect;
            });
        }
    }

}