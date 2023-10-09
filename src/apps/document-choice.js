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



    constructor(documents, number=1, resolve)
    {
        super({});
        this.documents = documents;
        this.number = number;
        this.resolve = resolve;
    }

    async getData()
    {
        let data = await super.getData();
        data.documents = this.documents;
        data.number = this.number;
        return data;
    }

    _updateObject()
    {
        let chosen = Array.from(this.element.find(".selected")).map(i => this.documents.find(d => d.id == i.dataset.documentId));
        this.resolve(chosen);
        return chosen;
    }

    static create(documents, number)
    {
        if (number == 0 || documents.length == 0)
        {
            return [];
        }
        else if (documents.length == 1)
        {
            return documents;
        }
        return new Promise(resolve => 
        {
            new this(documents, number, resolve).render(true);
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