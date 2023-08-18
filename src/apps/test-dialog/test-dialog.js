import log from "../../system/logger";

export class TestDialog extends Application
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "test-dialog", "form"]);
        options.width = 450;
        options.resizable = true;
        return options;
    }

    #onKeyPress;
    selectedScripts = [];
    unselectedScripts = [];
    fieldsTemplate = "";
    
    get template() 
    {
        return `systems/impmal/templates/apps/test-dialog/test-dialog.hbs`;
    }

    get title() 
    {
        return this.data.title;
    }

    get actor() 
    {
        return ChatMessage.getSpeakerActor(this.data.speaker);
    }

    constructor(data={}, fields={}, resolve)
    {
        super();
        this.data = data;
        this.fields = mergeObject(this._defaultFields(),fields);
        this.userEntry = foundry.utils.deepClone(this.fields);

        // Keep count of sources of advantage and disadvantage
        this.advCount = 0;
        this.disCount = 0;
        this.forceState = undefined;
        // If the user specifies a state, use that

        if (resolve)
        {
            this.resolve = resolve;
        }
    }

    _defaultFields() 
    {
        return {
            modifier : 0,
            SL : 0,
            difficulty : "challenging",
            state : "none",
            rollmode : game.settings.get("core", "rollMode") || "publicroll"
        };
    }

    async getData() 
    {
        this.advCount = 0;
        this.disCount = 0;

        
        // Reset values so they don't accumulate 
        mergeObject(this.fields, this.userEntry);

        // For some reason cloning the scripts doesn't prevent isActive and isHidden from persisisting
        // So for now, just reset them manually
        this.data.scripts.forEach(script => 
        {
            script.isHidden = false;
            script.isActive = false;
        });
        
        this._hideScripts();
        this._activateScripts();
        await this.computeScripts();
        await this.computeFields();

        let state = this.computeState();

        return {
            scripts : this.data.scripts,
            fields : mergeObject(this.fields, {state}),
            advCount : this.advCount,
            disCount : this.disCount,
            subTemplate : await this.getFieldsTemplate()
        };
    }

    updateTargets()
    {
        this.data.targets = Array.from(game.user.targets);
        this.render(true);
    }

    _hideScripts()
    {
        this.data.scripts.forEach((script, index) => 
        {
            // If user selected script, make sure it is not hidden, otherwise, run its script to determine
            if (this.selectedScripts.includes(index))
            {
                script.isHidden = false;
            }
            else
            {
                script.isHidden = script.hidden(this);
            }
        });
    }

    _activateScripts()
    {
        this.data.scripts.forEach((script, index) => 
        {
            // If user selected script, activate it, otherwise, run its script to determine
            if (this.selectedScripts.includes(index))
            {
                script.isActive = true;
            }
            else if (this.unselectedScripts.includes(index))
            {
                script.isActive = false;
            }
            else if (!script.isHidden) // Don't run hidden script's activation test
            {
                script.isActive = script.activated(this);
            }
        });
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

        else if (this.advCount > this.disCount)
        {
            return "adv";
        }

        else if (this.disCount > this.advCount)
        {
            return "dis";
        }

        else 
        {
            return "none";
        }
    }

    /**
     * Handle relationships between fields, used by subclasses
     */
    async computeFields() 
    {

    }

    
    async computeScripts() 
    {
        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                await script.execute(this);
            }
        }
    }

    /**
     * Allows subclasses to insert custom fields
     */
    async getFieldsTemplate()
    {
        if (this.fieldsTemplate)
        {
            return await renderTemplate(this.fieldsTemplate, await this.getTemplateFields());
        }
    }

    /**
     * Provide data to a dialog's custom field section
     */
    async getTemplateFields() 
    {
        return {fields : this.fields};
    }

    submit(ev) 
    {
        ev.preventDefault();
        ev.stopPropagation();
        let dialogData = mergeObject(this.data, this.fields);

        for(let script of this.data.scripts)
        {
            if (script.isActive)
            {
                script.submission(this);
            }
        }

        if (this.resolve)
        {
            this.resolve(dialogData);
        }
        this.close();
        return dialogData;
    }

    close() 
    {
        super.close();
        document.removeEventListener("keypress", this.#onKeyPress);
    }

    activateListeners(html) 
    {
        this.form = html[0];
        this.form.onsubmit = this.submit.bind(this);

        // Listen on all elements with 'name' property
        html.find(Object.keys(new FormDataExtended(this.form).object).map(i => `[name='${i}']`).join(",")).change(this._onInputChanged.bind(this));

        html.find(".dialog-modifiers .modifier").click(this._onModifierClicked.bind(this));

        // Need to remember binded function to later remove
        this.#onKeyPress = this._onKeyPress.bind(this);
        document.addEventListener("keypress", this.#onKeyPress);
    }

    _onInputChanged(ev) 
    {
        let value = ev.currentTarget.value;
        if (Number.isNumeric(value))
        {
            value = Number(value);
        }

        if (ev.currentTarget.type == "checkbox")
        {
            value = ev.currentTarget.checked;
        }

        this.userEntry[ev.currentTarget.name] = value;

        // If the user clicks advantage or disadvantage, force that state to be true despite calculations
        if (ev.currentTarget.name == "state")
        {
            this.forceState = value;
        }
        this.render(true);
    }

    _onModifierClicked(ev)
    {
        let index = Number(ev.currentTarget.dataset.index);
        if (!ev.currentTarget.classList.contains("active"))
        {
            // If modifier was unselected by the user (originally activated via its script)
            // it can be assumed that the script will still be activated by its script
            if (this.unselectedScripts.includes(index))
            {
                this.unselectedScripts = this.unselectedScripts.filter(i => i != index);
            }
            else 
            {
                this.selectedScripts.push(index);
            }
        }
        else 
        {
            // If this modifier was NOT selected by the user, it was activated via its script
            // must be added to unselectedScripts instead
            if (!this.selectedScripts.includes(index))
            {
                this.unselectedScripts.push(index);
            }
            else // If unselecting manually selected modifier
            {
                this.selectedScripts = this.selectedScripts.filter(i => i != index);
            }
        }
        this.render(true);
    }

    _onKeyPress(ev)
    {
        if (ev.key == "Enter")
        {
            this.submit(ev); 
        }
    }

    /**
     * 
     * @param {object} data Dialog data, such as title and actor
     * @param {object} data.title.replace Custom dialog/test title
     * @param {object} data.title.append Append something to the test title
     * @param {object} fields Predefine dialog fields
     */
    static awaitSubmit({data={}, fields={}}={})
    {
        return new Promise(resolve => 
        {
            new this(data, fields, resolve).render(true);
        });
    }

    /**
     * 
     * @param {object} actor Actor performing the test
     * @param {object} data Dialog data, such as title and actor
     * @param {object} fields Predefine dialog fields
     */
    static setupData(actor, target, {title={}, fields={}}={})
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = {data : {}, fields};
        dialogData.data.speaker = ChatMessage.getSpeaker({actor});
        dialogData.data.other = {}; // Object that scripts can fill in with arbitrary values
        if (!actor.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete dialogData.data.speaker.scene;
        }
        dialogData.data.title = (title?.replace || game.i18n.localize("IMPMAL.Test")) + (title?.append || "");
        if (target)
        {
            dialogData.data.target = target;
        }

        dialogData.data.targets = actor.defendingAgainst ? [] : Array.from(game.user.targets);

        // Collect Dialog effects 
        //   - Don't use our own targeter dialog effects, DO use targets' targeter dialog effects
        dialogData.data.scripts = foundry.utils.deepClone(
            actor.getScripts("dialog", (s) => !s.options.dialog?.targeter) // Don't use our own targeter dialog effects
                .concat(dialogData.data.targets 
                    .map(t => t.actor)
                    .filter(actor => actor)
                    .reduce((prev, current) => prev.concat(current.getScripts("dialog", (s) => s.options.dialog?.targeter)), []) // DO use targets' targeter dialog effects
                ));

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }

    static updateActiveDialogTargets() 
    {
        Object.values(ui.windows).forEach(i => 
        {
            if (i instanceof TestDialog)
            {
                i.updateTargets();
            }
        });
    }
}