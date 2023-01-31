import { SingletonItemModel } from "../shared/singleton-item";
import { NPCCombatModel } from "./components/combat";
import { StandardActorModel } from "./standard";
let fields = foundry.data.fields;

export class NPCModel extends StandardActorModel 
{
    static singletonItemTypes = ["faction"];
    static preventItemTypes = ["duty", "role", "boonLiability", "origin"];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.combat = new fields.EmbeddedDataField(NPCCombatModel);
        schema.species = new fields.StringField();
        schema.role = new fields.StringField();
        schema.faction = new fields.EmbeddedDataField(SingletonItemModel);
        schema.warp = new fields.SchemaField({
            charge : new fields.NumberField({min: 0}),
        });
        return schema;
    }

    computeDerived(items)
    {
        super.computeDerived(items);
        this.faction.getDocument(items.all);
        this.warp.threshold = this.characteristics.wil.bonus;
        this.computeRole();
    }

    computeRole()
    {
        if (this.role == "troop")
        {
            this.combat.criticals.max = 0;
        }
        else if (this.role == "elite")
        {
            this.combat.criticals.max = 1;
        }
    }

}

