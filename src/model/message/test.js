import ChatHelpers from "../../system/chat-helpers";

export class ImpMalTestMessageModel extends WarhammerTestMessageModel {
    static defineSchema() {
        let fields = foundry.data.fields;
        let schema = {};
        schema.context = new fields.ObjectField();
        schema.data = new fields.ObjectField();
        schema.result = new fields.ObjectField();
        schema.class = new fields.StringField();
        return schema;
    }

    static get actions() {
        return foundry.utils.mergeObject(super.actions, {
            resistPower: this._onResistPower,
            buyItem: this._onBuyItem // Availability Tests
        });
    }


    async getHeaderToken() {
        if (this.test.actor) {
            let token = this.test.actor.getActiveTokens()[0]?.document || this.test.actor.prototypeToken;

            let path = token.hidden ? "modules/impmal-core/assets/tokens/unknown.webp" : token.texture.src;

            if (foundry.helpers.media.VideoHelper.hasVideoExtension(path)) {
                path = await game.video.createThumbnail(path, { width: 50, height: 50 }).then(img => chatOptions.flags.img = img)
            }

            return path;
        }
        else return false
    }

    async onRender(html) {

        let token = await this.getHeaderToken();
        if (token) {
            let header = html.querySelector(".message-header");
            let div = document.createElement("div")
            div.classList.add("message-token");
            let image = document.createElement("img");
            image.src = token
            image.style.zIndex = 1;

            div.appendChild(image);
            header.insertBefore(div, header.firstChild);

            warhammer.utility.replacePopoutTokens(html);
        }


        if (!this.parent.isAuthor && !this.parent.isOwner) {
            html.querySelectorAll(".test-breakdown").forEach(e => e.remove());
        }

        html.querySelector(".item-image")?.addEventListener("dragstart", ev => {
            ev.dataTransfer.setData("text/plain", JSON.stringify({ type: "Item", uuid: this.test.context.uuid }));
        })
    }


    static _onResistPower(ev, target) {
        let test = this.test;
        let uuid = target.dataset.uuid;
        let actors = [];
        if (game.user.character) {
            actors.push(game.user.character);
        }
        else {
            actors = canvas.tokens.controlled.map(t => t.actor);
        }

        let effects = (test.item?.targetEffects || []).filter(e => e.system.transferData.avoidTest?.opposed);

        actors.forEach(async a => {
            if (effects.length) {
                await a.applyEffect({ effectUuids: effects.map(e => e.uuid), messageId: test.message.id });
            }
            else {
                a.setupTestFromItem(uuid);
            }
        });
    }

    static _onBuyItem(ev, target) {
        for(let actor of selectedWithFallback())
        {
            this.test?.buyItem(actor);
        }
    }

    get test() {
        let test = new (game.impmal.testClasses[this.class])(this);
        return test;
    }
}