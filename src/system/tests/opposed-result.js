export class OpposedTestResult 
{
    SL = undefined;
    winner = "";
    static damagingItems = ["weapon", "trait", "power"];
    
    constructor(attackerTest, defenderTest)
    {
        this.evaluateResult(attackerTest, defenderTest);
    }

    evaluateResult(attackerTest, defenderTest)
    {
        this.SL = attackerTest.result.SL - (defenderTest?.result?.SL || 0); // If no defender test, unopposed 
        if (this.SL > 0)
        {
            this.winner = "attacker";
        }
        else if (this.SL < 0)
        {
            this.winner = "defender";
        }
        else {
            // If both parties in an Opposed Test get the same SL, the character with the higher Skill wins
            if (defenderTest)
            {
                const getSkillSpecTotal = test =>
                {
                    let skillObject;
                    if (typeof test.skill == "string")
                    {
                        skillObject = test.actor.system.skills[test.skill];
                    }
                    else if (test.skill instanceof Item)
                    {
                        skillObject = test.skill.system;
                    }
                    else if (typeof test.skill == "object")
                    {
                        skillObject = test.skill;
                    }
                    return skillObject.getTotalFor(skillObject.characteristic, test.actor);
                };
                
                let attackerSkillTotal = getSkillSpecTotal(attackerTest);
                let defenderSkillTotal = getSkillSpecTotal(defenderTest);

                if (attackerSkillTotal > defenderSkillTotal)
                {
                    this.winner = "attacker";
                }
                else if (attackerSkillTotal < defenderSkillTotal)
                {
                    this.winner = "defender";
                }
                // GM decides in event of skill tie
            }
            // If Unopposed, use the outcome of the attacker test to determine winner
            else
            {
                if (attackerTest.result.outcome == "success")
                {
                    this.winner = "attacker";
                }
                else
                {
                    this.winner = "defender";
                }
            }
        }

        if (this.winner == "attacker" && attackerTest.item && this.constructor.damagingItems.includes(attackerTest.item?.type))
        {
            this.damage = this.computeDamage(attackerTest.item, {add : (attackerTest.result?.supercharge ? Number(attackerTest.itemTraits.has("supercharge")?.value) : 0), attackerTest, defenderTest});
        }
    }


    /**
     * 
     * 
     * 
     *         this.evaluated = this.evaluateResult(attackerTest, defenderTest);
    }

    async evaluateResult()
    {

        await attackerTest.actor.runScripts("preAttackerEvaluateOpposed");
        await defenderTest?.actor?.runScripts("preDefenderEvaluateOpposed");
        let attackerTest = this.attackerTest;
        let defenderTest = this.defenderTest;
        this.SL = attackerTest.result.SL - (defenderTest?.result?.SL || 0); // If no defender test, unopposed 
        if (this.SL > 0)
        {
            this.winner = "attacker";
        }
        else if (this.SL < 0)
        {
            this.winner = "defender";
        }

        if (this.winner == "attacker" && attackerTest.item && this.constructor.damagingItems.includes(attackerTest.item?.type))
        {
            await attackerTest.actor.runScripts("preAttackerComputeOpposedDamage");
            await defenderTest?.actor?.runScripts("preDefenderComputeOpposedDamage");
            this.damage = this.computeDamage(attackerTest.item, {add : (attackerTest.result?.supercharge ? Number(attackerTest.itemTraits.has("supercharge")?.value) : 0), attackerTest, defenderTest});
            await attackerTest.actor.runScripts("postAttackerEvaluateOpposed");
            await defenderTest?.actor?.runScripts("postDefenderEvaluateOpposed");
        }
        return true;
    }

     */

    computeDamage(item, {add, attackerTest, defenderTest})
    {
        switch(item.type)
        {
        case "weapon" : 
            return this._computeWeaponDamage(item, {attackerTest, defenderTest}) + (add || 0) + attackerTest.result.additionalDamage;
        case "trait" : 
            return this._computeTraitDamage(item, {attackerTest, defenderTest}) + (add || 0) + attackerTest.result.additionalDamage;
        case "power" : 
            return this._computePowerDamage(item, {attackerTest, defenderTest}) + (add || 0);
        }
    }


    _computeTraitDamage(item)
    {
        let damage = 0;
        if (!item?.system?.attack?.damage)
        {
            return damage;
        }

        damage += item?.system.attack?.damage.value;

        if (item.system.attack.damage.SL)
        {
            damage += this.SL;
        }

        return damage;
    }

    _computePowerDamage(item)
    {
        let damage = 0;
        if (!item?.system?.damage)
        {
            return null;
        }

        damage += item?.system?.damage.value;

        if (item.system.damage.SL)
        {
            damage += this.SL;
        }

        return damage;
    }

    
    _computeWeaponDamage(item, {attackerTest, defenderTest}={})
    {
        let damage = 0;
        if (!item?.system?.damage)
        {
            return damage;
        }

        damage += item?.system.damage.value;

        if (item.system.damage.SL)
        {
            damage += attackerTest.result.SL;
        }

        // melee always takes the difference in SL, ranged only takes the difference if the defence won
        if (item?.system.isMelee || defenderTest?.result?.SL > 0)
        {
            damage -= (defenderTest?.result?.SL || 0);
        }

        return damage;
    }


}