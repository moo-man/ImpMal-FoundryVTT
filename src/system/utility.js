import { ImpMalChatMessage } from "./chat-message";

export default class ImpMalUtility
{

    static _keepID(id, document) 
    {
        try 
        {
            let compendium = !!document.pack;
            let world = !compendium;
            let collection;
    
            if (compendium) 
            {
                let pack = game.packs.get(document.pack);
                collection = pack.index;
            }
            else if (world)
            {
                collection = document.collection;
            }
    
            if (collection.has(id)) 
            {
                ui.notifications.notify(`${game.i18n.format("IMPMAL.ErrorID", {name: document.name})}`);
                return false;
            }
            else 
            {
                return true;
            }
        }
        catch (e) 
        {
            console.error(e);
            return false;
        }
    }

    static async getAllItems(types = [])
    {
        if (typeof types == "string")
        {
            types = [types];
        }

        let packs = game.impmal.tags.getPacksWithTag(types);

        let collection = new Collection();

        for(let pack of packs)
        {
            let docs = await pack.getDocuments({type__in: types});
            docs.forEach(i => 
            {
                if (i.permission >= 2)
                {
                    collection.set(i.id, i);
                }
            });
        }

        game.items.filter(i => types.includes(i.type)).forEach(i => 
        {
            if (i.permission >= 2)
            {
                collection.set(i.id, i);
            }
        });

        return collection;
    }

    /**
   * Given an ID, find an item within the world, and if necessary, search the compendium using the type argument
   * 
   * @param {String} id id of the item
   * @returns an Item object if the item is in the world, or a Promise of an Item if it was from the compendium
   */
    static findId(id) 
    {
        if (!id)
        {
            return;
        }
        
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
        let uuid;

        if (r.type == 1)
        {
            uuid = `${r.documentCollection}.${r.documentId}`;
        }
        else if (r.type == 2)
        {
            uuid = `Compendium.${r.documentCollection}.${r.documentId}`;
        }

        return `<tr>
            <td>${r.range[0] == r.range[1] ? r.range[0] : `${r.range[0]}–${r.range[1]}`}</td>
            <td>${[1,2].includes(r.type) ? `@UUID[${uuid}]` : r.text}</td>
            </tr>`;
    }).join("")}

        </tbody>
    </table>`, {relativeTo : table, async: true});
    }

    static listeners(html) 
    {
        html.find(".corruption-link").on("click", ev => 
        {
            let corruptionValue = ev.currentTarget.dataset.value;
            ImpMalChatMessage.corruptionMessage(corruptionValue);
        });
    }

    static async rollItemMacro(uuid, actor)
    {
        let item = await fromUuid(uuid);
        if (item.type == "specialisation")
        {
            actor.setupSkillTest({itemId : item.id});
        }
        else if (item.type == "weapon")
        {
            actor.setupWeaponTest(item.id);
        }
        else if (item.type == "power")
        {
            actor.setupPowerTest(item.id);
        }
        else if (item.type == "trait")
        {
            actor.setupTraitTest(item.id);
        }
    }


    static async createMacro(data, position)
    {
        let macroData = {};


        if (data.type == "Item")
        {
            let item = await fromUuid(data.uuid);
            macroData.name = item.name;
            macroData.img = item.img;
            macroData.command = `game.impmal.utility.rollItemMacro("${item.uuid}", token.actor || character)`;
            macroData.type = "script";
        }

        let existingMacro = game.macros.contents.find(m => 
            m.canExecute && 
            m.name == macroData.name && 
            m.command == macroData.command);
            
        // If macro already exists, do not create a new one
        let macro;
        if (existingMacro)
        {
            macro = existingMacro;
        }
        else 
        {
            macro = await Macro.create(macroData);
        }


        game.user.assignHotbarMacro(macro, position);
    }
}