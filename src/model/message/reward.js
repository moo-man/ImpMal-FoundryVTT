import RewardDialog from "../../apps/reward-dialog";

export class RewardMessageModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};

        schema.xp = new fields.NumberField();
        schema.solars = new fields.NumberField();
        schema.patron = new fields.EmbeddedDataField(DocumentReferenceModel)
        schema.reason = new fields.StringField();

        schema.receivedBy = new fields.ArrayField(new fields.StringField());
        return schema;
    }

    async applyRewardTo(actor)
    {
        if (actor.type != "character")
        {
            return;
        }
        else 
        {
            if (this.receivedBy.includes(actor.id))
            {
                if (game.user.isGM)
                {
                    let proceed = await foundry.applications.api.DialogV2.confirm({content : `<p><strong>${actor.name}<strong> has already received this reward, apply anyway?</p>`})

                    if (!proceed)
                    {
                        return;
                    }
                }
                else 
                {
                    return ui.notifications.error(game.i18n.format("IMPMAL.ErrorRewardAlreadyReceived", {name : actor.name}));
                }
            }

            // Modify data locally so we don't have to wait for the GM to add to the received array
            // This prevents quickly clicking on bad connections from possibly receiving multiple rewards
            this.receivedBy.push(actor.id);

            let str = [this.xp && `${this.xp} XP`, this.solars && `${this.solars} Solars`].filter(i => i);
            ChatMessage.create({content : `<p><strong>${actor.name}</strong> received ${str.join(" and ")}`, flavor : "Reward", speaker : {alias : game.user.name}, "flags.impmal.rewardReceived" : {actor : actor.id, source : this.parent.id}});
            actor.update(actor.system.applyReward({xp : this.xp, solars : this.solars, reason : this.reason}), {skipXPReason : true})
        }
    }

    static async postReward({xp, solars, patron, reason})
    {
        if (!xp && !solars && !reason)
        {
            let reward = await RewardDialog.prompt();
            xp = reward.xp;
            solars = reward.solars;
            reason = reward.reason;
        }

        let content = await renderTemplate("systems/impmal/templates/chat/reward.hbs", {xp, solars, patron, reason});
        ChatMessage.create({
            content,
            type : "reward",
            system : {
                xp,
                solars,
                patron : {id : patron?.id},
                reason
            },
            speaker : {alias : patron?.name, actor : patron?.id},
            flavor : game.i18n.localize("IMPMAL.Reward")
        });
    }
}