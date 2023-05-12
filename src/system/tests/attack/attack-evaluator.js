import { BaseTestEvaluator } from "../base/base-evaluator";

export class AttackEvaluator extends BaseTestEvaluator 
{

    static standardHitLocationMap = {
        1 : "head",
        2 : "leftArm",
        3 : "rightArm",
        4 : "leftLeg",
        5 : "rightLeg",
        6 : "body",
        7 : "body",
        8 : "body",
        9 : "body",
        0 : "body",
    };

    /**
     * 
     * @param {Object} data Test data
     */
    computeOther(data) 
    {
        this.supercharge = data.supercharge;
        this.burst = data.burst;
        this.rapidFire = data.rapidFire;
        this.computeHitLocation(data);
        super.computeOther(data);
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

        this.hitLocationKey = this.constructor.standardHitLocationMap[this.hitLocation];
    }
}