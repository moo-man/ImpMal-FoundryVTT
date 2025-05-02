import { EditTestForm } from "../apps/edit-test";
import ImpMalTables from "./tables";

export class ImpMalChatMessage extends WarhammerChatMessage 
{
    async _onCreate(data, options, userId)
    {
        await super._onCreate(data, options, userId);
        await this.system.test?.context?.handleOpposed(this);
    }

    async _onUpdate(data, options, userId)
    {
        await super._onUpdate(data, options, userId);
        await this.system.test?.context?.handleOpposed(this, true);
    }

    static chatListeners(html)
    {
        ImpMalTables.listeners(html);
    }

    static addTestContextOptions(options)
    {
        let hasTest = li =>
        {
            let message = game.messages.get(li.dataset.messageId)
            return message.type == "test";
        };

        let canEdit = li =>
        {
            return hasTest(li) && game.user.isGM;
        };

        options.unshift(
            {
                name: game.i18n.localize("IMPMAL.EditTest"),
                icon: '<i class="fa-solid fa-edit"></i>',
                condition: canEdit,
                callback: li =>
                {
                    let message = game.messages.get(li.dataset.messageId)
                    new EditTestForm(message.system.test).render(true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.RerollTest"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.dataset.messageId)
                    message.system.test.reroll();
                }
            },
            {
                name: game.i18n.localize("IMPMAL.RerollTestFate"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.dataset.messageId)
                    message.system.test.reroll(true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.AddSLFate"),
                icon: '<i class="fa-solid fa-plus"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.dataset.messageId)
                    message.system.test.addSL(1, true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.AddTargets"),
                icon: '<i class="fa-solid fa-crosshairs"></i>',
                condition: () => game.user.targets.size > 0,
                callback: li =>
                {
                    let message = game.messages.get(li.dataset.messageId)
                    let test = message.system.test;

                    let targetedSpeakers = Array.from(game.user.targets).map(i => ChatMessage.getSpeaker({token : i.document}));

                    // Filter out tokens already targeted
                    let newSpeakers = targetedSpeakers.filter(speaker => !test.context.targetSpeakers.find(existing => existing.token == speaker.token));

                    test.context.targetSpeakers = test.context.targetSpeakers.concat(newSpeakers);
                    test.roll();
                }
            },
        );
    }
}