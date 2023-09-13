export default class ImpMalUtility
{
    /**
   * Given an ID, find an item within the world, and if necessary, search the compendium using the type argument
   * 
   * @param {String} id id of the item
   * @returns an Item object if the item is in the world, or a Promise of an Item if it was from the compendium
   */
    static findId(id) 
    {
        if (id.includes("."))
        {
            return fromUuid(id);
        }
    
        for(let collection of game.collections)
        {
            if (collection.has(id))
            {
                return collection.get(id);
            }
        }
    
        for (let pack of game.packs) 
        {
            if (pack.index.has(id)) 
            {
                return pack.getDocument(id);
            }
        }
    }


    /**
     * Find the owner of a document, prioritizing non-GM users 
     * 
     * @param {Object} document Document whose owner is being found
     * @returns 
     */
    static getActiveDocumentOwner(document)
    {
        // let document = fromUuidSync(uuid);
        if (document.documentName == "Item" && document.isOwned)
        {
            document = document.actor;
        }
        let activePlayers = game.users.contents.filter(u => u.active && u.role <= 2); // Not assistant or GM 
        let owningUser;

        // First, prioritize if any user has this document as their assigned character
        owningUser = activePlayers.find(u => u.character?.id == document.id);

        // If not found, find the first non-GM user that can update this document
        if (!owningUser)
        {
            owningUser = activePlayers.find(u => document.testUserPermission(u, "OWNER"));
        }

        // If still no owning user, simply find the first GM
        if (!owningUser)
        {
            owningUser = game.users.contents.filter(u => u.active).find(u => u.isGM);
        }
        return owningUser;
    }

    static async tableToHTML(table, label, options=[]) 
    {
        let noCenter = options.includes("no-center");
        return await TextEditor.enrichHTML(`<table class="impmal">
        <thead>
        <tr class="title"><td colspan="2">${table.name}</td></tr>
        <tr class="subheader">
            <td class="formula">${table.formula}</td>
            <td class="label">${label}</td>
        </tr>
        </thead>
        <tbody class="${noCenter ? "no-center" : ""}">
    ${table.results.map(r => 
    {
        return `<tr>
            <td>${r.range[0] == r.range[1] ? r.range[0] : `${r.range[0]}–${r.range[1]}`}</td>
            <td>${r.type == 1 ? `@UUID[${r.documentCollection}.${r.documentId}]` : r.text}</td>
            </tr>`;
    }).join("")}

        </tbody>
    </table>`, {relativeTo : table, async: true});
    }
}