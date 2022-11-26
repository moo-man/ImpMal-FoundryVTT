import { CharacterCombatModel } from "./components/combat";
import { InfluenceModel } from "../shared/influence";
import { ListModel } from "./components/list";
import { StandardActorModel } from "./standard";
let fields = foundry.data.fields;

export class CharacterModel extends StandardActorModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.handed = new fields.StringField();
        schema.solars = new fields.NumberField();
        schema.combat = new fields.EmbeddedDataField(CharacterCombatModel);
        schema.xp = new fields.SchemaField({
            available : new fields.NumberField(),
            spent : new fields.NumberField()
        });
        schema.details = new fields.SchemaField({
            age : new fields.NumberField(),
            feature : new fields.StringField(),
            eyes : new fields.StringField(),
            hair : new fields.StringField(),
            height : new fields.StringField()
        });
        schema.goal = new fields.SchemaField({
            short : new fields.StringField(),
            long : new fields.StringField()
        });
        schema.divinations = new fields.StringField();
        schema.corruption = new fields.NumberField();
        schema.fate = new fields.SchemaField({
            max : new fields.NumberField(),
            current : new fields.NumberField()
        });
        schema.connections = new fields.EmbeddedDataField(ListModel);
        schema.influence = fields.EmbeddedDataField(InfluenceModel);
        return schema;
    }

    preCreateData(data) 
    {
        let preCreateData = super.preCreateData(data);
        if (!data.prototypeToken)
        {
            mergeObject(preCreateData, {
                "prototypeToken.sight" : {enabled : true},
                "prototypeToken.actorLink" : true,
                "prototypeToken.disposition" : CONST.TOKEN_DISPOSITIONS.FRIENDLY
            });
        }
        return preCreateData;
    }


    computeDerived()
    {
        super.computeDerived();
        this.xp.total = this.xp.available + this.xp.spent;
    }
}

