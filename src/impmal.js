import { ImpMalActor } from "./document/actor";

Hooks.once("init", () => 
{

    // #if _ENV == "development"
    CONFIG.debug.impmal = true;
    // #endif

    CONFIG.Actor.documentClass = ImpMalActor;
    CONFIG.Item.documentClass = undefined;
    CONFIG.ActiveEffect.documentClass = undefined;
    CONFIG.ActiveEffect.sheetClass = undefined;
    DocumentSheetConfig.registerSheet(JournalEntryPage, "impmal", Level4TextPageSheet, { makeDefault: true, label: "Imperium Maledictum Journal Sheet" });

    game.impmal = {
    
    };
});