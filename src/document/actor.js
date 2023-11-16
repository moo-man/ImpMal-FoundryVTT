import DocumentChoice from "../apps/document-choice";
import { CharacteristicTestDialog } from "../apps/test-dialog/characteristic-dialog";
import { PowerTestDialog } from "../apps/test-dialog/power-dialog";
import { SkillTestDialog } from "../apps/test-dialog/skill-dialog";
import { TestDialog } from "../apps/test-dialog/test-dialog";
import { TraitTestDialog } from "../apps/test-dialog/trait-dialog";
import { WeaponTestDialog } from "../apps/test-dialog/weapon-dialog";
import { SocketHandlers } from "../system/socket-handlers";
import ImpMalTables from "../system/tables";
import { BaseTest } from "../system/tests/base/base-test";
import { CharacteristicTest } from "../system/tests/characteristic/characteristic-test";
import { ItemUse } from "../system/tests/item/item-use";
import { PowerTest } from "../system/tests/power/power-test";
import { SkillTest } from "../system/tests/skill/skill-test";
import { TraitTest } from "../system/tests/trait/trait-test";
import { WeaponTest } from "../system/tests/weapon/weapon-test";
import ZoneHelpers from "../system/zone-helpers";
import { ImpMalEffect } from "./effect";
import ImpMalDocumentMixin from "./mixin";

export class ImpMalActor extends ImpMalDocumentMixin(Actor)
{
    prepareBaseData()
    {
        this.propagateDataModels(this.system, "runScripts", this.runScripts.bind(this));
        this.itemCategories = this.itemTypes;
        this.system.computeBase(this.itemCategories);
        this.runScripts("prepareBaseData", this);
    }

    prepareDerivedData()
    {
        this.runScripts("prePrepareDerivedData", this);
        this.system.computeDerived(mergeObject(this.itemCategories, {all : this.items}, {inplace : false}));
        this.items.forEach(i => i.prepareOwnedData());
        this.runScripts("prepareOwnedItems", this);
        this.runScripts("postPrepareDerivedData", this);
    }

    /**
     *
     * @param {string} characteristic Characteristic key, such as "ws" or "str"
     * @param {object} options Optional properties to customize the test
     * @param {string} options.title.replace Replace dialog title
     * @param {string} options.title.append Append to dialog title
     * @param {object} options.fields Predefine dialog fields
     */
    setupCharacteristicTest(characteristic, options={}, roll=true)
    {
        return this._setupTest(CharacteristicTestDialog, CharacteristicTest, characteristic, options, roll);
    }

    setupSkillTest({itemId, name, key}={}, options={}, roll=true)
    {

        // Not sure I like this here but it will do for now
        // Warp State = 2 means you just roll on the Perils table
        // Warp State = 1 is handled in postRoll() of a skill test
        if (options?.context?.warp == 2)
        {
            let formula = `1d100 + ${10 * (this.system.warp.charge - this.system.warp.threshold)}`;
            ImpMalTables.rollTable("perils", formula);
            this.update({"system.warp.charge" : 0});
        }
        else 
        {
            return this._setupTest(SkillTestDialog, SkillTest, {itemId, name, key}, options, roll);
        }
    }

    setupWeaponTest(id, options={}, roll=true)
    {
        return this._setupTest(WeaponTestDialog, WeaponTest, id, options, roll);
    }

    setupGenericTest(target, options={}, roll=true)
    {
        return this._setupTest(TestDialog, BaseTest, target, options, roll);
    }

    setupPowerTest(id, options={}, roll=true)
    {
        return this._setupTest(PowerTestDialog, PowerTest, id, options, roll);
    }

    setupTraitTest(id, options={}, roll=true)
    {
        return this._setupTest(TraitTestDialog, TraitTest, id, options, roll);
    }

    useItem({id, uuid})
    {
        let use = ItemUse.fromData({id, uuid, actor : this});
        use.sendToChat();
    }

