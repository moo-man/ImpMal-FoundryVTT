export default function() 
{
    Hooks.on("renderJournalTextPageSheet", (document, html) => 
    {
        game.impmal.utility.listeners(html);
    });
}