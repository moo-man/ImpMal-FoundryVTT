import { SkillTest } from "../skill/skill-test";
import { AttackEvaluator } from "./attack-evaluator";


/**
 * Used by both Weapons and Traits to perform attacks
 */
export class AttackTest extends SkillTest
{

    static evaluatorClass = AttackEvaluator;
    testDetailsTemplate = "systems/impmal/templates/chat/rolls/details/attack-test.hbs";

    constructor({data, context, result})
    {
        data.computeDoubles = true;
        super({data, context, result});
    }

    get tags() 
    {
        let tags = super.tags;
        if (this.result.fumble)
        {
            tags.push(`<a class="table-roll color-negative fumble" data-table="fumble" data-formula="1d10"><i class="fa-solid fa-dice-d10"></i>${game.i18n.localize("IMPMAL.Fumble")}</a>`);
            if (this.itemTraits.has("reliable"))
            {
                tags.push(`<span>[[/r 1d10]]{${game.i18n.localize("IMPMAL.Reliable")}}</span>`);
            }
        }
        if (this.result.supercharge)
        {
            tags.push(`${game.i18n.localize("IMPMAL.Supercharge")} (+${this.itemTraits.has("supercharge").value})`);
        }
        return tags;
    }

    get itemTraits() 
    {
        let cloned = (this.item.system.traits || this.item.system.attack?.traits)?.clone();
        if (this.item.system.mods?.list)
            for (let mod of this.item.system.mods.documents) {
                // Add traits
                cloned.combine(mod.system.addedTraits);

                // Remove Traits
                cloned.list = cloned.list.filter(t => {
                    let removed = mod.system.removedTraits.has(t.key);
                    if (removed) {
                        if (Number.isNumeric(t.value)) {
                            t.value -= (removed.value || 0);
                        }

                        // If boolean trait, or trait has negative value (after subtracting above), remove it
                        if (!Number.isNumeric(t.value) || t.value <= 0) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                });
            }
        return cloned;
    }



    static _getDialogTestData(data)
    {
        let testData = super._getDialogTestData(data);
        testData.hitLocation = data.hitLocation;
        testData.supercharge = data.supercharge;
        testData.burst = data.burst;
        testData.rapidFire = data.rapidFire;
        testData.additionalDamage = data.damage;
        return testData;
    }


    _defaultData() 
    {
        let data = super._defaultData();
        data.hitLocation = "roll";
        data.critModifier = 0;
        data.additionalDamage = 0;
        return data;
    }
}