    /**
     *
     * @param {class} dialogClass Class used for the test dialog
     * @param {class} testClass Class used to compute the test result
     * @param {any} data data relevant to the specific test (such as what characteristic/item to use)
     * @param {object} options Optional properties to customize the test
     * @param {boolean} roll Whether to evaluate the test or not
     * @returns
     */
    async _setupTest(dialogClass, testClass, data, options={}, roll=true)
    {
        let dialogData = dialogClass.setupData(data, this, options);
        let setupData;
        if (options.skipDialog)
        {
            setupData = mergeObject(dialogData.data, dialogData.fields);
        }
        else
        {
            setupData = await dialogClass.awaitSubmit(dialogData);
        }
        let test = testClass.fromData(setupData);
        if (roll)
        {
            await test.roll();
        }
        return test;
    }

    async setupTestFromItem(uuid, options={})
    {
        let item = await fromUuid(uuid);
        if (!item)
        {
            item = this.items.get(uuid); // Maybe uuid is actually simple id
        }
        if (!item)
        {
            return ui.notifications.error("ID " + uuid + " not found");
        }
        let itemTestData = item.getTestData();

        options.context = options.context || {};
        options.context.resist = options.context.resist ? options.context.resist.concat(item.type) : [item.type];

        return this.setupTestFromData(itemTestData, options);
    }

    /**
     * Setup a test from common data structure
     * 
     * @param {object} [data={}] Test data
     * @param {string} [data.characteristic] Characteristic key to test
     * @param {string} [data.skill.key] Skill key to test
     * @param {string} [data.skill.specialisation] Name of skill specialisation to test, if this is provided, skill.key must be provided as well
     * @param {string} [data.difficulty] difficulty key to set the initial difficulty, default is "challenging"
     * @returns 
     */
    async setupTestFromData(data, options)
    {
        let testData = {};
        let testOptions;
        let testFunction;

        // Most specific - provide a specialisation name
        if (data.skill.specialisation)
        {
            testData = {name : data.skill.specialisation, key : data.skill.key};
            testOptions = {fields: {characteristic: data.characteristic, difficulty : data.difficulty}};
            testFunction = this.setupSkillTest.bind(this);
        }
        // If no specialisation, roll a test simply using the general skill
        else if (data.skill.key)
        {
            testData = {key : data.skill.key};
            testOptions = {fields: {characteristic: data.characteristic, difficulty : data.difficulty}};
            testFunction = this.setupSkillTest.bind(this);
        }
        // If no skill key, test with the provided characteristic
        else if (data.characteristic)
        {
            testData = data.characteristic;
            testOptions = {fields: {difficulty : data.difficulty}};
            testFunction = this.setupCharacteristicTest.bind(this);
        }
        else // Not enough information to do a test if no skill or characteristic provided
        {
            return ui.notifications.error("Item does not provide sufficient data to perform a Test. It must specify at least a Skill or Characteristic");
        }
        return testFunction(testData, mergeObject(testOptions, options));
    }


