export class ImpMalActor extends Actor 
{
    
    async _preCreate(data, options, user) 
    {
        await super._preCreate(data, options, user);
        this.updateSource(this.system.preCreateData(data));
    }

    async _preUpdate(data, options, user) 
    {
        await super._preUpdate(data, options, user);
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
        this.itemCategories = this.itemTypes;
    }

    prepareDerivedData() 
    {
        this.system.computeDerived(this.itemCategories);
        this.items.forEach(i => i.prepareOwnedData());
    }


}