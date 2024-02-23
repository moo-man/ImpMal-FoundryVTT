import { ImpMalItem } from "../../document/item";
import { ListModel } from "../shared/list";
import { PhysicalItemModel } from "./components/physical";
import { TraitListModel } from "./components/traits";
let fields = foundry.data.fields;

export class ModificationModel extends PhysicalItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
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
        return super.shouldTransferEffect(effect) && this.weapon?.system?.shouldTransferEffect(effect);
    }
}

export class ModListModel extends ListModel 
{
    defaultValue = {};

    prepareMods(weapon)
    {
        this.documents = this.list.map(e => new ImpMalItem(e));
        for(let mod of this.documents)
        {
            mod.system.weapon = weapon;
            // If a mod is disabled, make sure all its effects are disabled
            mod.effects.contents.forEach(e => 
            {
                e.disabled = mod.system.disabled;
            });
        }
    }
}