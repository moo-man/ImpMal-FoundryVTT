export class OpposedTestResult 
{
    SL = undefined;
    winner = "";

    constructor(attackerResult, defenderResult)
    {
        this.evaluateResult(attackerResult, defenderResult);
    }

    evaluateResult(attackerResult, defenderResult)
    {
        this.SL = attackerResult.SL - defenderResult.SL;
        if (this.SL > 0)
        {
            this.winner = "attacker";
        }
        else if (this.SL < 0)
        {
            this.winner = "defender";
        }
    }


}