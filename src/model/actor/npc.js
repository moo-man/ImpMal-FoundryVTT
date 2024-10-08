import { NPCCombatModel } from "./components/combat";
import { StandardActorModel } from "./standard";
let fields = foundry.data.fields;

export class NPCModel extends StandardActorModel 
{
    static singletonItemPaths = {"faction" : "faction"};
    static preventItemTypes = ["role", "boonLiability", "origin"];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.combat = new fields.EmbeddedDataField(NPCCombatModel);
        schema.species = new fields.StringField();
        schema.role = new fields.StringField();
        schema.faction = new fields.EmbeddedDataField(SingletonItemModel);
        return schema;
    }

    computeDerived()
    {
        super.computeDerived();
        this.computeRole();
    }

    computeRole()
    {
        if (this.role == "troop")
        {
            // Initialized already to 0
        }
        else if (this.role == "elite")
        {
            this.combat.criticals.max += 1;
        }
        else 
        {
            this.combat.criticals.max += this.characteristics.tgh.bonus;
        }
    }

}

