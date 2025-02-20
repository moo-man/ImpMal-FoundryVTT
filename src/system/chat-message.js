import { EditTestForm } from "../apps/edit-test";
import ImpMalTables from "./tables";

export class ImpMalChatMessage extends ChatMessage 
{
    async _onCreate(data, options, userId)
    {
        await super._onCreate(data, options, userId);
        await this.system.test?.context?.handleOpposed(this);
    }

    async _onUpdate(data, options, userId)
    {
        await super._onUpdate(data, options, userId);
        await this.system.test?.context?.handleOpposed(this, options);
    }

    static chatListeners(html)
    {

        ImpMalTables.listeners(html);

        
        html.on("click", ".apply-target", WarhammerChatListeners.onApplyTargetEffect)
        html.on("click", ".apply-zone", WarhammerChatListeners.onApplyZoneEffect)

        html.on("click", ".response-buttons button", async ev => {
            let el = $(ev.currentTarget);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            if (ev.target.classList.contains("unopposed"))
            {
                message.system.performResponse("unopposed");
            }
            else if (ev.target.classList.contains("dodge"))
            {
                message.system.performResponse("dodge");
            }
            else if (ev.target.dataset.uuid)
            {
                message.system.performResponse(ev.target.dataset.uuid);
            }
        })

        html.on("click", ".apply-damage", async ev => 
        {
            let el = $(ev.currentTarget);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            message.system.applyDamage();
        });

        html.on("click", ".roll", ev => 
        {
            let el = $(ev.currentTarget);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let test = message.system.test;
            let uuid = ev.currentTarget.dataset.uuid;
            let actors = [];
            if (game.user.character)
            {
                actors.push(game.user.character);
            }
            else 
            {
                actors = canvas.tokens.controlled.map(t => t.actor);
            }

            let effects = (test.item?.targetEffects || []).filter(e => e.system.transferData.avoidTest?.opposed);

            actors.forEach(async a => 
            {
                if (effects.length)
                {
                    await a.applyEffect({effectUuids: effects.map(e => e.uuid), messageId : test.message.id});
                }
                else 
                {
                    a.setupTestFromItem(uuid);
                }
            });
        });

        html.on("click", ".resist-corruption", ev => 
        {
            let message = game.messages.get($(ev.currentTarget).parents(".message")[0].dataset.messageId);

            let actors = warhammer.utility.targetedOrAssignedActors();

            for(let a of actors)
            {
                message.system.applyCorruptionTo(a);
            }
        });

        html.on("dragstart", ".item-image", ev => 
        {
            let el = $(ev.target);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let test = message.system.test;

            ev.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({type : "Item", uuid : test.context.uuid}));
        });

        html.on("click", "button.availability", async ev =>
        {
            let el = $(ev.target);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            message.system.rollAvailability();
        });

        html.on("click", "button.buy-item", async ev =>
        {
            let el = $(ev.target);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            if (message.type == "item")
            {
                message.system.buyItem(game.user.character);
            }
            else 
            {
                message.system.test?.buyItem(game.user.character);
            }
        });

        html.on("click", ".receive-reward", async ev => 
        {
            let el = $(ev.target);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));

            let actors=[];

            if (game.user.isGM)
            {
                if (game.user.targets.size)
                {
                    actors = game.user.targets.map(i => i.actor).filter(i => i);
                }
                else 
                {
                    return ui.notifications.error("IMPMAL.ErrorTargetActorsForReward", {localize : true})
                }
            }
            else 
            {
                if (game.user.character)
                {
                    actors = [game.user.character]
                }
                else 
                {
                    return ui.notifications.error("IMPMAL.ErrorNoActorAssigned", {localize : true})
                }
            }

            for(let a of actors)
            {
                message.system.applyRewardTo(a);
            }

        });
    }

    static addTestContextOptions(options)
    {
        let hasTest = li =>
        {
            let message = game.messages.get(li.attr("data-message-id"));
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
                    let message = game.messages.get(li.attr("data-message-id"));
                    new EditTestForm(message.system.test).render(true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.RerollTest"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.system.test.reroll();
                }
            },
            {
                name: game.i18n.localize("IMPMAL.RerollTestFate"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.system.test.reroll(true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.AddSLFate"),
                icon: '<i class="fa-solid fa-plus"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.system.test.addSL(1, true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.AddTargets"),
                icon: '<i class="fa-solid fa-crosshairs"></i>',
                condition: () => game.user.targets.size > 0,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
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