export default class ImpMalScript
{
    constructor(data, context={}, async=false)
    {
        this.script = data.string;
        this.label = data.label;
        this.trigger = data.trigger;
        this.options = data.options;
        this.async = game.impmal.config.asyncTriggers?.[this.trigger] || async;
        this.context = context;
        this.context.script = this;
    }

    execute(args)
    {
        try 
        {
            let scriptFunction =this.async ? Object.getPrototypeOf(async function () { }).constructor : Function;
            game.impmal.log("Running Script > " + this.label);
            return (new scriptFunction("args",`${CONFIG.debug.scripts ? "debugger;" : ""}` + this.script)).bind(this.context)(args);
        }
        catch(e)
        {
            console.error(`Script ${this.label} threw error: ${e}.\n Context and Arguments:`, this.context, args);
        }
    }


    // Dialog modifiers only
    hidden(args)
    {
        if (!this.options.dialog?.hideScript)
        {
            return false; // Default to not hidden if no script
        }
        else 
        {
            try 
            {
                game.impmal.log("Running Script > " + this.label);
                return new Function("args",`${CONFIG.debug.scripts ? "debugger;" : ""}` + this.options.dialog?.hideScript).bind(this.context)(args);
            }
            catch(e)
            {
                console.error(`Hide Script ${this.label} threw error: ${e}.\n Context and Arguments:`, this.context, args);
                return false; // Default to not hidden if error
            }
        }
    }

    // Dialog modifiers only
    activated(args)
    {
        if (!this.options.dialog?.activateScript)
        {
            return false; // Default to not activated if no script
        }
        else 
        {
            try 
            {
                game.impmal.log("Running Script > " + this.label);
                return new Function("args",`${CONFIG.debug.scripts ? "debugger;" : ""}` + this.options.dialog?.activateScript).bind(this.context)(args);
            }
            catch(e)
            {
                console.error(`Activate Script ${this.label} threw error: ${e}.\n Context and Arguments:`, this.context, args);
                return false; // Default to not activated if error
            }
        }
    }

    scriptMessage(content)
    {
        ChatMessage.create({
            content,
            speaker : {alias : this.context.actor?.name || this.context?.item.name},
            flavor : this.context.effect.name || this.context.item.name || ""
        });
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