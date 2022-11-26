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


    prepareBaseData() 
    {
        this.system.computeBase();
    }

    prepareDerivedData() 
    {
        this.system.computeDerived();
    }
}