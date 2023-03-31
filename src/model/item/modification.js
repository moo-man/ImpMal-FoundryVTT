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
        return schema;
    }

    
    computeBase() 
    {
        super.computeBase();
        this.addedTraits.compute();
        this.removedTraits.compute();
    }
}

export class ModListModel extends ListModel 
{
    defaultValue = {};

    prepareMods()
    {
        this.documents = this.list.map(e => new ImpMalItem(e));
    }
}