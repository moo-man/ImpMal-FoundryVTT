import { BaseTestEvaluator } from "../base/base-evaluator";

export class WeaponTestEvaluator extends BaseTestEvaluator 
{
    /**
     * 
     * @param {Object} data Test data
     */
    computeOther(data) 
    {
        this.computeHitLocation(data);
        this.computeCrit(data);
    }

    computeHitLocation(data)
    {
        // If predefined hit location, don't compute
        if (this.hitLocation)
        {
            return;
        }
        
        // The test data can specify "roll" or a hit location key
        // 
        if (data.hitLocation == "roll")
        {
            let ones = Number(this.roll.toString().split("").pop());
            this.hitLocation = ones; 
        }
        else 
        {
            this.hitLocation = data.hitLocation;
            this.calledShot = true;
        }
    }

    computeCrit(data)
    {
        if (this.roll % 11 == 0)
        {
            // Prefer pre-defined results
            this.critical = this.critical || this.outcome == "success";
            this.fumble = this.fumble || this.outcome == "failure";
        }
    }

}