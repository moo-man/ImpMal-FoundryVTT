

export class TestDialog extends WarhammerRollDialog
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "test-dialog", "form"]);
        options.width = 500;
        options.resizable = true;
        return options;
    }

    get template() 
    {
        return `systems/impmal/templates/apps/test-dialog/test-dialog.hbs`;
    }

    get context() 
    {
        return this.data.context;
    }

    // Backwards compatibility for scripts referencing adv/disCount
    get advCount()
    {
        return this.advantage;
    }

    set advCount(value)
    {
        this.advantage = value;
    }

    get disCount()
    {
        return this.disadvantage;
    }

    set disCount(value)
    {
        this.disadvantage = value;
    }

    _defaultFields() 
    {
        return foundry.utils.mergeObject(super._defaultFields(), {
            modifier : 0,
            SL : 0,
            difficulty : "challenging",
            state : "none",
        });
    }
    async getData() 
    {

        let data = await super.getData();
        data.advantage = this.advantage;
        data.disadvantage = this.disadvantage;
        data.state = this.data.state;
        return data
    }

    async computeFields() 
    {
        this.data.state = this.computeState();
    }

    /**
     * Compute whether disadvantage or advantage should be selected
     */
    computeState()
    {
        if (this.forceState) //"adv" "dis" and "none"
        {
            return this.forceState;
        }

        else if (this.advantage > this.disadvantage && this.advantage > 0)
        {
            this.tooltips.start(this);
            this.fields.modifier += 10 * ((this.advantage - 1) - this.disadvantage);
            this.tooltips.finish(this, "Excess Advantage");
            return "adv";
        }

        else if (this.disadvantage > this.advantage && this.disadvantage > 0)
        {
            this.tooltips.start(this);
            this.fields.modifier -= 10 * ((this.disadvantage - 1) - this.advantage);
            this.tooltips.finish(this, "Excess Disadvantage");
            return "dis";

        }

        else 
        {
            return "none";
        }
    }
   
    /**
     * 
     * @param {object} actor Actor performing the test
     * @param {object} data Dialog data, such as title and actor
     * @param {object} fields Predefine dialog fields
     */
    static setupData(actor, target, options={})
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = {data : {}, fields : options.fields || {}};
        if (actor)
        {
            dialogData.data.speaker = ChatMessage.getSpeaker({actor});
        }
        dialogData.data.context = options.context || {}; // Arbitrary values - used with scripts
        dialogData.data.context.tags = options.context?.tags || {}; // Tags shown below test results - used with scripts
        dialogData.data.context.text = options.context?.text || {}; // Longer text shown below test results - used with scripts
        dialogData.data.context.skipTargets = options.skipTargets
        if (actor && !actor?.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete dialogData.data.speaker.scene;
        }
        dialogData.data.title = (options.title?.replace || game.i18n.localize("IMPMAL.Test")) + (options.title?.append || "");
        if (target)
        {
            dialogData.data.target = target;
        }

        dialogData.fields.difficulty = dialogData.fields.difficulty || "challenging";

        dialogData.data.targets = (actor?.defendingAgainst || options.skipTargets) ? [] : Array.from(game.user.targets).filter(t => t.document.id != dialogData.data.speaker.token); // Remove self from targets


        if (!options.skipTargets) 
        {
            // Collect Dialog effects 
            //   - Don't use our own targeter dialog effects, DO use targets' targeter dialog effects
            dialogData.data.scripts = foundry.utils.deepClone(
                (dialogData.data.targets
                    .map(t => t.actor)
                    .filter(actor => actor)
                    .reduce((prev, current) => prev.concat(current.getScripts("dialog", (s) => s.options.dialog?.targeter)), []) // Retrieve targets' targeter dialog effects
                    .concat(actor?.getScripts("dialog", (s) => !s.options.dialog?.targeter) // Don't use our own targeter dialog effects
                    ))) || [];
        }
        else 
        {
            dialogData.data.scripts = actor?.getScripts("dialog", (s) => !s.options.dialog?.targeter) // Don't use our own targeter dialog effects
        }


        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }

}