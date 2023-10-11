import { BaseTestEvaluator } from "../base/base-evaluator";

export class AvailabilityEvaluator extends BaseTestEvaluator
{
    formatOutcomeDescription() 
    {
        if (this.roll <= this.target)
        {
            return game.i18n.localize(`IMPMAL.InStock`);
        }
        else if (this.roll > this.target)
        {
            return game.i18n.localize(`IMPMAL.OutOfStock`);
        }
    }
}