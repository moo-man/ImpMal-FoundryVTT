
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
            choices : []
        }
        });
        schema.choices = new fields.ArrayField(new fields.SchemaField({
            // Universal fields - All types have these
            type : new fields.StringField(), // Types are item, effect, filter, placeholder
            id : new fields.StringField(), // Used by structure
            name : new fields.StringField(), // Store name so async retrieval doesn't cause issues
             
            // Type specific fields
            documentId : new fields.StringField(), // filters ande placeholders don't need IDs
            idType : new fields.StringField(), // uuid, id, or relative ID
            filters : new fields.ArrayField(new fields.SchemaField({
                property : new fields.StringField(),
                value : new fields.StringField(),
            })),
        }));
        return schema;
    }
 
    addChoice(data, location)
    {
        let choice;
        if (data.documentName == "Item")        
        {
            choice = this._createDocumentChoice(data);
        }
        else if (data.documentName == "ActiveEffect")
        {
            choice = this._createDocumentChoice(data);
        }
        else if (data.type == "filter")
        {
            choice = this._createFilterChoice(data);
        }
        else if (data.type == "placeholder")
        {
            choice = this._createPlaceholderChoice(data);
        }
        else if (data.type == "and" || data.type == "or")
        {
            return {structure : this.insert(mergeObject(data, {id : randomID(), choices : []}), location)};
        }
        else 
        {
            console.error(game.i18n.localize("IMPMAL.NotValidChoiceType"));
            return ui.notifications.error(game.i18n.localize("IMPMAL.NotValidChoiceType"));
        }
 
        return {choices: this.choices.concat(choice), structure : this.insert({id : choice.id, type: "choice"}, location)};
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
 
        if (structure.choices)
        {
            for (let choice of structure.choices)
            {
                let found = this.find(id, choice);
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
 
        location.choices.push(data);
        return structure;
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
 
    // Find a choice in the structure
    delete(id, structure)
    {   
        structure = structure || foundry.utils.deepClone(this.structure);
        if (id == "root")
        {
            return structure;// cannot delete root
        }
 
        if (structure.choices)
        {
            // Delete choice with ID
            if (structure.choices.find(c => c.id == id))
            {
                structure.choices = structure.choices.filter(c => c.id != id);
                return structure;
            }
            else 
            {
                for (let choice of structure.choices)
                {
                    return this.delete(id, choice);
                }
            }
        }
    }

    //#endregion
 
    //#region Choice creation
    _createDocumentChoice(document)
    {
        let choice = {
            type : document.documentName == "Item" ? "item" : (documentName == "ActiveEffect" ? "effect" : ""),
            name : document.name || document.label,
            id : randomID(),
            idType : ""
        };
        if (document.parent && document.parent == this.parent.parent) // Currently only used by effect choices
        {
            choice.idType = "relative";
            choice.documentId = `.${document.documentName}.${document.id}`;
        }
        else 
        {
            choice.idType = "id";
            choice.documentId = document.id;
        }
        return choice;
    }
 
    _createFilterChoice(data)
    {
        let choice = {
            type : "filter",
            name : data.name,
            id : randomID(),
            filters : data.filters
        };
        return choice;
    }
 
    _createPlaceholderChoice(data)
    {
        let choice = {
            type : "placeholder",
            name : data.name,
            id : randomID()
        };
        return choice;
    }
    //#endregion
}