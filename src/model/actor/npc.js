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

    _addModelProperties()
    {
        super._addModelProperties();
        this.faction.relative = this.parent.items
    }

    computeDerived()
    {
        super.computeDerived();
        this.computeRole();
    }

    computeRole()
    {
        if (this.autoCalc.criticals)
        {

            if (this.role == "troop") {
                this.combat.criticals.max = 0;
            }
            else if (this.role == "elite" && this.autoCalc.criticals) {
                this.combat.criticals.max += 1;
            }
            else if (this.autoCalc.criticals) {
                this.combat.criticals.max += this.characteristics.tgh.bonus;
            }
        }
    }

    embedData(options)
    {
        try 
        {
            let data = super.embedData(options);

            let armour = this.combat.armour.value;
            if (this.combat.armour.formula)
            {
                armour = `${this.combat.armour.formula} + ${armour}`;
            }

            let skills = [];
            for (let skillKey in this.skills)
            {
                let skill = this.skills[skillKey];
                // Only include skills in the main tab if they have advances
                if (skill.advances > 0)
                {
                    skills.push(`${game.impmal.config.skills[skillKey]} ${skill.total}`);
                }

                for(let skillItem of skill.specialisations)
                {
                    if (skillItem.system.advances > 0)
                    {
                        skills.push(`${skillItem.system.skillNameAndTotal}`);
                    }
                }
            }

            let physicalTypes = Object.keys(game.template.Item).filter(i => game.template.Item[i].templates?.includes("physical"));
            let possessions = this.parent.items.filter(i => physicalTypes.includes(i.type));

            let traits = this.parent.itemTypes.trait.filter(i => i.system.notes.player).map(i => {
                return i.system.notes.player.replace("<p>", `<p><strong>${i.name}</strong>: `)
            });
        

            return foundry.utils.mergeObject(data, {
                armour, 
                skills: skills.join(", "), 
                traits : traits.join(""),
                possessions: possessions.map(i => `@UUID[${i.uuid}]`).join(", ")
            })
        }
        catch(e)
        {
            return "Error getting embed data for " + this.parent.name
        }

    }

}

