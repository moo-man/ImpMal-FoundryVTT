export default class ZoneHelpers 
{
    /**
     * Determines if a coordinate is within a Drawing's strokes
     * 
     * @param {Object} {x, y} object being tested
     * @param {Drawing} drawing Drawing object being tested
     * @returns 
     */
    static isInDrawing(point, drawing)
    {
        if (drawing.document.shape.type == "r")
        {
            return this._isInRect(point, drawing);
        }
        else if (drawing.document.shape.type == "p")
        {
            return this._isInPolygon(point, drawing);
        }
        else if (drawing.document.shape.type == "e")
        {
            return this._isInEllipse(point, drawing);
        }
    }

    static _isInRect(point, drawing)
    {
        let x1 = drawing.document.x;
        let x2 = x1 + drawing.document.shape.width;
        let y1 = drawing.document.y;
        let y2 = y1 + drawing.document.shape.height;

        if (point.x > x1 && point.x < x2 && point.y > y1 && point.y < y2)
        {
            return true;
        }
    }

    static _isInPolygon(point, drawing)
    {                                                                                 // points are relative to origin of the drawing, needs to be origin of the map
        let polygon = new PIXI.Polygon(drawing.document.shape.points.map((coord, index) => coord += index % 2 == 0 ? drawing.document.x : drawing.document.y ));
        return polygon.contains(point.x, point.y);
    }
    static _isInEllipse(point, drawing)
    {
        let ellipse = new PIXI.Ellipse(drawing.x + drawing.shape.width / 2, drawing.y + drawing.shape.height / 2, drawing.shape.width / 2, drawing.shape.height / 2);
        return ellipse.contains(point.x, point.y);
    }

    /**
     * Return an array of System effect keys based on Zone Settings
     * 
     * @param {Drawing} drawing Drawing instance
     * @returns 
     */
    static drawingEffects(drawing)
    {
        let effects = [];
        for (let key in (drawing.document.flags.impmal || {}))
        {
            let zoneFlags = drawing.document.flags.impmal;
            if (zoneFlags[key])
            {
                if (zoneFlags[key] == true)
                {
                    effects.push(key); // For boolean properties, the effect key is the property name
                }
                else if (zoneFlags[key] && typeof zoneFlags[key] == "string")
                {
                    effects.push(zoneFlags[key]); // For selection properties, the effect key is the value 
                }
            }
        }
        return effects;
    }

    /**
     * When a token is updated, check new position vs old and collect which zone effects
     * to add or remove based on zones left and entered. 
     * 
     * Current small bug: Moving to Zone A to Zone B where both A and B have the same effect 
     * removes that effect
     * 
     * @param {Token} token Token being updated
     * @param {Object} update Token update data (new x and y)
     * @param {Array} drawings Array of Drawing instances to check
     */
    static async checkTokenUpdate(token, update, drawings)
    {
        if (!(drawings instanceof Array))
        {
            drawings = [drawings];
        }

        if (update.x || update.y)
        {
            let preX = {x : token.object.center.x, y: token.object.center.y};
            let postX = {
                x :(update.x || token.x) + canvas.grid.size / 2 , 
                y: (update.y || token.y) + canvas.grid.size / 2
            };

            let toAdd = [];
            let toRemove = [];
            for (let drawing of drawings)
            {
                if (ZoneHelpers.isInDrawing(postX, drawing) && !ZoneHelpers.isInDrawing(preX, drawing)) // If entering Zone
                {
                    let effects = ZoneHelpers.drawingEffects(drawing);
                    for (let e of effects)
                    {
                        toAdd.push(token.actor.addCondition(e, {origin : drawing.document.uuid, create : false}));
                    }
                }

                if (!ZoneHelpers.isInDrawing(postX, drawing) && ZoneHelpers.isInDrawing(preX, drawing)) // If leaving Zone
                {
                    let effects = ZoneHelpers.drawingEffects(drawing);
                    for (let e of effects)
                    {
                        toRemove.push(token.actor.hasCondition(e)?.id);
                    }
                }
            }
            await token.actor.deleteEmbeddedDocuments("ActiveEffect", toRemove.filter(e => e));
            token.actor.createEmbeddedDocuments("ActiveEffect", toAdd.filter(e => e));
        }
    }

    /**
     * When a Drawing is updated, apply all zone effects that tokens within don't have
     * Note that this doesn't remove effects that the zone doesn't have, which is more complicated
     * 
     * @param {Drawing} drawing Drawing being updated
     * @param {Array} tokens Array of Token objects
     */
    static async checkDrawingUpdate(drawing, tokens)
    {
        let effects = this.drawingEffects(drawing);
        tokens = tokens.filter(token => ZoneHelpers.isInDrawing(token.center, drawing));

        for(let token of tokens)
        {
            let toAdd = [];
            for(let effect of effects)
            {
                if (!token.actor?.hasCondition(effect))
                {
                    toAdd.push(token.actor.addCondition(effect, {origin : drawing.document.uuid, create : false}));
                }
            }
            token.actor?.createEmbeddedDocuments("ActiveEffect", toAdd);
        }
    }
}