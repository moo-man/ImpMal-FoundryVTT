import { EditTestForm } from "../apps/edit-test";
import { AvailabilityDialog } from "../apps/test-dialog/availability-dialog";
import ImpMalTables from "./tables";
import { AvailabilityTest } from "./tests/availability/availability-test";
import ZoneHelpers from "./zone-helpers";

export class ImpMalChatMessage extends ChatMessage 
{
    async _onCreate(data, options, userId)
    {
        await super._onCreate(data, options, userId);
        this.test?.context?.handleOpposed(this);
    }

    async _onUpdate(data, options, userId)
    {
        await super._onUpdate(data, options, userId);
        this.test?.context?.handleOpposed(this, options);
    }

    get test() 
    {
        let test = this.getFlag("impmal", "test");
        if (test)
        {
            try 
            {
                test.context.messageId = this.id;
                return new game.impmal.testClasses[test.class](test);
            }
            catch(e)
            {
                console.error("Could not construct Test object: " + e);
                return undefined;
            }
        }
        else 
        {
            return undefined;
        }
    }

    static corruptionMessage(value=1, options={}, chatData={})
    {
        if (Number.isNumeric(value))
        {
            value = Number(value);
        }
        value = typeof value == "string" ? game.impmal.config.corruptionValues[value] : value;
        let label;
        if (Number.isNumeric(value))
        {
            if (value == 1)
            {
                label = "IMPMAL.Minor";
            }
            else if (value < 4)
            {
                label = "IMPMAL.Moderate";
            }
            else if (value >= 4)
            {
                label = "IMPMAL.Major";
            }
        }
        ChatMessage.create(mergeObject({content : `
            <h3 style="text-align: center">${game.i18n.format("IMPMAL.ExposureToCorruption", {label : game.i18n.localize(label)})}</h3>
            <button type="button" class="resist-corruption" data-value=${value} difficulty=${options.difficulty}>${game.i18n.localize("IMPMAL.Resist")}</button>
        `}, chatData));
    }


    static chatListeners(html)
    {

        ImpMalTables.listeners(html);

        html.on("click", ".apply-damage", async ev => 
        {
            let el = $(ev.currentTarget);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let test = message.test;
            let targetId = el.parents(".target").attr("data-id");
            let apply = true;
            if (test.context.appliedDamage[targetId])
            {
                apply = await Dialog.confirm({
                    title : game.i18n.localize("IMPMAL.ReapplyDamageTitle"),
                    content : game.i18n.localize("IMPMAL.ReapplyDamagePrompt"),
                    yes : () => {return true;},
                    no : () => {return false;},
                    close : () => {return false;},
                });
            }
            if (apply)
            {
                test.applyDamageTo(targetId);
            }
        });

        html.on("click", ".apply-effect", async ev => 
        {
            let el = $(ev.currentTarget);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let test = message.test;

            if (ev.currentTarget.dataset.type == "zone")
            {
                ZoneHelpers.promptZoneEffect(ev.currentTarget.dataset.uuid, message.id);
            }

            else if (ev.currentTarget.dataset.type == "target")
            {
                // If user has active targets, use those, otherwise, use test's targets, if there aren't any, use test's own actor
                let targetActors = game.user.targets.size > 0 
                    ? Array.from(game.user.targets).map(i => i.actor) 
                    : test.context.targets.map(i => i.actor);
                
                if (targetActors.length == 0 || test.item?.system?.target?.slugify() == "self") // Self powers should only target self
                {
                    targetActors = [test.actor];
                }

                for(let actor of targetActors)
                {
                    actor.applyEffect({effectUuids: ev.currentTarget.dataset.uuid, messageId: message.id});                
                }
            }
            
        });

        html.on("click", ".roll", ev => 
        {
            let el = $(ev.currentTarget);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let test = message.test;
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

            let effects = (test.item?.targetEffects || []).filter(e => e.applicationData.options.avoidTest?.opposed);

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
            let actors = game.user.targets.size ? Array.from(game.user.targets).map(i => i.actor) : [game.user.character];
            actors = actors.filter(a => a);
            let corruption = ev.target.dataset.value;
            if (!actors.length)
            {
                return ui.notifications.error(game.i18n.localize("IMPMAL.ErrorNoActorsOrTargets"));
            }
            else 
            {
                actors.forEach(async a => 
                {
                    new Dialog({
                        title : game.i18n.localize("IMPMAL.CorruptionPrompt"),
                        content : game.i18n.localize("IMPMAL.CorruptionPromptContent"),
                        buttons : {
                            fortitude : {
                                label : game.i18n.localize("IMPMAL.Fortitude"),
                                callback : () => 
                                {
                                    a.setupSkillTest({key : "fortitude"}, {title : {append : " – Corruption"}, context : {corruption}});
                                }
                            },
                            discipline : {
                                label : game.i18n.localize("IMPMAL.Discipline"),
                                callback : () => 
                                {
                                    a.setupSkillTest({key : "discipline"}, {title : {append : " – Corruption"}, context : {corruption}});
                                }
                            },
                        }
                    }).render(true);
                });
            }
        });

        html.on("dragstart", ".item-image", ev => 
        {
            let el = $(ev.target);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let test = message.test;

            ev.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({type : "Item", uuid : test.context.uuid}));
        });

        html.on("click", ".availability", async ev => 
        {
            let el = $(ev.target);
            let message = game.messages.get(el.parents(".message").attr("data-message-id"));
            let itemData = message.getFlag("impmal", "itemData");
    
            let dialogData = AvailabilityDialog.setupData({availability : itemData.system.availability},null, {title : {append : " - " + itemData.name}});
    
            let setupData = await AvailabilityDialog.awaitSubmit(dialogData);
    
            let test = AvailabilityTest.fromData(setupData);
            await test.roll();
            test.sendToChat();
            return test;
        

        });
    }

    static addTestContextOptions(options)
    {
        let hasTest = li =>
        {
            let message = game.messages.get(li.attr("data-message-id"));
            return message.test;
        };

        let hasPendingOpposedTests = li => 
        {
            let message = game.messages.get(li.attr("data-message-id"));
            return hasTest(li) && message.test.context.targets.some(t => !t.test && !t.unopposed); // If no response test, and not unopposed = pending opposed test
        };

        let canEdit = li =>
        {
            return hasTest(li) && game.user.isGM;
        };

        options.unshift(
            {
                name: game.i18n.localize("IMPMAL.Unopposed"),
                icon: '<i class="fa-solid fa-arrow-right"></i>',
                condition: hasPendingOpposedTests && game.user.isGM,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    let test = message.test;
                    test.context.fillUnopposed();
                    test.roll();
                }
            },
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
            {
                name: game.i18n.localize("IMPMAL.RerollTest"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.test.reroll();
                }
            },
            {
                name: game.i18n.localize("IMPMAL.RerollTestFate"),
                icon: '<i class="fa-solid fa-rotate-right"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.test.reroll(true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.AddSLFate"),
                icon: '<i class="fa-solid fa-plus"></i>',
                condition: hasTest,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    message.test.addSL(1, true);
                }
            },
            {
                name: game.i18n.localize("IMPMAL.AddTargets"),
                icon: '<i class="fa-solid fa-crosshairs"></i>',
                condition: () => game.user.targets.size > 0,
                callback: li =>
                {
                    let message = game.messages.get(li.attr("data-message-id"));
                    let test = message.test;

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