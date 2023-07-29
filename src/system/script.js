export default class ImpMalScript
{
    constructor(data, context={}, async=false)
    {
        this.script = data.string;
        this.label = data.label;
        this.trigger = data.trigger;
        this.async = game.impmal.config.asyncTriggers?.[this.trigger] || async;
        this.context = context;
    }

    execute(args)
    {
        try 
        {

            let scriptFunction =this.async ? Object.getPrototypeOf(async function () { }).constructor : Function;
            
            return (new scriptFunction("args", this.script)).bind(this.context)(args);
        }
        catch(e)
        {
            console.error(`Script ${this.label} threw error: ${e}.\n Context and Arguments:`, this.context, args);
        }
    }

    get actor() 
    {
        return this.context.actor;
    }
    
    get item() 
    {
        return this.context.item;
    }

    get effect()
    {
        return this.context.effect;
    }

    static createContext(document)
    {
        let context = {};
        if (document.documentName == "ActiveEffect")
        {
            context.actor = document.actor;
            context.item = document.item;
            context.effect = document;
        }

        if (document.documentName == "Item")
        {
            context.actor = document.actor;
            context.item = document;
        }

        return context;
    }
}