    async applyDamage(value, {ignoreAP=false, location="roll", message=false, opposed, update=true}={})
    {   
        let modifiers = [];
        let traits = opposed?.attackerTest?.itemTraits;
        let locationKey;
        if (typeof location == "string")
        {
            if (location == "roll")
            {
                locationKey  = this.system.combat.randomHitLoc();
            }
            else // if location is some other string, assume it is the location key
            {
                locationKey = location;
            }
        }
        else if (typeof location == "number")
        {
            locationKey  = this.system.combat.hitLocAt(location);
        }
        let locationData = this.system.combat.hitLocations[locationKey];

        let args = {actor : this, value, ignoreAP, modifiers, locationData, opposed, traits};
        await Promise.all(opposed?.attackerTest?.actor.runScripts("preApplyDamage", args) || []);
        await Promise.all(opposed?.attackerTest?.item?.runScripts?.("preApplyDamage", args) || []);
        await Promise.all(this.runScripts("preTakeDamage", args)); 
        // Reassign primitive values that might've changed in the scripts
        value = args.value;
        ignoreAP = args.ignoreAP;

        let woundsGained = value;
        let armourRoll;

        if (locationData.field)
        {
            woundsGained = await locationData.field.system.applyField(value, modifiers);
        }

        if (!ignoreAP && (locationData.armour || locationData.formula))
        {
            let armourValue = locationData.armour || 0;
            if (locationData.formula)
            {
                armourRoll = new Roll(locationData.formula);
                await armourRoll.roll();
                if (game.dice3d)
                {
                    game.dice3d.showForRoll(armourRoll);
                }
                armourValue += armourRoll.total;
            }
            let penetrating = traits?.has("penetrating");
            if (penetrating)
            {
                armourValue = Math.max(0, armourValue - Number(penetrating.value || 0));
                // modifiers.push({value : penetrating.value, label : game.i18n.localize("IMPMAL.Penetrating")});
            }
            modifiers.push({value : -armourValue, label : game.i18n.localize("IMPMAL.Protection"), armour : true});
            if (traits?.has("ineffective"))
            {
                modifiers.push({value : -armourValue, label : game.i18n.localize("IMPMAL.Ineffective"), armour : true});
            }
        }
        
        for (let modifier of modifiers)
        {
            // Skip modifier if it's from armour when ignoreAP is true
            if (!modifier.armour || !ignoreAP)
            {
                woundsGained += Number(modifier.value || 0);
            }
        }
        woundsGained = Math.max(0, woundsGained);


        let excess = 0;
        let critical = false;
        if ((woundsGained + this.system.combat.wounds.value) > this.system.combat.wounds.max)
        {
            excess = (woundsGained + this.system.combat.wounds.value) - this.system.combat.wounds.max;
            woundsGained -= excess;
            critical = true;
        }

        let critModifier = opposed?.attackerTest?.result.critModifier;
        let text = "";
        args = {actor : this, woundsGained, locationData, opposed, critModifier, excess, critical, text};
        await Promise.all(opposed?.attackerTest?.actor.runScripts("applyDamage", args) || []);
        await Promise.all(opposed?.attackerTest?.item?.runScripts?.("applyDamage", args) || []);
        await Promise.all(this.runScripts("takeDamage", args)); 
        woundsGained = args.woundsGained;
        critModifier = args.critModifier;
        excess = args.excess;
        critical = args.critical;
        text = args.text;
        // A script might replace text
        text = text || game.i18n.format("IMPMAL.WoundsTaken", {wounds : woundsGained, location : game.i18n.localize(locationData.label)});
        let critFormula = ``;
        if (excess)
        {
            critFormula += " + " + excess;
        }
        if (critModifier)
        {
            critFormula +=  " + " + critModifier;
        }
        let critString;
        if (critical)
        {
            critString = ` [[/r 1d10 ${critFormula}]]{Critical ${critFormula}}`;
        }

        let updateData = {"system.combat.wounds.value" : this.system.combat.wounds.value + woundsGained};

        let damageData = {
            text, 
            woundsGained, 
            message : message ? ChatMessage.create({content : (text + (critString ? critString : "")), speaker : ChatMessage.getSpeaker({actor : this})}) : null,
            modifiers,
            critical : critString,
            excess,
            location,
            updateData,
            armourRoll
        };

        if (update)
        {
            await this.update(updateData);
        }
        if (traits?.has("rend"))
        {
            damageData.rend = traits.has("rend").value;
            // TODO: this isn't supported if update flag is false
            if (update)
            {
                await this.damageArmour(locationKey, damageData.rend, null, {prompt : true, rend : true});
            }
        }
        return damageData;
    }

    async damageArmour(loc, value, item, {update=true, rend=false, prompt=false}={})
    {
        let updateObj = {};
        let protectionItems = this.system.combat.hitLocations[loc].items.filter(i => i.type == "protection");
        if (!value)
        {
            return;
        }

        if (!item && prompt && protectionItems.length)
        {
            item = (await DocumentChoice.create(protectionItems, 1))[0];
        }
        // If no item provided, find the first protection item that is suitable to being damage or repaired
        item = item || protectionItems.find(i => 
        {
            let damageAtLoc = (i.system.damage?.[loc] || 0);

            if (value > 0) // Positive indicates damage
            {
                return damageAtLoc < i.system.armour; // If damaging the item, it can't be damaged more than the armour value
            }
            else if (value < 0) // Positive indicates repair
            {
                return damageAtLoc > 0; // If repairing the item, the damage can't be less than 0
            }
        });

        if (item)
        {
            let damage = foundry.utils.deepClone(item.system.damage);
            if (!Number.isNumeric(damage[loc]))
            {
                damage[loc] = 0;
            }

            if (rend && value > 0 && item.system.rended[loc] != true)
            {
                updateObj["system.rended." + loc] = true;
            }
            else if (rend && value > 0) // If rended has already been applied here, don't apply it again
            {
                ui.notifications.notify(game.i18n.localize("IMPMAL.RendAlreadyApplied"));
                value = 0;
            }

            damage[loc] += value;
            updateObj["system.damage"] = damage;

            if (update)
            {
                return item.update(updateObj);
            }
            else 
            {
                return updateObj;
            }
        }
        else 
        {
            ui.notifications.notify(game.i18n.localize("IMPMAL.NoItemsToDamage"));
        }
    }


