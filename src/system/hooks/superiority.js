import IMActorSheet from "../../sheet/actors/actor";
import CharacterSheet from "../../sheet/actors/character";

export default function () {

    Hooks.on("impmal:superiorityChanged", superiority => {

        // Prepare data to receive new resource value
        for (let a of game.actors.filter(i => i.type == "character")) {
            let old = a.system.combat.superiority || 0;
            TokenHelpers.displayScrollingText((superiority - old) > 0 ? `+${superiority - old}` : `${superiority - old}`, a, { fill: "#065c63" });
            try {
                a.prepareData();
            }
            catch(e)
            { 
                warhammer.utility.log("Superiority update data preparation threw an error for " + a.name, true, e);
            }
        }

        // Change the superiority field of any open sheets manually to avoid losing data being submitted
        for (let sheet of Array.from(foundry.applications.instances.values()).filter(i => i instanceof CharacterSheet)) {
            sheet.element.querySelector(".superiority-update").value = superiority;
        }

    })
}
