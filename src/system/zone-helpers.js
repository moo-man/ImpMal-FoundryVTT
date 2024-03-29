import DocumentChoice from "../apps/document-choice";
import { ImpMalEffect } from "../document/effect";
import { SocketHandlers } from "./socket-handlers";

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


    /**
     * Get all Tokens inside drawing
     * 
     * @param {Drawing|DrawingDocument} drawing Drawing object being tested
     * @returns 
     */
    static tokensInDrawing(drawing)
    {
        let scene = drawing.scene;
        let tokens = scene.tokens.contents;
        return tokens.filter(t => this.isInDrawing(t.object.center, drawing));
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
        let zoneTraits = drawing.document.flags?.impmal?.traits || {};
        let zoneEffects = drawing.document.flags?.impmal?.effects || [];
        this._combineTraitsFromEffects(zoneEffects, zoneTraits);

        for (let key in zoneTraits)
        {
            if (zoneTraits[key])
            {
                if (typeof zoneTraits[key] == "boolean")
                {
                    traits.push(key); // For boolean properties, the effect key is the property name
                }
                else if (typeof zoneTraits[key] == "string")
                {
                    traits.push(zoneTraits[key]); // For selection properties, the effect key is the value 
                }
            }
        }
        
        // Return trait effects and any other added effects
        return traits.map(i => foundry.utils.deepClone(game.impmal.config.zoneEffects[i]))
            .concat(zoneEffects || [])
            .map(effect => 
            {
            // Designate all zone effects with a flag to easily be distinguished
                setProperty(effect, "flags.impmal.fromZone", drawing.document.uuid);
                setProperty(effect, "flags.impmal.applicationData.zoneType",  "");
                effect.origin = drawing.document.uuid;
                return effect;
            });
    }

    // Zone effects can designate traits to add (e.g. a power making a zone a Minor Hazard)
    // This collects all of them into a single trait object
    static _combineTraitsFromEffects(effects, allTraits={})
    {
        for(let effect of effects)
        {
            let effectTraits = effect.flags.impmal.applicationData?.traits || {};

            for(let key in effectTraits)
            {
                if (effectTraits[key])
                {

                    // If effect trait is a boolean, set collection value to true
                    if (typeof effectTraits[key] == "boolean")
                    {
                        allTraits[key] = true;
                    }
                    // If effect trait is a string, compare and only set if effect trait is greater
                    // e.g. if allTraits has mediumCover, and effect specifies heavyCover, use heavyCover if effect specifies lightCover, don't use (medium is greater)
                    else if (this.isGreaterTrait(effectTraits[key], allTraits[key]))
                    {
                        allTraits[key] = effectTraits[key];
                    }
                }
            }
        }
        return allTraits;
    }
    
    // returns true if trait1 is greater than trait2
    // trait1 = lightCover, trait2 = mediumCover, return false
    // trait1 = heavyCover, trait2 = mediumCover, return true
    static isGreaterTrait(trait1, trait2)
    {
        let effectList = ["lightCover", "mediumCover", "heavyCover", "lightlyObscured", "heavilyObscured", "minorHazard", "majorHazard", "deadlyHazard", "poorlyLit", "dark"];
        return effectList.findIndex(i => i == trait1) > effectList.findIndex(i => i == trait2);
    }

    // Follow Effects are tied to actors, but apply to the zone they are in
    static followEffects(tokens)
    {
        if (!(tokens instanceof Array))
        {
            tokens = [tokens];
        }
        return tokens.map(t => t.actor) // Take all token actors 
            .filter(t => t)
            .reduce((prev, current) => prev // Reduce them to just their "Follow" zone effects
                .concat(Array.from(current.allApplicableEffects())
                    .filter(e => e.applicationData.zoneType == "follow")), [])
            .map(effect =>                  // Convert these effects to data  
            {
                let data = effect.toObject();
                if (data.statuses.length == 0) // Zone effects should alway show on a token
                {
                    data.statuses.push(effect.name.slugify());
                }
                return data;
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
            // Note that some effects are denoted as "kept" and are not removed upon leaving the zone
            for(let drawing of left)
            {
                toRemove = toRemove.concat(currentZoneEffects.filter(effect => effect.flags.impmal.fromZone == drawing.document.uuid && !effect.flags.impmal.applicationData?.keep));
            }

            for(let drawing of entered)
            {
                toAdd = toAdd.concat(ZoneHelpers.zoneEffects(drawing));
            }


            await token.actor.deleteEmbeddedDocuments("ActiveEffect", toRemove.filter(e => e).map(e => e.id));
            await token.actor.createEmbeddedDocuments("ActiveEffect", toAdd.filter(e => e && e.flags.impmal?.following != token.uuid));
            // Don't re-add following effect to the token that it's following

            // If the token that got updated has an effect following it
            // Add it to the drawing entered, remove it from the drawings left
            // This will trigger checkDrawingUpdate to apply and remove from actors
            let followEffects = this.followEffects(token);
            if (followEffects.length)
            {
                followEffects.forEach(e => setProperty(e, "flags.impmal.following", token.uuid));
                for(let drawing of entered)
                {
                    let zoneEffects = foundry.utils.deepClone(drawing.document.flags.impmal?.effects || []);
                    zoneEffects = zoneEffects.concat(followEffects);
                    await SocketHandlers.executeOnOwner(drawing.document, "updateDrawing", {uuid: drawing.document.uuid, data : {flags : {impmal: {effects : zoneEffects}}}});
                }

                for(let drawing of left)
                {
                    let zoneEffects = foundry.utils.deepClone(drawing.document.flags.impmal?.effects || []);
                    zoneEffects = zoneEffects.filter(e => e.flags.impmal?.following != token.uuid);
                    await SocketHandlers.executeOnOwner(drawing.document, "updateDrawing", {uuid: drawing.document.uuid, data : {flags : {impmal: {effects : zoneEffects}}}});
                }
            }   
        }
    }

    /**
     * When a Drawing is updated (either moved, or an effect is added to it), remove all existing 
     * effects from that zone, and add them back again to all tokens in that zone
     * 
     * @param {Drawing} drawing Drawing being updated
     * @param {Array} tokens Array of Token objects
     */
    static async checkDrawingUpdate(drawing)
    {
        let effects = this.zoneEffects(drawing);

        for(let token of drawing.scene.tokens.map(t => t.object))
        {
            let currentZoneEffects = token.actor.currentZoneEffects.filter(e => e.getFlag("impmal", "fromZone") == drawing.document.uuid);

            // Remove all effects originating from this zone
            await token.actor.deleteEmbeddedDocuments("ActiveEffect", currentZoneEffects.map(i => i.id));

            if (ZoneHelpers.isInDrawing(token.center, drawing))
            {
                // Add them back to those still in the drawing
                await token.actor?.createEmbeddedDocuments("ActiveEffect", effects.filter(e => e && e.flags.impmal?.following != token.document.uuid));
            }
        }
    }


    static promptZoneEffect(effectUuids, messageId)
    {
        if (typeof effectUuids == "string")
        {
            effectUuids = [effectUuids];
        }

        // Zone must have Text
        let zones = canvas.scene.drawings.contents.filter(d => d.text).map(d => 
        {
            return {
                name : d.text,
                id : d.id
            };
        });

        if (zones.length == 0)
        {
            return ui.notifications.error("IMPMAL.ErrorNoZones", {localize : true});
        }

        DocumentChoice.create(zones, 1, {text : game.i18n.localize("IMPMAL.PickZone")}).then(choices => 
        {
            this.applyEffectToZone(effectUuids, messageId, canvas.scene.drawings.get(choices[0].id));
        });
    }

    /**
     * Apply a zone effect ot a zone. There are three kinds of zone effects
     * 
     * 1. Effects tied to that zone and apply to tokens within
     * 2. Effects that are applied once to tokens within that zone
     * 3. Effects that are tied to a single token and apply to whatever zone that token is in
     * 
     * Since this function can be passed multiple effects, this function separates them into case 1 and case 2 (3 isn't handled here)
     * Case 1 is added to the zone flags, case 2 is applied to each token
     * 
     * @param {Sting} effectUuids UUIDS of effects being applied
     * @param {String} messageId ID of source message
     * @param {Drawing} drawing Zone being applied to 
     * @returns 
     */
    static async applyEffectToZone(effectUuids, messageId, drawing)
    {
        let owningUser = game.impmal.utility.getActiveDocumentOwner(drawing);
        if (owningUser?.id == game.user.id)
        {
            let zoneEffects = foundry.utils.deepClone(drawing.flags.impmal?.effects || []);

            let tokenEffectUuids = [];
            for (let uuid of effectUuids)
            {
                let originalEffect = fromUuidSync(uuid);
                let message = game.messages.get(messageId);
                let zoneEffect = await ImpMalEffect.create(originalEffect.convertToApplied(), {temporary : true, message : message?.id});

                if (zoneEffect.applicationData.zoneType == "tokens")
                {
                    tokenEffectUuids.push(uuid);
                }
                else if (zoneEffect.applicationData.zoneType == "zone")
                {
                    zoneEffects.push(zoneEffect.toObject());
                }
            }
            let tokens = this.tokensInDrawing(drawing.object);
            return Promise.all([drawing.setFlag("impmal", "effects", zoneEffects)].concat(tokens.map(t => t.actor.applyEffect({effectUuids : tokenEffectUuids, messageId}))));
        }
        else 
        {
            SocketHandlers.executeOnOwner(drawing, "applyZoneEffect", {effectUuids, drawingUuid : drawing.uuid, messageId});
        }
    }
}