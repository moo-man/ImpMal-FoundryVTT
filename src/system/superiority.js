import ImpMalActorSheet from "../sheet/actors/actor-sheet";

export default class SuperiorityManager
{
    constructor() 
    {
        this.value = game.settings.get("impmal", "superiority");
    }

    _onSuperiorityChanged() 
    {
        this.value = game.settings.get("impmal", "superiority");
        // Prepare data to receive new superiority value
        for(let a of game.actors.filter(i => i.type == "character"))
        {
            let old = a.system.combat.superiority || 0;
            TokenHelpers.displayScrollingText((this.value - old) > 0 ? `+${this.value - old}` : `${this.value - old}`, a, {fill: "#065c63"} );
            a.prepareData();
        }

        // Change the superiority field of any open sheets manually to avoid losing data being submitted
        for(let sheet of Object.values(ui.windows).filter(i => i instanceof ImpMalActorSheet))
        {
            sheet.element.find(".superiority-update")[0].value = this.value;
        }

        // Make sure all combat trackers (popped out and embedded) have the correct value
        [ui.combat].concat(Object.values(ui.windows).filter(w => w instanceof CombatTracker)).forEach(tracker => 
        {
            tracker.element.find(".superiority input").each((index, input) => 
            {
                input.value = this.value;
            });
        });
    }

    // Add superiority input to combat tracker
    _addSuperiorityField(app, html)
    {
        let header = html.find(".combat-tracker-header");
        let superiority = $(`<div class="superiority"><label>${game.i18n.localize("IMPMAL.Superiority")}</label><input type=number ${game.user.isGM ? "" : "disabled"} value='${this.value}'></div>`);

        superiority.on("change", (ev) => 
        {   
            game.settings.set("impmal", "superiority", Number(ev.target.value));
        });

        superiority.on("focusin", (ev) => 
        {
            ev.target.select();
        });


        superiority.insertAfter(header);
    }
}