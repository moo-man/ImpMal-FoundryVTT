
export default function() 
{

    Hooks.on("renderTokenHUD", (app, html) => 
    {
        _addImpmalStatusEffects(html, app?.object?.document?.actor);
    });

}


function _addImpmalStatusEffects(html, actor)
{
    let effects = html.find(".status-effects");
    let sheetConditions = actor.sheet.formatConditions({actor : actor});

    let newEffects = "<div class='status-effects impmal'>";

    for(let c of sheetConditions)
    {
        let pipHTML = "";

        if (!c.boolean)
        {
            for(let pip of c.pips)
            {
                pipHTML += `<div class="pip ${pip.filled ? "filled" : ""}"></div>`;
            }
        }

        newEffects += `
        <div class="effect-control ${c.existing ? "active" : ""}" data-status-id="${c.id}">
            <img src="${c.icon}" title="${c.title}">
            <div class="pips">
                ${pipHTML}
            </div>
        </div>
        `;
    }

    newEffects += "</div>";

    effects.replaceWith(newEffects);
    effects = html.find(".status-effects");

    effects.find(".effect-control").on("mousedown", ev => 
    {
        ev.preventDefault();
        ev.stopPropagation();
        let existing = actor.hasCondition(ev.currentTarget.dataset.statusId);
        if (!existing || existing.isMinor)
        {
            actor.addCondition(ev.currentTarget.dataset.statusId);
        }
        else 
        {
            existing.delete();
        }

    });

}