import { ImpMalEffect } from "../document/effect";

export default class ZoneHelpers 
{
    /**
     * Determines if a coordinate is within a Drawing's strokes
     * 
     * @param {Object} {x, y} object being tested
     * @param {Drawing|DrawingDocument} drawing Drawing object being tested
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
     * Return an array of effect data based on Zone Settings
     * 
     * @param {Drawing} drawing Drawing instance
     * @returns 
     */
    static zoneEffects(drawing)
    {
        let traits = [];
        let zoneFlags = drawing.document.flags.impmal || {};
        for (let key in zoneFlags.traits)
        {
            if (zoneFlags.traits[key])
            {
                if (zoneFlags.traits[key] == true)
                {
                    traits.push(key); // For boolean properties, the effect key is the property name
                }
                else if (zoneFlags.traits[key] && typeof zoneFlags.traits[key] == "string")
                {
                    traits.push(zoneFlags.traits[key]); // For selection properties, the effect key is the value 
                }
            }
        }

        // Return trait effects and any other added effects
        return traits.map(i => game.impmal.config.zoneEffects[i]).concat(zoneFlags.effects || []).map(effect => 
        {
            // Designate all zone effects with a flag to easily be distinguished
            effect["flags.impmal.fromZone"] = drawing.document.uuid;
            effect.origin = drawing.document.uuid;
            return effect;
        });
    }

    /**
     * When a token is updated, check new position vs old and collect which zone effects
     * to add or remove based on zones left and entered. 
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

            let currentZoneEffects = token.actor?.currentZoneEffects || [];

            let entered = [];
            let left = [];
            for (let drawing of drawings)
            {
                if (ZoneHelpers.isInDrawing(postX, drawing) && !ZoneHelpers.isInDrawing(preX, drawing)) // If entering Zone
                {
                    entered.push(drawing);
                }

                if (!ZoneHelpers.isInDrawing(postX, drawing) && ZoneHelpers.isInDrawing(preX, drawing)) // If leaving Zone
                {
                    left.push(drawing);
                }
            }

            // Take the drawings the token left, filter through the actor's zone effects to find the ones from those drawings, mark those for removal
            for(let drawing of left)
            {
                toRemove = toRemove.concat(currentZoneEffects.filter(effect => effect.flags.impmal.fromZone == drawing.document.uuid));
            }

            for(let drawing of entered)
            {
                toAdd = toAdd.concat(ZoneHelpers.zoneEffects(drawing));
            }


            await token.actor.deleteEmbeddedDocuments("ActiveEffect", toRemove.filter(e => e).map(e => e.id));
            token.actor.createEmbeddedDocuments("ActiveEffect", toAdd.filter(e => e));
        }
    }

    /**
     * When a Drawing is updated (either moved, or an effect is added to it), remove all existing 
     * effects from that zone, and add them back again to all tokens in that zone
     * 
     * @param {Drawing} drawing Drawing being updated
     * @param {Array} tokens Array of Token objects
     */
    static async checkDrawingUpdate(drawing, tokens)
    {
        let effects = this.zoneEffects(drawing);

        for(let token of tokens)
        {
            let currentZoneEffects = token.actor.currentZoneEffects.filter(e => e.getFlag("impmal", "fromZone") == drawing.document.uuid);

            // Remove all effects originating from this zone
            await token.actor.deleteEmbeddedDocuments("ActiveEffect", currentZoneEffects.map(i => i.id));

            if (ZoneHelpers.isInDrawing(token.center, drawing))
            {
                // Add them back to those still in the drawing
                token.actor?.createEmbeddedDocuments("ActiveEffect", effects);
            }
        }
    }


    static applyZoneEffect(effectUuids, messageId)
    {
        if (typeof effectUuids == "string")
        {
            effectUuids = [effectUuids];
        }

        // Zone must have Text
        let zones = canvas.scene.drawings.contents.filter(d => d.text);

        new Dialog({
            title : "Choose Zone",
            content : `
            <p>Pick the Zone you wish to apply to. A Drawing must have Text to be selected.</p>
            <select>
            <option value=""></option>
            ${zones.map(zone => `<option value=${zone.id}>${zone.text}</option>`)}
            </select>`,
            buttons : {
                apply : {
                    label : "Apply",
                    callback : (dlg) => 
                    {
                        let select = dlg.find("select")[0];
                        let id = select.value;
                        if (id)
                        {
                            this.applyEffectToZone(effectUuids, messageId, canvas.scene.drawings.get(id));
                        }
                    }
                }
            }
        }).render(true);
    }

    static async applyEffectToZone(effectUuids, messageId, drawing)
    {
        let zoneEffects = foundry.utils.deepClone(drawing.flags.impmal?.effects || []);

        for (let uuid of effectUuids)
        {
            let originalEffect = fromUuidSync(uuid);
            let message = game.messages.get(messageId);
            let zoneEffect = await ImpMalEffect.create(originalEffect.convertToApplied(), {temporary : true, message : message?.id});
            zoneEffects.push(zoneEffect.toObject());
        }
        drawing.setFlag("impmal", "effects", zoneEffects);
    }
}