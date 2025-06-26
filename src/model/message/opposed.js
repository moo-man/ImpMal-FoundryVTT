import { OpposedTestResult } from "../../system/tests/opposed-result";

export class OpposedTestMessageModel extends WarhammerMessageModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};
        schema.attackerMessageId = new fields.StringField();//new fields.ForeignDocumentField(foundry.documents.BaseChatMessage);
        schema.defenderMessageId = new fields.StringField();//new fields.ForeignDocumentField(foundry.documents.BaseChatMessage);
        schema.targetTokenUuid = new fields.StringField()
        schema.unopposed = new fields.BooleanField();
        schema.result = new fields.ObjectField();
        schema.applied = new fields.ObjectField();
        return schema;
    }

    static get actions() 
    { 
        return foundry.utils.mergeObject(super.actions, {
            clickResponse : this._onClickResponse,
            applyDamage : this._onApplyDamage,
            applyZoneEffect : this.onApplyZoneEffect
        });
    }

    get attackerTest()
    {
        return this.attackerMessage?.system.test;
    }

    get defenderTest()
    {
        return this.defenderMessage?.system.test;
    }

    get attackerMessage()
    {
        return game.messages.get(this.attackerMessageId);
    }

    get defenderMessage()
    {
        return game.messages.get(this.defenderMessageId);
    }

    get target()
    {
        return fromUuidSync(this.targetTokenUuid)
    }

    static async createOpposed(attackerMessage, defenderToken)
    {

        let attackerTest = attackerMessage.system.test;
        let templateData = {
            attacker : attackerTest.context.token || attackerTest.actor.prototypeToken,
            defender : defenderToken,
            attackerTest : attackerTest,
            responseButtons : this._getResponseButtons(defenderToken)
        }
        let content = await renderTemplate("systems/impmal/templates/chat/opposed.hbs", templateData);

        let alias = `${game.i18n.localize("IMPMAL.OpposedTest")} - `

        if (attackerTest.item)
        {
            alias += attackerTest.item.name;
        }
        else 
        {
            alias += attackerTest.context.skill ? game.impmal.config.skills[attackerTest.context.skill] : game.impmal.config.characteristic[attackerTest.context.characteristic]
        }

        return ChatMessage.create({content, author : getActiveDocumentOwner(defenderToken?.actor)?.id, type : "opposed", speaker : {alias}, system : {
            attackerMessageId : attackerMessage.id,
            targetTokenUuid : defenderToken.uuid
        }})
    }

    async getContent()
    {
        let templateData = {
            attacker : this.attackerTest.context.token,
            defender : this.target,
            attackerTest : this.attackerTest,
            result : this.result,
            applied : foundry.utils.isEmpty(this.applied) ? false : this.applied,
            responseButtons : this.constructor._getResponseButtons(this.target)
        }
        let content = await renderTemplate("systems/impmal/templates/chat/opposed.hbs", templateData);
        return content;
    }

    async registerResponse(defenderMessage)
    {
        await this.parent.update({system : {
            defenderMessageId : defenderMessage.id, 
        }});
        this.defenderMessageId = defenderMessage.id;

        // await game.dice3d?.waitFor3DAnimationByMessageID(defenderMessage.id);
        await this.renderContent();
    }

    async renderContent(update={})
    {
        await this.parent.update(update);
        // foundry.utils.mergeObject(this.parent, update);
        this.result = this.computeResult()

        let content = await this.getContent();
        return this.parent.update({content, system : {
            result : {...this.result}
        }});
    }

    static _onClickResponse(ev, target)
    {
        if (target.dataset.type)
        {
            this.performResponse(target.dataset.type, target.dataset.uuid);
        }
    }

    static _onApplyDamage(ev, target)
    {
        this.applyDamage();
    }

    computeResult()
    {
        return new OpposedTestResult(this.attackerTest, this.defenderTest);
    }
    
    applyDamage()
    {
        let attackerTest = this.attackerTest;
        this.target?.actor?.applyDamage(this.result.damage, {ignoreAP : attackerTest.item?.system?.damage?.ignoreAP, location: attackerTest.result.hitLocation, opposed : this}).then(data => {
            data.multiple = this.applied.multiple ? this.applied.multiple + 1 : 1;
            this.applied = data;
            this.renderContent({"system.applied" : data})
            if (data.woundsGained > 0 && attackerTest.damageEffects.length)
            {
                this.target.actor.applyEffect({effectUuids : attackerTest.damageEffects.map(i => i.uuid), messageId : this.attackerMessageId});
            }
        })
    }

    performResponse(type,id)
    {
        switch(type)
        {
            case "dodge":
                return this.target?.actor?.setupSkillTest({key : "reflexes", name : "Dodge"});
            case "unopposed": 
                this.target.actor.setFlag("impmal", "opposed", null); 
                return this.renderContent({"system.unopposed" : true})
            case "weapon":
                this.target?.actor?.setupWeaponTest(id);
            case "trait":
                this.target?.actor?.setupTraitTest(id);
        
        }
    }

    onRender(html)
    {
        if (!game.user.isGM)
        {
            if (!this.target?.actor.isOwner)
            {
                html.querySelector(".response-buttons")?.remove();
            }
        }

        if (!this.attackerTest?.actor?.isOwner)
        {
            html.querySelector(".damage-breakdown")?.remove();
        }
    }

    static _getResponseButtons(defenderToken)
    {
        let buttons = [];

        if (defenderToken?.actor)
        {
            let actor = defenderToken.actor;
            buttons.push({icon : "fa-solid fa-reply", type: "dodge", tooltip : game.i18n.localize("Dodge")});
            if (actor.system.hands)
            {
                if (actor.system.hands.left.id == actor.system.hands.right.id && actor.system.hands.left.document)
                {
                    buttons.push({type: "weapon", tooltip : actor.system.hands.left.document.name, uuid : actor.system.hands.left.document.uuid, icon: "fa-solid fa-shield"})
                }
                else 
                {
                    if (actor.system.hands.left.document)
                    {
                        buttons.push({type: "weapon", tooltip : actor.system.hands.left.document.name, uuid : actor.system.hands.left.document.uuid, icon : "fa-solid fa-hand", class : `left ${actor.system.handed == "left" ? "primary" : "secondary"}`})
                    }
                    if (actor.system.hands.right.document)
                    {
                        buttons.push({type: "weapon", tooltip : actor.system.hands.right.document.name, uuid : actor.system.hands.right.document.uuid, icon : "fa-solid fa-hand", class : `right ${actor.system.handed == "right" ? "primary" : "secondary"}`})
                    }
                }
                for(let trait of actor.itemTypes.trait.filter(i => i.system.isMelee))
                {
                    buttons.push({tooltip : trait.name, uuid : trait.uuid, icon: "fa-solid fa-sword", type : "trait"})
                }
            }
            else 
            {
                for(let weapon of actor.itemTypes.weapon.filter(i => i.system.isEquipped && i.system.isMelee).concat(actor.itemTypes.trait.filter(i => i.system.isMelee)))
                {
                    buttons.push({type: weapon.type, tooltip : weapon.name, uuid : weapon.uuid, icon: "fa-solid fa-sword"})
                }
            }

            return buttons;
        }
        
    }

    // get result()
    // {
    //     if (this.defenderMessage || this.unopposed)
    //     {
    //         return new OpposedTestResult(this.attackerTest, this.defenderTest);
    //     }
    // }
}