import log from "../../system/logger";

export class TestDialog extends Application
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "test-dialog", "form"]);
        options.resizable = true;
        return options;
    }

    #onKeyPress;
    
    get template() 
    {
        return `systems/impmal/templates/apps/test-dialog/test-dialog.hbs`;
    }

    get title() 
    {
        return this.data.title;
    }

    constructor(data={}, fields={}, resolve)
    {
        super();
        this.data = data;
        this.fields = mergeObject(
            {
                modifier : 0,
                SL : 0,
                difficulty : "challenging",
                state : ""
            },
            fields
        );

        if (resolve)
        {
            this.resolve = resolve;
        }
    }

    getData() 
    {
        return {
            fields : this.fields
        };
    }

    submit(ev) 
    {
        ev.preventDefault();
        ev.stopPropagation();
        let dialogData = mergeObject(this.data, this.fields);
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
        html.find(Object.keys(new FormDataExtended(this.form).object).map(i => `[name='${i}']`).join(",")).change(ev => 
        {
            let value = ev.currentTarget.value;
            if (Number.isNumeric(value))
            {
                value = Number(value);
            }
            this.fields[ev.currentTarget.name] = value;
        });


        // Need to remember binded function to later remove
        this.#onKeyPress = this._onKeyPress.bind(this);
        document.addEventListener("keypress", this.#onKeyPress);
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
        dialogData.data.title = (title?.replace || game.i18n.localize("IMPMAL.Test")) + (title?.append || "");
        if (target)
        {
            dialogData.data.target = target;
        }

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }
}