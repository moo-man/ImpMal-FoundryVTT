
export default class ChatHelpers 
{


    static scrollToMessage(messageId)
    {
        let message = ui.chat.element.querySelector(`[data-message-id='${messageId}']`);
        
        if (!message)
        {
            return;
        }
        
        ui.chat.element.querySelector("ol").animate({scrollTop: message.offsetTop}, 800);
        // Scrolling into view will remove the highlight, so add it for 1 second then remove
        message.classList.add("highlight-delayed");
        setTimeout((message) => 
        {
            message.classList.remove("highlight-delayed");
        }, 1000, message);
    }

    static highlightMessage(messageId)
    {
        let message = ui.chat.element.querySelector(`[data-message-id='${messageId}']`) ;
        message?.classList.add("highlight");
    }

    static unhighlightMessage(messageId)
    {
        let message = ui.chat.element.querySelector(`[data-message-id='${messageId}']`);
        message?.classList.remove("highlight");
    }

    static removeGMOnlyElements(html)
    {
        if (!game.user.isGM)
        {
            html.querySelectorAll(".gm-only").forEach(e => e.remove());
        }
    }


    static addOpposedHighlightListeners(html)
    {
        html.querySelector(".opposed .token")?.addEventListener("mouseover", TokenHelpers.onHoverInOpposedImg.bind(TokenHelpers));
        html.querySelector(".opposed .token")?.addEventListener("click", TokenHelpers.onClickOpposedImg.bind(TokenHelpers));
        html.querySelector(".opposed .token")?.addEventListener("dblclick", TokenHelpers.onDoubleClickOpposedImg.bind(TokenHelpers));
        html.querySelector(".opposed .token")?.addEventListener("mouseout", TokenHelpers.onHoverOutOpposedImg.bind(TokenHelpers));
    }
}