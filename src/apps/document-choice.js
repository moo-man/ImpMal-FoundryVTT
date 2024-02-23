export default class DocumentChoice extends FormApplication
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal", "document-choice"]);
        options.title = game.i18n.localize("IMPMAL.Choose");
        options.resizable = true;
        options.width = 300;
        options.template = "systems/impmal/templates/apps/document-choice.hbs";
        return options;
    }



    constructor(documents, number=1, options)
    {
        super({}, options);
        this.documents = documents;
        this.number = number;
        this.resolve = options.resolve;
    }

    async getData()
    {
        let data = await super.getData();
        data.documents = this.documents;
        data.number = this.number;
        data.text = this.options.text;
        return data;
    }

    _updateObject()
    {
        let chosen = Array.from(this.element.find(".selected")).map(i => this.documents.find(d => d.id == i.dataset.documentId));
        this.resolve(chosen);
        return chosen;
    }

    close(options)
    {
        this.resolve([]);
        super.close(options);
    }

    static create(documents, number, {text="", title=""}={})
    {

        if (typeof documents == "object" && !Array.isArray(documents) && !(documents instanceof Collection))
        {
            documents = this.objectToArray(documents);
        }

        if (number == 0 || documents.length == 0)
        {
            return [];
        }
        return new Promise((resolve) => 
        {
            new this(documents, number, {text, title, resolve}).render(true);
        });
    }

    // simulate document structure with key as the ID and the value as the name
    static objectToArray(object)
    {
        return Object.keys(foundry.utils.deepClone(object)).map(key => 
        {
            return {
                id : key,
                name : object[key]
            };
        });

    }

    activateListeners(html)
    {
        super.activateListeners(html);
        html.find(".directory-item").on("click", ev => 
        {
            if (!ev.currentTarget.classList.contains("selected") && (this.selectedCount() >= this.number))
            {
                return;
            }
            ev.currentTarget.classList.toggle("selected");
        });
    }
    
    selectedCount()
    {
        return this.element.find(".selected").length;
    }
}