    async useAction(action)
    {
        let actionData = game.impmal.config.actions[action];
        let effectAdded = false; // Flag effect being added so scrolling text doesn't overlap

        if (action == "twf")
        {
            return this.useTWF();
        }

        if (actionData.execute)
        {
            actionData.execute(this);
        }
        else if (actionData.effect)
        {
            effectAdded = await ImpMalEffect.create(actionData.effect, {parent : this});
        }
        else if (actionData.test)
        {
            this.setupTestFromData(actionData.test, {title :{ append : ` – ${actionData.label}`}});
        }
        this.update({"system.combat.action" : action}, {showActionText : !effectAdded});
    }

    async useTWF()
    {
        let weapons = [];
        if (this.type == "character")
        {
            weapons = [this.system.hands.left.document, this.system.hands.right.document];
        }
        else if (this.type == "npc")
        {
            equipped = this.itemCategories.weapon.filter(i => i.system.isEquipped);
            if (equipped.length == 2)
            {
                weapons = equipped;
            }
            else 
            {
                // dialog to select weapons
            }
        }

        await this.setupWeaponTest(weapons[0].id, {context : {twf : true}});
        await this.setupWeaponTest(weapons[1].id, {context : {twf : true}});
    }

    // Handles applying effects to this actor, ensuring that the owner is the one to do so
    // This allows the owner of the document to roll tests and execute scripts, instead of the applying user
    // e.g. the players can actually test to avoid an effect, instead of the GM doing it
    async applyEffect({effectUuids=[], effectData=[], messageId}={})
    {
        let owningUser = game.impmal.utility.getActiveDocumentOwner(this);

        if (typeof effectUuids == "string")
        {
            effectUuids = [effectUuids];
        }

        if (owningUser?.id == game.user.id)
        {
            for (let uuid of effectUuids)
            {
                let effect = fromUuidSync(uuid);
                let message = game.messages.get(messageId);
                await ActiveEffect.create(effect.convertToApplied(), {parent: this, message : message?.id});
            }
            for(let data of effectData)
            {
                await ActiveEffect.create(data, {parent: this, message : messageId});
            }
        }   
        else 
        {
            SocketHandlers.executeOnOwner(this, "applyEffect", {effectUuids, actorUuid : this.uuid, messageId});
        }
    }
    
    /**
     * Collect effect scripts being applied to the actor
     * 
     * @param {String} trigger Specify stript triggers to retrieve
     * @param {Function} scriptFilter Optional function to filter out more scripts
     * @returns 
     */
    getScripts(trigger, scriptFilter)
    {
        let effects = Array.from(this.allApplicableEffects()).filter(i => !i.disabled);
        let scripts = effects.reduce((prev, current) => prev.concat(current.scripts.filter(i => i.trigger == trigger)), []);
        if (scriptFilter)
        {
            scripts = scripts.filter(scriptFilter);
        }
        return scripts;
    }

