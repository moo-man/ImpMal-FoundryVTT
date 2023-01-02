export class BaseTestEvaluator 
{
    constructor(data={})
    {
        this.computeResult(data);
    }

    async evaluate(data)
    {
        this.roll = data.result.roll || (await new Roll("1d100").evaluate({async: true})).total;
        this.computeResult(data);
    }

    computeResult(data)
    {
        // Start with predefined results
        Object.assign(this, foundry.utils.deepClone(data.result));

        // Do not process result without a roll
        if (!this.roll) {return;}

        this.target = data.target;
        this.outcome = "";
        
        this.handleReversal({state : data.state, force : data.reverse});
        
        this.signedSL = this.signedSL ? this.signedSL : this.calculateSL(this.roll, this.target, data.SL);
        this.SL = Number(this.signedSL);

        if (this.SL > 0 || (this.SL == 0 && this.roll <= this.target))
        {
            this.outcome == "success";
        }
        else if (this.SL < 0 || (this.SL == 0 && this.roll > this.target))
        {
            this.outcome == "failure";
        }
    }

    calculateSL(roll, target, modifier=0)
    {
        let SL = Math.floor(target / 10) - Math.floor(roll / 10);
        SL += modifier;

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
            if (target > roll)
            {
                return `-${SL}`;
            }
            else if (target <= roll)
            {
                return `+${SL}`;
            }
        }

    }

    handleReversal({state="", force=false}={})
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
}