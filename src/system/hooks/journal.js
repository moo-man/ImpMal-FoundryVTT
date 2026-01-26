import ImpMalTables from "../tables";

export default function() 
{
    Hooks.on("renderJournalEntryPageTextSheet", (document, html) => 
    {
        game.impmal.utility.listeners(html);
        ImpMalTables.listeners(html);
    });
}