    /**
     * Some effects applied to an actor are actually intended for items, but to make other things convenient
     * (like duration handling modules, or showing the effect icon on the token), they are given to an actor
     * 
     * These should supply their scripts to an Item as if they were 
     * 
     * @param {*} item 
     */
    getEffectsApplyingToItem(item)
    {
        // Get effects that should be applied to item argument
        return this.effects.contents.filter(e => 
        {
            if (e.disabled)
            {
                return false;
            }

            // An actor effects intended to apply to an item must have the itemTargets flag
            // Empty array => all items
            // No flag => Should not apply to items
            // Array with IDs => Apply only to those IDs
            let targeted = e.getFlag("impmal", "itemTargets");
            if (targeted)
            {
                if (targeted.length)
                {
                    return targeted.includes(item.id);
                }
                // If no items specified, apply to all items
                else 
                {
                    return true;
                }
            }
            else // If no itemTargets flag, it should not apply to items at all
            {
                return false;
            }

            // Create temporary effects that have the item as the parent, so the script context is correct
        }).map(i => new ImpMalEffect(i.toObject(), {parent : item}));

    }

    /**
     * Same logic as getEffectsApplyingToItem, but reduce the effects to their scripts
     * 
     * @param {*} item 
     */
    getScriptsApplyingToItem(item)
    {
        return this.getEffectsApplyingToItem(item).reduce((prev, current) => prev.concat(current.scripts), []);
    }
     

    /**
     * 
     * @param {Boolean} includeItemEffects Include Effects that are intended to be applied to Items, see getSCriptsApplyingToItem, this does NOT mean effects that come from items
     */
    *allApplicableEffects(includeItemEffects=false)
    {

        for ( const effect of this.effects ) 
        {
            if (effect.applicationData.documentType == "Item" && includeItemEffects) // Some effects are intended to modify items, but are placed on the actor for ease of tracking
            {
                yield effect;
            }
            else if (effect.applicationData.documentType == "Actor") // Normal effects (default documentType is actor)
            {
                yield effect;
            }
        }
        for ( const item of this.items ) 
        {
            for ( const effect of item.effects.contents.concat(item.system.getOtherEffects())) 
            {
                // So I was relying on effect.transfer, which is computed in the effect's prepareData
                // However, apparently when you first load the world, that is computed after the actor
                // On subsequent data updates, it's computed before. I don't know if this is intentional
                // Regardless, we need to doublecheck whether this effect should transfer to the actor
                if ( effect.determineTransfer() ) 
                {
                    yield effect;
                }
            }
        }

        // Add specified patron effects to character effects
        if (this.system.patron?.document)
        {
            for(let effect of this.system.patron.document.items.reduce((prev, current) => prev.concat(current.effects.contents), []))
            {
                if (effect.applicationData.type == "document" && effect.applicationData.documentType == "character")
                {
                    yield effect;
                }
            }
        }
    }

    get currentZoneEffects() 
    {
        return this.effects.contents.filter(e => e.getFlag("impmal", "fromZone"));
    }

    get currentZone()
    {
        let token = this.getActiveTokens()[0];
        return canvas.drawings.placeables.filter(d => ZoneHelpers.isInDrawing(token.center, d));
    }

    /**
     * Overriden from foundry to pass true to allApplicableEffects
     */
    get temporaryEffects() 
    {
        const effects = [];
        for ( const effect of this.allApplicableEffects(true) ) 
        {
            if ( effect.active && effect.isTemporary ) {effects.push(effect);}
        }
        return effects;
    }


    get defendingAgainst()
    {
        if (this.type == "vehicle" || this.type == "patron")
        {
            return false;
        }
        else
        {
            return this._findAttackingMessage()?.test;
        }
    }

    sameSideAs(actor)
    {
        if (this.hasPlayerOwner && actor.hasPlayerOwner) // If both are owned by players, probably the same side
        {
            return true;
        }
        else if (this.hasPlayerOwner) // If this actor is owned by a player, and the other is friendly, probably the same side
        {
            return actor.prototypeToken.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY; 
        }
        else if (actor.hasPlayerOwner) // If this actor is friendly, and the other is owned by a player, probably the same side
        {
            return this.prototypeToken.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY;
        }
        else // If neither are owned by a player, only same side if they have the same disposition
        {
            return this.prototypeToken.disposition == actor.prototypeToken.disposition;
        }
    }

    clearOpposed()
    {
        return this.update({"flags.impmal.-=opposed" : null});
    }

    clearAction() 
    {
        return this.update({"system.combat.action" : ""});
    }

    _findAttackingMessage()
    {
        return game.messages.get(this.getFlag("impmal", "opposed"));
    }
}