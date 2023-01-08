import { BaseTestEvaluator } from "../base/base-evaluator";

export class WeaponTestEvaluator extends BaseTestEvaluator 
{
    /**
     * 
     * @param {Object} data Test data
     */
    computeOther(data) 
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
        }

    }
}