export class ImpMalTestMessageModel extends WarhammerTestMessageModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};
        schema.context = new fields.ObjectField();
        schema.data = new fields.ObjectField();
        schema.result = new fields.ObjectField();
        schema.class = new fields.StringField();
        return schema;
    }

    static get actions() 
    { 
        foundry.utils.mergeObject(super.actions, {
            resistPower : this._onResistPower,
            buyItem  :  this._onBuyItem
        });
    }

    static _onResistPower(ev, target)
    {
        let test = this.test;
        let uuid = target.dataset.uuid;
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
    }

    static _onBuyItem(ev, target)
    {
        this.test?.buyItem(game.user.character);
    }

    get test() 
    {
        let test = new (game.impmal.testClasses[this.class])(this);
        return test;
    }

    onRender(html)
    {
        if (!this.parent.isAuthor && !this.parent.isOwner)
        {
            html.querySelectorAll(".test-breakdown").forEach(e => e.remove());
        }

        html.querySelector(".item-image")?.addEventListener("dragstart", ev => {
            ev.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({type : "Item", uuid : this.test.context.uuid}));
        })
    }
}