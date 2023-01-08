import { EditTestForm } from "../../apps/edit-test";

export default function() 
{
    /**
 * Add right click option to damage chat cards to allow application of damage
 * Add right click option to use fortune point on own rolls
 */
    Hooks.on("getChatLogEntryContext", (html, options) => 
    {
        let canEdit = li => 
        {
            let message = game.messages.get(li.attr("data-message-id"));
            return message.test && game.user.isGM;
        };

        options.unshift(
            {
                name: game.i18n.localize("IMPMAL.EditTest"),
                icon: '<i class="fa-solid fa-edit"></i>',
                condition: canEdit,
                callback: li => 
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    new EditTestForm(message.test).render(true);
                }
            },
        );
    });
}