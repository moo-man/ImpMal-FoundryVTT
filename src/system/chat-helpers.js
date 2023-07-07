import TokenHelpers from "./token-helpers";

export default class ChatHelpers 
{


    static scrollToMessage(messageId)
    {
        let message = ui.chat.element.find(`[data-message-id='${messageId}']`)[0];
        
        if (!message)
        {
            return;
        }
        
        ui.chat.element.find("ol").animate({scrollTop: message.offsetTop}, 800);
        // Scrolling into view will remove the highlight, so add it for 1 second then remove
        message.classList.add("highlight-delayed");
        setTimeout((message) => 
        {
            message.classList.remove("highlight-delayed");
        }, 1000, message);
    }

    static highlightMessage(messageId)
    {
        let message = ui.chat.element.find(`[data-message-id='${messageId}']`)[0];
        message?.classList.add("highlight");
    }

    static unhighlightMessage(messageId)
    {
        let message = ui.chat.element.find(`[data-message-id='${messageId}']`)[0];
        message?.classList.remove("highlight");
    }

    static removeGMOnlyElements(html)
    {
        if (!game.user.isGM)
        {
            html.find(".gm-only").remove();
        }
    }

    static addOpposedHighlightListeners(html)
    {
        html.on("mouseover", ".targets img", TokenHelpers._onHoverInOpposedImg.bind(TokenHelpers));
        html.on("click", ".targets img", TokenHelpers._onClickOpposedImg.bind(TokenHelpers));
        html.on("dblclick", ".targets img", TokenHelpers._onDoubleClickOpposedImg.bind(TokenHelpers));
        html.on("mouseout", ".targets img", TokenHelpers._onHoverOutOpposedImg.bind(TokenHelpers));

        html.on("mouseover", ".opposed-icon", this._onHoverOpposedIcon.bind(this));
        html.on("mouseout", ".opposed-icon", this._onHoverOpposedIcon.bind(this));
        html.on("click", ".opposed-icon", this._onClickOpposedIcon.bind(this));
    }

    /**
     *  Hovering on an Opposed Icon (crosshair or shield) should highlight that message
     */
    static _onHoverOpposedIcon(ev)
    {

        let opposedMessageId = _findOpposedMessageId(ev);

        if (!opposedMessageId)
        {
            return;
        }

        if (ev.type == "mouseover")
        {
            this.highlightMessage(opposedMessageId);
        }
        
        else if (ev.type == "mouseout")
        {
            this.unhighlightMessage(opposedMessageId);
        }
    }

    /**
     *  Clicking on Opposed Icon (crosshair or shield) should scroll to that message and highlight it
     */
    static _onClickOpposedIcon(ev)
    {
        let opposedMessageId = _findOpposedMessageId(ev);
        this.scrollToMessage(opposedMessageId);
    }
}

/**
 * Helper that finds attacking/defending message when interacting with opposed sections;
 */
function _findOpposedMessageId(ev)
{
    let el = $(ev.target);
    let messageId = el.parents(".message").attr("data-message-id");

    let opposed = el.parents("[data-id]");
    let side = opposed.hasClass("target") ? "defending" : "attacking";
    let tokenId = opposed.attr("data-id");
    let test = game.messages.get(messageId)?.test;
    if (test)
    {
        return side == "defending" ? test.context.responses[tokenId] : test.context.defendingAgainst;
    }
}