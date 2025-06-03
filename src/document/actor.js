import { CharacteristicTestDialog } from "../apps/test-dialog/characteristic-dialog";
import { PowerTestDialog } from "../apps/test-dialog/power-dialog";
import { SkillTestDialog } from "../apps/test-dialog/skill-dialog";
import { TestDialog } from "../apps/test-dialog/test-dialog";
import { TraitTestDialog } from "../apps/test-dialog/trait-dialog";
import { WeaponTestDialog } from "../apps/test-dialog/weapon-dialog";
import ImpMalTables from "../system/tables";
import { BaseTest } from "../system/tests/base/base-test";
import { CharacteristicTest } from "../system/tests/characteristic/characteristic-test";
import { ItemUse } from "../system/tests/item/item-use";
import { PowerTest } from "../system/tests/power/power-test";
import { SkillTest } from "../system/tests/skill/skill-test";
import { TraitTest } from "../system/tests/trait/trait-test";
import { WeaponTest } from "../system/tests/weapon/weapon-test";
import { ImpMalEffect } from "./effect";
import ImpMalDocumentMixin from "./mixin";

export class ImpMalActor extends ImpMalDocumentMixin(WarhammerActor)
{
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
        return this._setupTest(CharacteristicTestDialog, CharacteristicTest, characteristic, options, roll, false);
    }

    setupSkillTest({itemId, name, key}={}, options={}, roll=true)
    {

        // Not sure I like this here but it will do for now
        // Warp State = 2 means you just roll on the Perils table
        // Warp State = 1 is handled in postRoll() of a skill test
        if (options.warp == 2)
        {
            let formula = `1d100 + ${10 * (this.system.warp.charge - this.system.warp.threshold)}`;
            ImpMalTables.rollTable("perils", formula);
            this.update({"system.warp.charge" : 0});
        }
        else 
        {
            return this._setupTest(SkillTestDialog, SkillTest, {itemId, name, key}, options, roll, false);
        }
    }

    setupWeaponTest(id, options={}, roll=true)
    {
        return this._setupTest(WeaponTestDialog, WeaponTest, id, options, roll, false);
    }

    setupGenericTest(target, options={}, roll=true)
    {
        return this._setupTest(TestDialog, BaseTest, target, options, roll, false);
    }

    setupPowerTest(id, options={}, roll=true)
    {
        return this._setupTest(PowerTestDialog, PowerTest, id, options, roll, false);
    }

    setupTraitTest(id, options={}, roll=true)
    {
        return this._setupTest(TraitTestDialog, TraitTest, id, options, roll, false);
    }

    useItem({id, uuid})
    {
        let item = fromUuidSync(uuid) || this.items.get(id);

        let test = item.system.test

        if (test && test.isValid && test.self)
        {
            return this.setupTestFromData(test, {itemUsed : item, appendTitle: ` - ${item.name}`})
        }
        else 
        {
            item.system.use()
        }
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

        options.resist = options.resist ? options.resist.concat(item.type) : [item.type];

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
        return testFunction(testData, foundry.utils.mergeObject(testOptions, options));
    }

    async purge(roll=false)
    {
        if (roll || this.inCombat || (await Dialog.confirm({title : game.i18n.localize("IMPMAL.Purge"), content : game.i18n.localize("IMPMAL.PurgeDialog")})))
        {
            this.setupSkillTest({key: "discipline", name: game.i18n.localize("IMPMAL.Psychic")}, {purge: true,  appendTitle  : ` - ${game.i18n.localize("IMPMAL.Purge")}`});
        }
        else 
        {
            this.update({ "system.warp.charge": 0});
            ImpMalTables.rollTable("phenomena");
        }
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
                modifiers.push({value : penetrating.value, label : game.i18n.localize("IMPMAL.Penetrating"), applied : true});
            }
            modifiers.push({value : -armourValue, label : game.i18n.localize("IMPMAL.Protection"), armour : true});
            if (traits?.has("ineffective"))
            {
                modifiers.push({value : -armourValue, label : game.i18n.localize("IMPMAL.Ineffective"), armour : true});
            }
        }
        
        for (let modifier of modifiers)
        {
            // Skip modifier if it's from armour when ignoreAP is true, or if the modifier has already been applied
            if (!modifier.applied && (!modifier.armour || !ignoreAP))
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
            critical = true;
        }

        let critModifier = opposed?.attackerTest?.result.critModifier;
        let text = "";
        args = {actor : this, woundsGained, locationData, opposed, critModifier, excess, critical, text, modifiers};
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
            critString = ` <a class="table-roll" data-table="crit${game.impmal.config.generalizedHitLocations[locationKey]}" data-formula="1d10 + ${critFormula}"><i class="fa-solid fa-dice-d10"></i>Critical ${critFormula}</a>`;
        }

        let updateData = {"system.combat.wounds.value" : this.system.combat.wounds.value + woundsGained};

        let damageData = {
            damage : value,
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
            item = (await ItemDialog.create(protectionItems, 1, {title : "Rend", text: "Choose Item to apply Rend"}))[0];
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
            this.setupTestFromData(actionData.test, {appendTitle : ` – ${actionData.label}`});
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
            equipped = this.itemTypes.weapon.filter(i => i.system.isEquipped);
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


    /**
     * 
     * @param {Boolean} includeItemEffects Include Effects that are intended to be applied to Items, see getSCriptsApplyingToItem, this does NOT mean effects that come from items
     */
    *allApplicableEffects(includeItemEffects=false)
    {
        for(let effect of Array.from(super.allApplicableEffects(includeItemEffects)))
        {
            yield effect
        }

        // Add specified patron effects to character effects
        if (this.system.patron?.document)
        {
            for(let effect of this.system.patron.document.items.reduce((prev, current) => prev.concat(current.effects.contents), []))
            {
                if (effect.system.transferData.type == "document" && effect.system.transferData.documentType == "character")
                {
                    yield effect;
                }
            }
        }
    }

    get defendingAgainst()
    {
        if (this.type == "vehicle" || this.type == "patron")
        {
            return false;
        }
        else
        {
            return this._findOpposedMessage()?.system.attackerMessage.system.test;
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

    _findOpposedMessage()
    {
        return game.messages.get(this.getFlag("impmal", "opposed"));
    }
}