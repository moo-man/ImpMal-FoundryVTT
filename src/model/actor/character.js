import { CharacterCombatModel } from "./components/combat";
import { ListModel } from "../shared/list";
import { StandardActorModel } from "./standard";
import { HandsModel } from "./components/hands";
import { XPModel } from "./components/xp";
import { ImpMalEffect } from "../../document/effect";
import { SingletonItemModel } from "../shared/singleton-item";
import { DocumentReferenceModel } from "../shared/reference";
import { ActorInfluenceModel } from "./components/influence";
let fields = foundry.data.fields;

export class CharacterModel extends StandardActorModel 
{
    static preventItemTypes = ["boonLiability", "duty"];
    static singletonItemTypes = ["role", "faction", "origin"];

    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.patron = new fields.EmbeddedDataField(DocumentReferenceModel);
        schema.origin = new fields.EmbeddedDataField(SingletonItemModel);
        schema.faction = new fields.EmbeddedDataField(SingletonItemModel);
        schema.role = new fields.EmbeddedDataField(SingletonItemModel);
        schema.handed = new fields.StringField();
        schema.solars = new fields.NumberField({initial: 0});
        schema.combat = new fields.EmbeddedDataField(CharacterCombatModel);
        schema.xp = new fields.EmbeddedDataField(XPModel);
        schema.details = new fields.SchemaField({
            age : new fields.NumberField(),
            feature : new fields.StringField(),
            eyes : new fields.StringField(),
            hair : new fields.StringField(),
            height : new fields.StringField(),
            weight : new fields.StringField(),
            divination : new fields.StringField(),
            species : new fields.StringField()
        });
        schema.goal = new fields.SchemaField({
            short : new fields.StringField(),
            long : new fields.StringField()
        });
        schema.corruption = new fields.SchemaField({
            max : new fields.NumberField({initial: 0, min: 0}),
            value : new fields.NumberField({initial: 0, min: 0})
        });
        schema.fate = new fields.SchemaField({
            max : new fields.NumberField({initial: 3}),
            value : new fields.NumberField({initial: 3})
        });
        schema.augmetics = new fields.SchemaField({
            max : new fields.NumberField({initial: 0}),
            value : new fields.NumberField({initial: 0})
        });
        schema.connections = new fields.EmbeddedDataField(ListModel);
        schema.influence = new fields.EmbeddedDataField(ActorInfluenceModel);
        schema.hands = new fields.EmbeddedDataField(HandsModel);
        return schema;
    }

    async preCreateData(data, options) 
    {
        let preCreateData = await super.preCreateData(data, options);
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

    
    async preUpdateChecks(data, options)
    {
        await super.preUpdateChecks(data, options);
        // Warp state is both computed and saved
        // If charge is below threshold, it is computed => state = 0
        if (data?.system?.warp?.charge < this.warp.threshold)
        {
            data.system.warp.state = 0;
            return data;
        }
    }

    async updateChecks(data, options)
    {
        await super.updateChecks(data, options);
        this._checkEncumbranceEffects(this.parent);
    }

    computeBase(items)
    {
        super.computeBase(items);
        this.combat.superiority = game.impmal.superiority.value;
        this.patron.getDocument(game.actors);
        this.influence.initialize();
    }


    computeDerived(items)
    {
        super.computeDerived(items);
        this.augmetics.max += this.characteristics.tgh.bonus;
        this.augmetics.value = items.augmetic.length;
        this.corruption.max += (this.characteristics.tgh.bonus + this.characteristics.wil.bonus);
        this.hands.getDocuments(items.all);
        this.origin.getDocument(items.all);
        this.faction.getDocument(items.all);
        this.role.getDocument(items.all);
        this.xp.spent = XPModel.computeSpentFor(this.parent);
        this.xp.available = this.xp.total - this.xp.spent;
        this.influence.compute(Array.from(this.parent.allApplicableEffects()), items, this.parent.type, this.patron.document?.system?.influence);
    }

    _checkEncumbranceEffects(actor)
    {
        let overburdened = actor.hasCondition("overburdened");
        let restrained = actor.hasCondition("restrained");
        let effect;

        if (actor.system.encumbrance.state == 0)
        {
            if (overburdened?.isComputed)
            {
                overburdened.delete();
            }
            if (restrained?.isComputed)
            {
                restrained.delete();
            }
        }

        else if (actor.system.encumbrance.state == 1)
        {
            if (!overburdened)
            {   
                effect = ImpMalEffect.findEffect("overburdened");
            }

            if (restrained?.isComputed)
            {
                restrained.delete();
            }
        }
        else if (actor.system.encumbrance.state == 2)
        {
            if (!restrained)
            {   
                effect = ImpMalEffect.findEffect("restrained");
            }
        }

        if (effect)
        {
            let data = ImpMalEffect.getCreateData(effect);
            setProperty(data, "flags.impmal.computed", true);
            ImpMalEffect.create(data, {parent : actor});
        }

    }


    static migrateData(data)
    {
        if (Number.isNumeric(data.corruption))
        {
            data.corruption = {
                value : data.corruption,
                max : 0
            };
        }
    }
}

