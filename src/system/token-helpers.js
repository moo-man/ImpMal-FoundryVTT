export default class TokenHelpers 
{
    static highlightToken(tokenId)
    {
        let token = canvas.scene.tokens.get(tokenId);
        token?.object?._onHoverIn({});
    }

    static unhighlightToken(tokenId)
    {
        let token = canvas.scene.tokens.get(tokenId);
        token?.object?._onHoverOut({});
    }

    /**
     *  Hovering on an Opposed token image in chat should highlight the token on the canvas
     */
    static _onHoverInOpposedImg(ev)
    {
        let tokenId = ev.target.parentElement.dataset.id;
        this.highlightToken(tokenId);
    }

    static _onHoverOutOpposedImg(ev)
    {
        let tokenId = ev.target.parentElement.dataset.id;
        this.unhighlightToken(tokenId);
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


    static displayScrollingNumber(number, actor, {color="", stroke="0x000000"}={}) 
    {
        const tokens = actor.getActiveTokens();

        for ( let t of tokens ) 
        {
            if ( !t.visible || !t.renderable ) { continue; }
            canvas.interface.createScrollingText(t.center, number, {
                anchor: CONST.TEXT_ANCHOR_POINTS.CENTER,
                direction: CONST.TEXT_ANCHOR_POINTS.TOP,
                distance: (2 * t.h),
                fontSize: 36,
                fill: color,
                stroke,
                strokeThickness: 4,
                jitter: 0.25
            });
        }
    }
}

