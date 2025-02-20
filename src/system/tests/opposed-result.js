export class OpposedTestResult 
{
    SL = undefined;
    winner = "";
    _tooltips = {
        damage : {}
    }
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
        else if (this.SL == 0)
        {
            // If both parties in an Opposed Test get the same SL, the character with the higher Skill wins
            if (defenderTest)
            {
                let attackerSkillTotal = attackerTest.computeTarget(true);
                let defenderSkillTotal = defenderTest.computeTarget(true);

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
                if (attackerTest.succeeded)
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
            let supercharge = attackerTest.result?.supercharge ? (Number(attackerTest.itemTraits.has("supercharge")?.value)) : 0
            if (supercharge)
            {
                this._tooltips.damage.supercharge = {label : "IMPMAL.Supercharge", value : supercharge}
            }

            this.damage = this.computeDamage(attackerTest.item, {add : supercharge, attackerTest, defenderTest});
            this.formatTooltips()
        }

    }

    // Should be temporary for now, needs improvement
    formatTooltips()
    {

        let _format = (key) => 
        {
            let str = [];
            return `${HandlebarsHelpers.numberFormat(this._tooltips.damage[key].value, {hash : {sign: true}})} (${game.i18n.localize(this._tooltips.damage[key].label)})`;
        }


        this.tooltips = {};

        let str = [_format("base")];
        if (this._tooltips.damage.SL)
        {
            str.push(_format("SL"));
        }
        if (this._tooltips.damage.opposed)
        {
            str.push(_format("opposed"));
        }
        for(let key of Object.keys(this._tooltips.damage).filter(k => !["base", "SL", "opposed"].includes(k)))
        {
            str.push(_format(key));
        }

        this.tooltips.damage = `<p>${str.join("</p><p>")}</p>`;
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
        let additional = attackerTest.result.additionalDamage;
        if (additional)
        {
            this._tooltips.damage.additional = {label : "IMPMAL.Other", value : additional};
        }
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

        this._tooltips.damage.base = {label : "IMPMAL.Trait", value : item?.system.attack?.damage.value};

        if (item.system.attack.damage.SL)
        {
            damage += this.SL;
            this._tooltips.damage.SL = {label : "IMPMAL.SL", value : this.SL};
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
        
        this._tooltips.damage.base = {label : "IMPMAL.Power", value : item?.system?.damage.value};

        if (item.system.damage.SL)
        {
            damage += this.SL;
            this._tooltips.damage.SL = {label : "IMPMAL.SL", value : this.SL};
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
        this._tooltips.damage.base = {label : "IMPMAL.Weapon", value : item?.system.damage.value};

        if (item.system.damage.SL)
        {
            damage += attackerTest.result.SL;
            this._tooltips.damage.SL = {label : "IMPMAL.SL", value : attackerTest.result.SL};
        }

        // melee always takes the difference in SL, ranged only takes the difference if the defence won
        if (item?.system.isMelee || defenderTest?.result?.SL > 0)
        {
            let opposed = (defenderTest?.result?.SL || 0);
            this._tooltips.damage.opposed = {label : "IMPMAL.Opposed", value : -opposed};
            damage -= opposed;
        }

        return damage;
    }


}