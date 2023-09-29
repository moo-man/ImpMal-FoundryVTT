export default function() 
{
    Hooks.on("setup", () => 
    {
        game.impmal.tags.createTags();
    });
}