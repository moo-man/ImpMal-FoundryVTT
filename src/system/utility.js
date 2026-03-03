import { CorruptionMessageModel } from "../model/message/corruption";

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
    static findId(id, compendiumOnly=false) 
    {
        if (!id)
        {
            return;
        }
        
        if (id.includes("."))
        {
            return fromUuid(id);
        }
    
        if (!compendiumOnly)
        {
            for(let collection of game.collections)
            {
                if (collection.has(id))
                    {
                        return collection.get(id);
                    }
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
        return await foundry.applications.ux.TextEditor.enrichHTML(`<table class="impmal">
        <thead>
        <tr class="title"><td colspan="2">@UUID[${table.uuid}]{${table.name}}</td></tr>
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
            <td>${["pack","document"].includes(r.type) ? `@UUID[${r.documentUuid}]` : r.text}</td>
            </tr>`;
    }).join("")}

        ${(options.includes("description") && table.description) ? '<td colspan="2">' + table.description + "</td>" : ""}

        </tbody>
    </table>`, {relativeTo : table, async: true});
    }

    static async actorToHTML(actor, label, options=[]) 
    {
        let html = "";

        if (options.description)
        {
            html += actor.system.notes.player;
            if (game.user.isGM)
                html += actor.system.notes.gm;
        }
        

        if (options.table)
        {
            let armour = actor.system.combat.armour.value;
            if (actor.system.combat.armour.formula)
            {
                armour = `${actor.system.combat.armour.formula} + ${armour}`;
            }

            let skills = [];
            for (let skillKey in actor.system.skills)
            {
                let skill = actor.system.skills[skillKey];
                // Only include skills in the main tab if they have advances
                if (skill.advances > 0)
                {
                    skills.push(`${game.impmal.config.skills[skillKey]} ${skill.total}`);
                }
    
                for(let skillItem of skill.specialisations)
                {
                    if (skillItem.system.advances > 0)
                    {
                        skills.push(`${skillItem.system.skillNameAndTotal}`);
                    }
                }
            }
        
            let template = await foundry.applications.handlebars.renderTemplate(`systems/impmal/templates/embeds/${actor.type}.hbs`, actor.system.embedData(options))

            return await foundry.applications.ux.TextEditor.enrichHTML(template, {relativeTo : actor, async: true, secrets : actor.isOwner});
        }
        else 
        {
            let image = actor.img;
            if (options.token)
            {
                image = actor.prototypeToken.texture.src;
            }
            html += `<div class="journal-image centered" ><img src="${image}" width="200" height="200"></div>`
            html += `<p style="text-align:center">@UUID[${actor.uuid}]{${label || actor.name}}</p>`
            if (options.description)
            {
                if (game.user.isGM)
                {
                    html += actor.system.notes.gm || ""
                }
                html += actor.system.notes.player || ""
            }
        }   
        return await foundry.applications.ux.TextEditor.enrichHTML(`<div>${html}</div>`, {relativeTo : actor, async: true, secrets : actor.isOwner});
    }

    static listeners(html) 
    {
        html.querySelectorAll(".corruption-link").forEach(e => e.addEventListener("click", ev => 
        {
            let corruptionValue = ev.currentTarget.dataset.value;
            CorruptionMessageModel.postCorruption(corruptionValue);
        }));

        html.querySelectorAll(".reward-link").forEach(e => e.addEventListener("click", ev => 
        {
            let rewardData = ev.currentTarget.dataset.value;
            game.impmal.commands.call("reward", rewardData);
        }));
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