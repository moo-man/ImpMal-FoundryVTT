// Shared listeners between different document sheets

export default function addListListeners(html, sheet)
{
    html.find(".list-edit").on("click", _onListEdit.bind(sheet));
    html.find(".list-edit-rc").on("contextmenu", _onListEdit.bind(sheet));
    html.find(".list-delete").on("click", _onListDelete.bind(sheet));
    html.find(".list-delete-rc").on("click", _onListDelete.bind(sheet));
    html.find(".list-create").on("click", _onListCreate.bind(sheet));
    html.find(".list-toggle").on("click", _onListToggle.bind(sheet));
    html.find(".list-post").on("click", _onPostItem.bind(sheet));
}

function _getId(ev)
{
    let el = $(ev.currentTarget).parents("[data-id]");
    if (!el)
    {
        el = $(ev.currentTarget).parents("[data-item-id]");
    }
    let id = el.attr("data-id");
    if (!id)
    {
        id = ev.currentTarget.dataset.id || ev.currentTarget.dataset.itemId;
    }
    return id;
}

function _getCollection(ev)
{
    let el = $(ev.currentTarget).parents("[data-collection]");
    let collection = el.attr("data-collection");
    if (!collection)
    {
        collection = ev.currentTarget.dataset.collection;
    }
    return collection || "items";
}

//#region Sheet Listeners
function _onListEdit(event)
{
    let id = _getId(event);
    let collection = _getCollection(event);

    return this.object[collection].get(id)?.sheet.render(true);
}
function _onListDelete(event)
{
    let id = _getId(event);
    let collection = _getCollection(event);

    let docName = collection == "effects" ? "ActiveEffect" : "Item";

    Dialog.confirm({
        title: game.i18n.localize(`IMPMAL.Delete${docName}`),
        content: `<p>${game.i18n.localize(`IMPMAL.Delete${docName}Confirmation`)}</p>`,
        yes: () => {this.object.deleteEmbeddedDocuments(docName, [id]);},
        no: () => {},
        defaultYes: true
    });
}
function _onListCreate(event)
{
    let type = event.currentTarget.dataset.type;
    let category = event.currentTarget.dataset.category;
    if (type=="effect")
    {
        return _onEffectCreate.bind(this)(event);
    }

    
    let createData = { name: `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, type };
    if (category)
    {
        createData["system.category"]  = category;
    }

    return this.object.createEmbeddedDocuments("Item", [createData]);
}

function _onPostItem(event)
{
    let itemId = _getId(event);
    if (itemId) {return this.object.items.get(itemId)?.postToChat();}
}

async function _onEffectCreate(ev)
{
    let type = ev.currentTarget.dataset.category;
    let effectData = { label: game.i18n.localize("IMPMAL.NewEffect"), icon: "icons/svg/aura.svg" };
    if (type == "temporary")
    {
        effectData["duration.rounds"] = 1;
    }
    else if(type == "disabled")
    {
        effectData.disabled = true;
    }

    let html = await renderTemplate("systems/impmal/templates/apps/quick-effect.hbs", effectData);
    new Dialog({
        title: game.i18n.localize("IMPMAL.QuickEffect"),
        content: html,
        buttons: {
            create: {
                label: "Create",
                callback: (html) =>
                {
                    let mode = 2;
                    let label = html.find(".label").val();
                    let key = html.find(".key").val();
                    let value = parseInt(html.find(".modifier").val()?.toString() || "");
                    effectData.label = label;
                    effectData.changes = [{ key, mode, value }];
                    this.object.createEmbeddedDocuments("ActiveEffect", [effectData]);
                },
            },
            skip: {
                label: "Skip",
                callback: () => this.object.createEmbeddedDocuments("ActiveEffect", [effectData]),
            },
        },
        render: (dlg) =>
        {
            $(dlg).find(".label").select();
        },
    }).render(true);
}

function _onListToggle(ev)
{
    let id = _getId(ev);
    let effect = this.object.effects.get(id);

    if (effect) {effect.update({ disabled: !effect.disabled });}
}