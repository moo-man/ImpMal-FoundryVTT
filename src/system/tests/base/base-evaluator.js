export class BaseTestEvaluator 
{
    constructor(data={})
    {
        this.computeResult(data);
    }

    /**
     * Evalutor results are re-evaluated every time it is constructed
     * However some values shouldn't be re-evaluated, such as the roll itself
     * This value is saved in the Test objects
     */
    getPersistentData() 
    {
        return {
            roll : this.originalRoll  // .roll might be reversed
        };
    }

    async evaluate(data)
    {

        let roll = await new Roll("1d100").evaluate({async: true});
        data.result.roll = data.result.roll || roll.total;
        // data.result.rollObject = roll;
        this.computeResult(data);
    }

    computeResult(data)
    {
        this.clear();
        // Start with predefined results
        Object.assign(this, foundry.utils.deepClone(data.result));

        // Do not process result without a roll
        if (!data.result.roll) {return;}

        this.roll = data.result.roll;

        // Prefer predefined target vs computed target
        this.target = data.result.target || data.target;
        this.state = this.state || data.state;
        this.outcome = "";
        
        this.handleReversal({state : this.state, force : data.reverse});
        
        this.signedSL = this.signedSL ? this.signedSL : this.calculateSL(this.roll, this.target, data.SL);
        this.SL = Number(this.signedSL);

        if (this.SL > 0 || (this.SL == 0 && this.roll <= this.target) || this.roll <= 5)
        {
            this.outcome = "success";
        }
        else if (this.SL < 0 || (this.SL == 0 && this.roll > this.target) || this.roll >= 96)
        {
            this.outcome = "failure";
        }

        this.outcomeDescription = this.formatOutcomeDescription();

        this.computeOther(data);
    }

    formatOutcomeDescription() 
    {
        let outcome = this.outcome[0].toUpperCase() + this.outcome.slice(1); // "Failure" or "Success"

        let SLabs = Math.abs(this.SL);
        
        if (SLabs >= 5)
        {
            return game.i18n.localize(`IMPMAL.Astounding${outcome}`);
        }
        else if (SLabs >= 3 )
        {
            return game.i18n.localize(`IMPMAL.Impressive${outcome}`);
        }
        else if (SLabs >= 1)
        {
            return game.i18n.localize(`IMPMAL.${outcome}`);
        }
        else if (SLabs == 0)
        {
            return game.i18n.localize(`IMPMAL.Marginal${outcome}`);
        }
    }

    /**
     * Used by subclasses to compute specific values related to their type
     */
    computeOther() 
    {
    }

    calculateSL(roll, target, modifier=0)
    {
        let op = target < 0 ? "ceil" : "floor";
        let SL = Math[op](target / 10) - Math.floor(roll / 10);
        SL += modifier;

        // Automatic Success/Failure
        if (roll >= 96)
        {
            // If SL is less than 0, use SL, otherwise use -0
            return `${SL < 0 ? SL : ("-" + 0)}` ;
        }
        else if (roll <= 5)
        {
            // If SL is greater than 0, use +SL, otherwise use +0
            return `+${SL > 0 ? SL : 0}`;
        }

        if (SL > 0)
        {
            return `+${SL}`;
        }
        else if (SL < 0)
        {
            return `${SL}`;
        }
        // If 0, could be either +0 or -0
        // Two cases, natural roll, or SL modified. Both cases can be solved by looking at the original roll vs target
        else if (SL == 0)
        {
            if (roll <= target)
            {
                return `+${SL}`;
            }
            else if (roll > target)
            {
                return `-${SL}`;
            }
        }
    }

    handleReversal({state="none", force=false}={})
    {
        let roll = this.roll;
        this.originalRoll = roll;
        let reversed = this.reverse(roll);

        if (force || 
           (state == "adv" && reversed < roll) || 
           (state == "dis" && reversed > roll))
        {
            this.roll = reversed;
            this.reversed = true;
        }
        else 
        {
            this.reversed = false;
        }
    }

    reverse(number)
    {
        // 100 = 00, reverse is 00
        if (number == 100)
        {
            return 100;
        }

        return Number(number.toString().split("").reverse().join(""));
    }

    clear()
    {
        for (let property in this)
        {
            delete this[property];
        }
    }
}