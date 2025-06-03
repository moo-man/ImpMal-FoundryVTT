import { CharacterCombatModel } from "./components/combat";
import { StandardActorModel } from "./standard";
import { HandsModel } from "./components/hands";
import { XPModel } from "./components/xp";
import { ImpMalEffect } from "../../document/effect";
import { ActorInfluenceModel } from "./components/influence";
let fields = foundry.data.fields;

export class CharacterModel extends StandardActorModel 
{
    static preventItemTypes = ["boonLiability"];
    static singletonItemPaths = {
        "role" : "role", 
        "faction" : "faction",  
        "origin" : "origin"
    };

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
            gender : new fields.StringField(),
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
        schema.connections = ListModel.createListModel(new fields.StringField());
        schema.influence = new fields.EmbeddedDataField(ActorInfluenceModel);
        schema.hands = new fields.EmbeddedDataField(HandsModel);

        schema.autoCalc.fields.corruption = new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.AutoCalc.Corruption"}, {name : "corruption", parent : schema.autoCalc});
        return schema;
    }

    async _preCreate(data, options, user) 
    {
        await super._preCreate(data, options, user);
        if (!data.prototypeToken)
        {
            this.parent.updateSource({
                "prototypeToken.sight" : {enabled : true},
                "prototypeToken.actorLink" : true,
                "prototypeToken.disposition" : CONST.TOKEN_DISPOSITIONS.FRIENDLY
            });
        }
    }

    
    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user);
        // Warp state is both computed and saved
        // If charge is below threshold, it is computed => state = 0
        if (data?.system?.warp?.charge < this.warp.threshold)
        {
            data.system.warp.state = 0;
        }

        if (options.changed.system?.xp?.total && !options.skipXPReason)
        {
            let reason = await ValueDialog.create({title : "XP Change", text : "Reason for XP Change?"});
            foundry.utils.mergeObject(data.system.xp, this.xp.log.add({xp : options.changed.system?.xp?.total - this.xp.total, reason : reason || "Unspecified Reason", total : options.changed.system?.xp?.total}));
        }
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        if (user != game.user.id)
        {
            return;
        }
        
        this._checkEncumbranceEffects(this.parent);
    }

    
    _addModelProperties()
    {
        super._addModelProperties();
        this.hands.left.relative = this.parent.items;
        this.hands.right.relative = this.parent.items;
        this.origin.relative = this.parent.items
        this.faction.relative = this.parent.items
        this.role.relative = this.parent.items
    }

    computeBase()
    {
        super.computeBase();
        this.combat.superiority = game.impmal.resources.get("superiority");
        if (this.autoCalc.corruption)
        {
            this.corruption.max = 0;
        }
        this.influence.initialize();
    }


    computeDerived()
    {
        super.computeDerived();
        this.augmetics.max += this.characteristics.tgh.bonus;
        this.augmetics.value = this.parent.itemTypes.augmetic.length;
        if (this.autoCalc.corruption)
        {
            this.corruption.autoCalc = true;
            this.corruption.max += (this.characteristics.tgh.bonus + this.characteristics.wil.bonus);
        }
        this.xp.spent = XPModel.computeSpentFor(this.parent);
        this.xp.available = this.xp.total - this.xp.spent;
        this.influence.compute(Array.from(this.parent.allApplicableEffects()), this.parent.itemTypes, this.parent.type, this.patron.document?.system?.influence);
    }

    applyReward({xp, solars, reason})
    {
        let update = { system : {}};

        if (solars)
        {
            update.system.solars = this.solars + solars;
        }

        if (xp)
        {
            // Add to log
            update.system.xp = this.xp.log.add({reason : reason || "Unspecified Reason", xp, total : this.xp.total + xp});

            // Add to actual numerical total
            update.system.xp.total = this.xp.total + xp;
        }

        return update;
    }
    
    async applyCorruption({exposure, corruption, skill})
    {
        if (!skill)
        {

            skill = await foundry.applications.api.DialogV2.wait({
                window: { title: game.i18n.localize("IMPMAL.CorruptionPrompt") },
                content: game.i18n.localize("IMPMAL.CorruptionPromptContent"),
                buttons:
                    [{
                        action: "fortitude",
                        label: game.i18n.localize("IMPMAL.Fortitude"),
                    },
                    {
                        action: "discipline",
                        label: game.i18n.localize("IMPMAL.Discipline"),
                    }
                    ]
            })
        }
        if (!corruption) 
        {
            corruption = game.impmal.config.corruptionValues[exposure]
        }
        await this.parent.setupSkillTest({ key: skill }, {fields : {rollMode : "gmroll"}, appendTitle: ` – ${game.i18n.localize("IMPMAL.Corruption")}`, corruption});
    }

    async rollMutation(skill)
    {
        if (!skill)
        {

            skill = await foundry.applications.api.DialogV2.wait({
                window: { title: game.i18n.localize("IMPMAL.SuccumbingToCorruption") },
                content: game.i18n.localize("IMPMAL.MutationPromptContent"),
                buttons:
                    [{
                        action: "fortitude",
                        label: game.i18n.localize("IMPMAL.Fortitude"),
                    },
                    {
                        action: "discipline",
                        label: game.i18n.localize("IMPMAL.Discipline"),
                    }
                    ]
            })
        }
        await this.parent.setupSkillTest({ key: skill }, {fields : {rollMode : "gmroll"}, appendTitle: ` – ${game.i18n.localize("IMPMAL.SuccumbingToCorruption")}`, mutation : true });
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

