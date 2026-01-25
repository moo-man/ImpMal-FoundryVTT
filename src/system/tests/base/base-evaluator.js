export class BaseTestEvaluator 
{
    constructor(data={})
    {
        // Start with predefined results
        Object.assign(this, foundry.utils.deepClone(data.result));
    }

    static fromData(data)
    {
        let result = new this();
        foundry.utils.mergeObject(result, data);
        return result;
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
        this.clear();
        this.tags = {};
        this.text = {};
        let roll = await new Roll("1d100").roll();
        data.result.roll = data.result.roll || roll.total;
        data.result.rollObject = roll;
        this.computeResult(data);
    }

    computeResult(data)
    {

        // Do not process result without a roll
        if (!data.result.roll) {return;}

        let automaticSuccess = game.settings.get("impmal", "automaticSuccess");
        let automaticFailure = game.settings.get("impmal", "automaticFailure");

        this.roll = data.result.roll;
        this.rollObject = data.result.rollObject;

        // Prefer predefined target vs computed target
        this.target = data.result.target || data.target;
        this.SL = data.result.SL; // SL predefined
        this.state = this.state || data.state;
        this.onlyAutomaticSuccess = data.onlyAutomaticSuccess;
        this.outcome = "";
        
        this.handleReversal({state : this.state, force : data.reverse});
        
        this.SL = Number.isNumeric(this.SL) ? this.SL : this.calculateSL(this.roll, this.target, data.SL);

        if (this.roll <= automaticSuccess)
        {
            this.outcome = "success";
        }
        else if (this.roll >= automaticFailure)
        {
            this.outcome = "failure";
        }
        else if (this.SL > 0 || (this.SL == 0 && this.roll <= this.target))
        {
            this.outcome = "success";
        }
        else if (this.SL < 0 || (this.SL == 0 && this.roll > this.target))
        {
            this.outcome = "failure";
        }

        // if an SL modifier made the SL be 0 (-2 SL with a +2 SL bonus), it it considered +0
        if (this.outcome == "failure" && this.SL == 0 && data.SL && this.roll < automaticFailure && !this.onlyAutomaticSuccess)
        {
            this.outcome = "success";
        }

        if (this.outcome == "success" && this.onlyAutomaticSuccess && this.roll > automaticSuccess)
        {
            this.SL = 0;
            this.outcome = "failure";
        }

        this.outcomeDescription = this.formatOutcomeDescription();

        this.computeOther(data);
    }

    computeTagsAndText() 
    {
        if (this.state == "adv")
        {
            this.tags.state = game.i18n.localize("IMPMAL.Advantage");
        }
        if (this.state == "dis")
        {
            this.tags.state = game.i18n.localize("IMPMAL.Disadvantage");
        }
        if (this.onlyAutomaticSuccess)
        {
            this.text.onlyAutomaticSuccess = game.i18n.localize("IMPMAL.OnlyAutomaticSuccess");
        }
    }

    formatOutcomeDescription() 
    {
        let outcome = this.outcome[0].toUpperCase() + this.outcome.slice(1); // "Failure" or "Success"

        let absSL = Math.abs(this.SL);
        
        if (absSL >= 5)
        {
            return game.i18n.localize(`IMPMAL.Astounding${outcome}`);
        }
        else if (absSL >= 3 )
        {
            return game.i18n.localize(`IMPMAL.Impressive${outcome}`);
        }
        else if (absSL >= 1)
        {
            return game.i18n.localize(`IMPMAL.${outcome}`);
        }
        else if (absSL == 0)
        {
            return game.i18n.localize(`IMPMAL.Marginal${outcome}`);
        }
    }

    /**
     * Used by subclasses to compute specific values related to their type
     */
    computeOther(data) 
    {
        if (data.computeDoubles && (this.roll % 11 == 0 || this.roll == 100))
        {
            if (this.roll == 100)
            {
                this.fumble = this.fumble || true;
            }
            else 
            {
                // Prefer pre-defined results
                this.critical = this.critical || this.outcome == "success";
                this.fumble = this.fumble || this.outcome == "failure";
            }
        }
    }

    calculateSL(roll, target, modifier=0)
    {
        let op = target < 0 ? "ceil" : "floor";
        let SL = Math[op](target / 10) - Math.floor(roll / 10);
        SL += modifier;
        return SL;
    }

    get signedSL()
    {
        
        if (this.outcome == "success")
        {
            return `+${this.SL}`;
        }
        else if (this.outcome == "failure")
        {
            if (this.SL == 0)
            {
                return `-0`;
            }
            else 
            {
                return `${this.SL}`;
            }
        }
        else 
        {
            throw Error("SL not calculated yet");
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

        return Number((number < 10 ? "0" + number : number).toString().split("").reverse().join(""));
    }

    clear()
    {
        for (let property in this)
        {
            delete this[property];
        }
    }
}