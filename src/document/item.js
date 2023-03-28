import ImpMalDocumentMixin from "./mixin";

export class ImpMalItem extends ImpMalDocumentMixin(Item)
{
    prepareBaseData() 
    {
        this.system.computeBase();
    }

    prepareDerivedData() 
    {
        this.system.computeDerived();
    }

    prepareOwnedData()
    {
        if (!this.actor)
        {
            throw new Error("Cannot compute owned derived data without parent actor", this);
        }
        this.system.computeOwnerDerived(this.actor);
    }

    get typeLabel()
    {
        return game.i18n.localize(CONFIG.Item.typeLabels[this.type]);
    }
}