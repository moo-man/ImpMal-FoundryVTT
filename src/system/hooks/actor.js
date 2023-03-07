export default function() 
{
    Hooks.on("getActorDirectoryEntryContext", (html, options) => 
    {
        let isPatron = li => 
        {
            // let parent = li.parents("[data-document-id]")[0];
            let id = li.attr("data-document-id");
            let actor = game.actors.get(id);
            return actor.type == "patron";
        };
        options.push(
            {
                name: game.i18n.localize("IMPMAL.SetPatron"),
                condition: isPatron,
                icon: '<i class="fa-solid fa-handshake-angle"></i>',
                callback: target => 
                {
                    if (!game.user.character)
                    {
                        ui.notifications.error(game.i18n.localize("IMPMAL.NoAssignedCharacterError"));
                    }

                    if (game.user.character.type == "character")
                    {
                        game.user.character.update({"system.patron.id" : target.attr("data-document-id")});
                    }
                }
            });
    });
}


