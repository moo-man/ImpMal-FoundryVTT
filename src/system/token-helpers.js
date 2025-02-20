export default function () {

        /**
         *  Hovering on an Opposed token image in chat should highlight the token on the canvas
         */
        TokenHelpers.onHoverInOpposedImg = function(ev) {
            let tokenId = ev.target.dataset.id;
            this.highlightToken(tokenId);
        };

        TokenHelpers.onHoverOutOpposedImg = function(ev) {
            let tokenId = ev.target.dataset.id;
            this.unhighlightToken(tokenId);
        };

        /**
         * Clcicking on the Opposed token image in chat should pan the canvas to the token
         */
        TokenHelpers.onClickOpposedImg = function(ev) {
            // Prevents execution when double clicking
            if (this.onClickOpposedImg.clicked) {
                clearTimeout(this.onClickOpposedImg.clicked);
                delete this.onClickOpposedImg.clicked;
                return;
            }
            else {
                this.onClickOpposedImg.clicked = setTimeout((ev) => {
                    let tokenId = ev.target.dataset.id;
                    let token = canvas.scene.tokens.get(tokenId);
                    canvas.animatePan(token);
                    delete this.onClickOpposedImg.clicked;
                }, 200, ev);
            }
        },

        /**
         *  Double clicking on the Opposed token image in chat should open the token's sheet
         */
        TokenHelpers.onDoubleClickOpposedImg = function(ev) {
            ev.stopPropagation();
            ev.preventDefault();
            let tokenId = ev.target.dataset.id;
            let token = canvas.scene.tokens.get(tokenId);
            token.actor.sheet.render(true);
        }
}