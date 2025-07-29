
export default function() 
{

    Hooks.on("renderTokenHUD", (app, html) => 
    {
        _addImpmalStatusEffects(html, app?.object?.document?.actor);
    });

    Hooks.on("hoverToken", (token, hover) => {
        let actor = token.actor;
        token.passengers?.forEach(i => i.destroy());
        delete token.passengers;

        if (!actor || actor.type != "vehicle")
        {
            return
        }

        let list = actor.system.crew.actors.concat(actor.system.passengers.actors)

        if (list.length > 0 && actor.system.autoCalc.showPassengers)
        {
            if (hover)
            {
                const ROW_SIZE = 8
                let rowCount = Math.ceil(list.length / ROW_SIZE);
                let sprites = list.filter(i => i).map((a, i) => 
                {
                    let scene = token.document.parent;
                    let sprite = PIXI.Sprite.from(a.prototypeToken.texture.src)
                    sprite.height = scene.grid.size;
                    sprite.width = scene.grid.size;
                    
                    let row = Math.floor(i / ROW_SIZE) * scene.grid.size;
                    let column = i % ROW_SIZE * scene.grid.size;

                    let tokenCenterMod = (token.document.width * scene.grid.size) / 2
                    if (rowCount > 1)
                    {
                        tokenCenterMod += scene.grid.size / 2;
                    }
                    else if (rowCount == 1)
                    {
                        let missing = ROW_SIZE - list.length;
                        tokenCenterMod += Math.ceil(missing/2) * scene.grid.size;
                    }
                    let xOffset = -1 * ((ROW_SIZE / 2) * scene.grid.size) + tokenCenterMod


                    let yOffset = -1 * rowCount * scene.grid.size;

                    sprite.x = column + xOffset;
                    sprite.y = row + yOffset;

                    return sprite
                })
                token.addChild(...sprites);
                token.passengers = sprites;
            }
        }
    })

}


function _addImpmalStatusEffects(html, actor) {
    let effects = html.querySelector(".status-effects");
    let sheetConditions = actor.sheet.formatConditions({ actor: actor });

    let newEffects = "<div class='status-effects impmal'>";

    for (let c of sheetConditions) {
        let pipHTML = "";

        if (!c.boolean) {
            for (let pip of c.pips) {
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

    effects.innerHTML = newEffects;


    effects.querySelectorAll(".effect-control").forEach(control => control.addEventListener("mousedown", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        let existing = actor.hasCondition(ev.currentTarget.dataset.statusId);
        if (!existing || existing.isMinor) {
            actor.addCondition(ev.currentTarget.dataset.statusId);
        }
        else {
            existing.delete();
        }

    }));
}