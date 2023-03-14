export class OpposedTestResult 
{
    SL = undefined;
    winner = "";
    
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

        if (this.winner == "attacker" && attackerTest.item.system?.damage)
        {
            this.damage = this.computeDamage(attackerTest.item);
        }
    }

    computeDamage(item)
    {
        let damage = 0;
        if (!item.system?.damage)
        {
            return damage;
        }

        damage += item.system.damage.value;

        if (item.system.attackType == "melee")
        {
            damage += this.SL;
        }

        return damage;
    }


}