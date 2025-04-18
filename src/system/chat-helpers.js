
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
        html.on("mouseover", ".opposed .token", TokenHelpers.onHoverInOpposedImg.bind(TokenHelpers));
        html.on("click", ".opposed .token", TokenHelpers.onClickOpposedImg.bind(TokenHelpers));
        html.on("dblclick", ".opposed .token", TokenHelpers.onDoubleClickOpposedImg.bind(TokenHelpers));
        html.on("mouseout", ".opposed .token", TokenHelpers.onHoverOutOpposedImg.bind(TokenHelpers));
    }
}