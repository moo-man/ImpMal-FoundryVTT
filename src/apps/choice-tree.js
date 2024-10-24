export default class ChoiceTree extends HandlebarsApplicationMixin(ApplicationV2) {

    static DEFAULT_OPTIONS = {
        tag : "form",
        form : {
            handler : this.submit,
            submitOnChange : false,
            closeOnSubmit : true
        },
        window: {
            resizable : true,
            title : "Choices"
        },
        actions : {
            chooseOption : this._onChooseOption
        }
    }

    static PARTS = {
        form: {
          template: "systems/impmal/templates/apps/choice-tree.hbs"
        }
      }


    constructor(choices, options)
    {
        super(options);
        this.choices = choices;
        this.tree = choices.compileTree();
        if (this.tree.options.length == 1)
        {
            this.tree.structure.options[0].chosen = true;
        }
        else 
        {
            this._setInitialDecisions(this.tree.structure);
        }
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.tree = this.tree.structure;
        return context;
    }

    static async submit(event, form, fromData)
    {
        let chosen = this.tree.options.filter(o => this.tree.find(o.id)?.chosen)
        if (this.options.resolve)
        {
            this.options.resolve(chosen);
        }
        return chosen;
    }

    static async awaitSubmit(choices, options={})
    {
        return new Promise(resolve => {
            new this(choices, mergeObject(options, {resolve})).render(true);
        })
    }

    _setInitialDecisions(tree)
    {
        if (tree.type == "and")
        {
            for(let option of tree.options)
            {
                if (option.type == "option")
                {
                    option.chosen = true;
                }
                else
                {
                    this._setInitialDecisions(option)
                }
            }
        }
    }

    static _onChooseOption(ev)
    {
        let id = ev.target.dataset.id;
        let option = this.tree.find(id);
        let parent = this.tree.findParent(id);
        let current = option.chosen;

        let _unselectSiblingTree = (sibling) => 
        {
            if (sibling.type == "option")
            {
                sibling.chosen = false;
            }
            else 
            {
                sibling.options.forEach(o => {
                    _unselectSiblingTree(o)
                })
            }
        }
        
        if (option.type == "option")
        {
            if (parent.type == "or")
            {
                option.chosen = !current;
                parent.options.filter(o => o.id != option.id).forEach(sibling => {
                    // Invalidate sibling options
                    sibling.invalid = option.chosen;

                    // Unselect sibling options
                    if (sibling.invalid)
                    {
                        _unselectSiblingTree(sibling);
                    }
                })
            }
            if (parent.type == "and")
            {
                // Select all sibling options
                parent.options.forEach(sibling => {
                    if (sibling.type == "option")
                    sibling.chosen = !current
                })
            }
            this.render(true);
        }
    }

}