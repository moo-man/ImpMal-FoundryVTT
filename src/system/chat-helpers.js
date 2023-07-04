export default class ChatHelpers 
{

    static removeGMOnlyElements(html)
    {
        if (!game.user.isGM)
        {
            html.find(".gm-only").remove();
        }
    }

    static addOpposedHighlightListeners(html)
    {
        
        html.on("mouseover", ".targets img", this._onHoverInOpposedImg.bind(this));
        html.on("click", ".targets img", this._onClickOpposedImg.bind(this));
        html.on("dblclick", ".targets img", this._onDoubleClickOpposedImg.bind(this));
        html.on("mouseout", ".targets img", this._onHoverOutOpposedImg.bind(this));

        html.on("mouseover", ".opposed-icon", this._onHoverOpposedIcon.bind(this));
        html.on("mouseout", ".opposed-icon", this._onHoverOpposedIcon.bind(this));
        html.on("click", ".opposed-icon", this._onClickOpposedIcon.bind(this));
    }

    /**
     *  Hovering on an Opposed token image in chat should highlight the token on the canvas
     */
    static _onHoverInOpposedImg(ev)
    {
        let tokenId = ev.target.parentElement.dataset.id;
        let token = canvas.scene.tokens.get(tokenId);
        token?.object?._onHoverIn(ev);
    }

    static _onHoverOutOpposedImg(ev)
    {
        let tokenId = ev.target.parentElement.dataset.id;
        let token = canvas.scene.tokens.get(tokenId);
        token?.object?._onHoverOut(ev);
    }

    /**
     * Clcicking on the Opposed token image in chat should pan the canvas to the token
     */
    static _onClickOpposedImg(ev)
    {
        // Prevents execution when double clicking
        if(this._onClickOpposedImg.clicked)
        {
            clearTimeout(this._onClickOpposedImg.clicked);
            delete this._onClickOpposedImg.clicked;
            return;
        }
        else 
        {
            this._onClickOpposedImg.clicked = setTimeout((ev) => 
            {
                let tokenId = ev.target.parentElement.dataset.id;
                let token = canvas.scene.tokens.get(tokenId);
                canvas.animatePan(token);
                delete this._onClickOpposedImg.clicked;
            }, 200, ev);
        }
    }

    /**
     *  Double clicking on the Opposed token image in chat should open the token's sheet
     */
    static _onDoubleClickOpposedImg(ev)
    {
        ev.stopPropagation();
        ev.preventDefault();
        let tokenId = ev.target.parentElement.dataset.id;
        let token = canvas.scene.tokens.get(tokenId);
        token.actor.sheet.render(true);
    }

    /**
     *  Hovering on an Opposed Icon (crosshair or shield) should highlight that message
     */
    static _onHoverOpposedIcon(ev)
    {

        let opposedMessage = _findOpposedMessage(ev);

        if (!opposedMessage)
        {
            return;
        }

        if (ev.type == "mouseover")
        {
            opposedMessage.classList.add("highlight");
        }
        else if (ev.type == "mouseout")
        {
            opposedMessage.classList.remove("highlight");
        }
    }

    /**
     *  Clicking on Opposed Icon (crosshair or shield) should scroll to that message and highlight it
     */
    static _onClickOpposedIcon(ev)
    {
        let opposedMessage = _findOpposedMessage(ev);

        if (!opposedMessage)
        {
            return;
        }

        ui.chat.element.find("ol").animate({scrollTop: opposedMessage.offsetTop}, 800);
        
        // Scrolling into view will remove the highlight, so add it for 1 second then remove
        opposedMessage.classList.add("highlight-delayed");
        setTimeout((message) => 
        {
            message.classList.remove("highlight-delayed");
        }, 1000, opposedMessage);
    }
}


/**
 * Helper that finds attacking/defending message when interacting with opposed sections;
 */
function _findOpposedMessage(ev)
{
    let el = $(ev.target);
    let messageId = el.parents(".message").attr("data-message-id");

    let opposed = el.parents("[data-id]");
    let side = opposed.hasClass("target") ? "defending" : "attacking";
    let tokenId = opposed.attr("data-id");
    let test = game.messages.get(messageId)?.test;
    let opposedMessage;
    if (test)
    {
        let opposedMessageId = side == "defending" ? test.context.responses[tokenId] : test.context.defendingAgainst;
        opposedMessage = ui.chat.element.find(`[data-message-id='${opposedMessageId}']`)[0];
    }
    return opposedMessage;
}