
let fields = foundry.data.fields;

/**
 * A ChoiceModel allows for choices between any arbitrary amount of documents to any amount of depth
 * 
 * The structure property describes the structure of the possible decisions, e.g. A and B or C and D   vs.   A or (B and C) or D
 * The choices property contains the list of things being chosen, e.g. what A, B, C, D actually are
 */
export class ChoiceModel extends foundry.abstract.DataModel
{
    static defineSchema() 
    {
        let schema = {};
 
        // Root is always "or" because otherwise it's not a choice
        schema.structure = new fields.ObjectField({initial : {
            type : "or",
            id : "root",
            options : []
        }
        });
        // Universal fields - All types have these
        schema.options = new fields.ArrayField(new fields.SchemaField({
            type : new fields.StringField(), // Types are item, effect, filter, placeholder
            id : new fields.StringField(), // Used by structure
            name : new fields.StringField(), // Store name so async retrieval doesn't cause issues
             
            // Type specific fields
            documentId : new fields.StringField(), // filters ande placeholders don't need IDs
            diff : new fields.ObjectField(), // Changes to choice document
            idType : new fields.StringField(), // uuid, id, or relative ID
            filters : new fields.ArrayField(new fields.SchemaField({
                property : new fields.StringField(),
                value : new fields.StringField(),
            })),
        }));
        return schema;
    }

    get compiled()
    {
        let compiled = foundry.utils.deepClone(this.structure);
        return compiled;
    }
 
    addOption(data, location)
    {
        let option;
        if (data.documentName == "Item")        
        {
            option = this._createDocumentOption(data);
        }
        else if (data.documentName == "ActiveEffect")
        {
            option = this._createDocumentOption(data);
        }
        else if (data.type == "filter")
        {
            option = this._createFilterOption(data);
        }
        else if (data.type == "placeholder")
        {
            option = this._createPlaceholderOption(data);
        }
        else if (data.type == "and" || data.type == "or")
        {
            return {structure : this.insert(mergeObject(data, {id : randomID(), options : []}), location)};
        }
        else 
        {
            console.error(game.i18n.localize("IMPMAL.NotValidChoiceType"));
            return ui.notifications.error(game.i18n.localize("IMPMAL.NotValidChoiceType"));
        }
 
        return {options: this.options.concat(option), structure : this.insert({id : option.id, type: "option"}, location)};
    }

    deleteOption(id)
    {
        return {options: this.options.filter(i => i.id != id), structure : this.remove(id)};
    }
 
    //#region Operations

    // Find a choice in the structure
    find(id, structure)
    {   
        structure = structure || this.structure;
 
        if (structure.id == id)
        {
            return structure;
        }
 
        if (structure.options)
        {
            for (let option of structure.options)
            {
                let found = this.find(id, option);
                if (found)
                {
                    return found;   
                }
            }
        }
    }
 
    /**
      * 
      * @param {Object} data data being inserted
      * @param {String} id structure ID of where to insert
      * @param {Object} structure Used for recursion
      */
    insert(data, id="root", structure)
    {
        structure = structure || foundry.utils.deepClone(this.structure);
        let location = this.find(id, structure);
        if (!location)
        {
            location = this.find("root", structure);
        }
        if (location.type == "option")
        {
            // If inserting onto another option, form a choice between them instead
            location.options = [foundry.utils.deepClone(location), data];
            location.type = "and";
            location.id = randomID();
        }
        else
        {
            // If inserting into a choice, just add it to the list
            location.options.push(data);
        }
        return this.cleanStructure(structure);
    }

    move(id, dest="root")
    {
        if (id == dest)
        {
            return;
        }
        let data = this.find(id);
        if (data.type == "option")
        {
            let newStructure = this.remove(id);
            this.insert(data, dest, newStructure);
            return newStructure;
        }
        else 
        {
            return this.structure;
        }
    }
 
 
    edit(id, obj)
    {
        let structureCopy = foundry.utils.deepClone(this.structure);
        let target = this.find(id, structureCopy);
        mergeObject(target, obj);
        return target;
    }
 
    switch(id="root")
    {
        let current = this.find(id)?.type;
        if (!["or", "and"].includes(current))
        {
            return; // Can only switch or to and and vice versa
        }
        let type = current  == "and" ? "or" : "and"; // Switch and/or
        return this.edit(id, {type});
    }
 
    remove(id, structure)
    {   
        structure = structure || foundry.utils.deepClone(this.structure);
        if (id == "root")
        {
            return structure;// cannot delete root
        }
 
        if (structure.options)
        {
            // Delete choice with ID
            if (structure.options.find(c => c.id == id))
            {
                structure.options = structure.options.filter(c => c.id != id);
            }
            for (let option of structure.options)
            {
                this.remove(id, option);
            }
            return this.cleanStructure(structure);
        }
    }

    cleanStructure(structure)
    {
        // Prevents accumulation of single-item choices by pushing them upward
        if (structure.options.length == 1 && structure.options[0].type != "option")
        {
            structure.options = structure.options[0].options;
        }
        structure.options.forEach(option => 
        { 
            if (option.type != "option") 
            { 
                if (option.options.length == 1)
                {
                    structure.options.push(option.options[0]); // Move single options up
                    option.options = [];
                }
                this.cleanStructure(option); // Recursively clean inner options
            } 
        }); 
        // Filter out empty choices
        structure.options = structure.options.filter(option => 
        {
            if (option.type == "option")
            {
                return true;
            }
            else if (option.options.length > 0)
            {
                return true;
            }
        });
        return structure;
    }

    //#endregion
 
    //#region Choice creation
    _createDocumentOption(document)
    {
        let option = {
            type : document.documentName == "Item" ? "item" : (documentName == "ActiveEffect" ? "effect" : ""),
            name : document.name || document.label,
            id : randomID(),
            idType : ""
        };
        if (document.parent && document.parent == this.parent.parent) // Currently only used by effect choices
        {
            option.idType = "relative";
            option.documentId = `.${document.documentName}.${document.id}`;
        }
        else 
        {
            option.idType = "id";
            option.documentId = document.id;
        }
        return option;
    }
 
    _createFilterOption(data)
    {
        let option = {
            type : "filter",
            name : data.name,
            id : randomID(),
            filters : data.filters
        };
        return option;
    }
 
    _createPlaceholderOption(data)
    {
        let option = {
            type : "placeholder",
            name : data.name,
            id : randomID()
        };
        return option;
    }
    //#endregion
}