export class ImpMalItem extends Item 
{
    async _preCreate(data, options, user)
    {
        await super._preCreate(data, options, user);
        this.updateSource(this.system.preCreateData(data));
    }


    async _preUpdate(data, options, user)
    {
        await super._preCreate(data, options, user);
        this.system.preUpdateChecks(data);
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        this.update(this.system.updateChecks(data));
    }


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