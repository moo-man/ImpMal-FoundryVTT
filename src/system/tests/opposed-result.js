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

        if (this.winner == "attacker" && this.constructor.damagingItems.includes(attackerTest.item.type))
        {
            this.damage = this.computeDamage(attackerTest.item, {add : (attackerTest.result?.supercharge ? Number(attackerTest.itemTraits.has("supercharge")?.value) : 0)});
        }
    }

    computeDamage(item, {add})
    {
        switch(item.type)
        {
        case "weapon" : 
            return this._computeWeaponDamage(item) + (add || 0);
        case "trait" : 
            return this._computeTraitDamage(item) + (add || 0);
        case "power" : 
            return this._computePowerDamage(item) + (add || 0);
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

    
    _computeWeaponDamage(item)
    {
        let damage = 0;
        if (!item?.system?.damage)
        {
            return damage;
        }

        damage += item?.system.damage.value;

        if (item?.system.attackType == "melee")
        {
            damage += this.SL;
        }

        return damage;
    }


}