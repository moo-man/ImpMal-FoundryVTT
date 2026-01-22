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
    setupCharacteristicTest(characteristic, context={}, options, roll=true)
    {
        if (!this.checkVehicle("setupCharacteristicTest", [...arguments]))
        {
            return;
        }
        return this._setupTest(CharacteristicTestDialog, CharacteristicTest, characteristic, context, options, roll, false);
    }

    setupSkillTest({itemId, name, key}={}, context={}, options, roll=true)
    {
        if (!this.checkVehicle("setupSkillTest", [...arguments]))
        {
            return;
        }

        // Not sure I like this here but it will do for now
        // Warp State = 2 means you just roll on the Perils table
        // Warp State = 1 is handled in postRoll() of a skill test
        if (context.warp == 2)
        {
            let formula = `1d100 + ${10 * (this.system.warp.charge - this.system.warp.threshold)}`;
            ImpMalTables.rollTable("perils", formula);
            this.update({"system.warp.charge" : 0});
        }
        else 
        {
            return this._setupTest(SkillTestDialog, SkillTest, {itemId, name, key}, context, options, roll, false);
        }
    }

    setupWeaponTest(id, context={}, options, roll=true)
    {
        if (!this.checkVehicle("setupWeaponTest", [...arguments]))
        {
            return;
        }
        return this._setupTest(WeaponTestDialog, WeaponTest, id, context, options, roll, false);
    }

    setupGenericTest(target, context={}, options, roll=true)
    {
        if (!this.checkVehicle("setupGenericTest", [...arguments]))
        {
            return;
        }
        return this._setupTest(TestDialog, BaseTest, target, context, options, roll, false);
    }

    setupPowerTest(id, context={}, options, roll=true)
    {
        if (!this.checkVehicle("setupPowerTest", [...arguments]))
        {
            return;
        }
        return this._setupTest(PowerTestDialog, PowerTest, id, context, options, roll, false);
    }

    setupTraitTest(id, context={}, options, roll=true)
    {
        if (!this.checkVehicle("setupTraitTest", [...arguments]))
        {
            return;
        }
        return this._setupTest(TraitTestDialog, TraitTest, id, context, options, roll, false);
    }

    checkVehicle(setupFn, args)
    {
        if (this.type == "vehicle" && this.system.actors.documents.length)
        {
            this.system.choose().then(actor => {
                actor[setupFn](args[0], args[1], args[2], args[3]);
            })
            return false;
        }
        else if (this.type == "vehicle")
        {
            throw new Error("Vehicles cannot perform Tests.")
        }
        return true;
    }

    async useItem({id, uuid})
    {
        let item = fromUuidSync(uuid) || this.items.get(id);

        let test = item.system.test

        if (item.system.uses && item.system.uses.value != null  && !(await item.spend("system.uses.value")))
        {
            return ui.notifications.error("No uses left!")
        }

        // If uses reaches 0, decrease quantity and reset uses to max
        if (item.system.uses?.value == 0 && item.system.uses?.max && item.system.quantity > 1)
        {
            await item.update({"system" : {
                "quantity" : item.system.quantity - 1,
                "uses.value" : item.system.uses.max
            }})
        }

        if (test && test.isValid && test.self)
        {
            return this.setupTestFromData(test, {itemUsed : item, appendTitle: ` - ${item.name}`})
        }
        else 
        {
            item.system.use()
        }

    }

    async setupTestFromItem(item, context={}, options)
    {
        if (typeof item == "string")
        {

            if (item.includes("."))
            {
                item = await fromUuid(item);
            }
            else
            {
                item = this.items.get(item); // Maybe uuid is actually simple id
            }
        }
        if (!item)
        {
            return ui.notifications.error("No Item found!");
        }
        let itemTestData = item.getTestData();

        context.resist = context.resist ? context.resist.concat(item.type) : [item.type];

        context.appendTitle = ` - ${item.name}`;

        return this.setupTestFromData(itemTestData, context, options);
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
    async setupTestFromData(data, context, options)
    {
        let testData = {};
        let testContext;
        let testFunction;

        // Most specific - provide a specialisation name
        if (data.skill.specialisation)
        {
            testData = {name : data.skill.specialisation, key : data.skill.key};
            testContext = {fields: {characteristic: data.characteristic, difficulty : data.difficulty}};
            testFunction = this.setupSkillTest.bind(this);
        }
        // If no specialisation, roll a test simply using the general skill
        else if (data.skill.key)
        {
            testData = {key : data.skill.key};
            testContext = {fields: {characteristic: data.characteristic, difficulty : data.difficulty}};
            testFunction = this.setupSkillTest.bind(this);
        }
        // If no skill key, test with the provided characteristic
        else if (data.characteristic)
        {
            testData = data.characteristic;
            testContext = {fields: {difficulty : data.difficulty}};
            testFunction = this.setupCharacteristicTest.bind(this);
        }
        else // Not enough information to do a test if no skill or characteristic provided
        {
            return ui.notifications.error("Item does not provide sufficient data to perform a Test. It must specify at least a Skill or Characteristic");
        }
        return testFunction(testData, foundry.utils.mergeObject(testContext, context), options);
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

    /**
     * 
     * @param {Number} value Amount of damage
     * @param {Object} options contextual data
     * @param {Object} options.ignoreAP whether to ignore armour
     * @param {Object} options.location what location key to damage (or "roll")
     * @param {Object} options.message whether to create a chat message report for the damage taken
     * @param {Object} options.opposed opposed data object if damage is coming from an opposed test
     * @param {Object} options.update whether to update the actor (otherwise updateData is included in return)
     * @returns 
     */
    async applyDamage(value, options)
    {   
      return this.system.applyDamage(value, options)
    }

    async damageArmour(loc, value, item, {update=true, rend=false, prompt=false, attackerTest=null}={})
    {
        let updateObj = {};
        let protectionItems = this.system.combat.hitLocations[loc].items.filter(i => i.type == "protection" && (!i.system.destroyed[loc] || value < 0));
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
            if (!Number.isNumeric(damage[loc])) {
                damage[loc] = 0;
            }

            //We assume that prompt==true means it wasn't a user's click
            if (prompt) {
                let currentLocDam = damage[loc]
                let args = { actor: item.parent, item, loc, value, rend, currentLocDam, attackerTest };
                await Promise.all(item.parent.runScripts("preItemDamaged", args) || []);
                value = Number(args.value);
            }
            
            damage[loc] += Number(value);
            if (damage[loc] > item.system.armour) {
                damage[loc] = item.system.armour;
            }

            if (damage[loc] < 0) damage[loc] = 0;

            if (damage[loc] == item.system.armour) {
                updateObj["system.destroyed." + loc] = true;
            } else {
                updateObj["system.destroyed." + loc] = false;
            }
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
        return this.system.useAction(action);
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

        await this.setupWeaponTest(weapons[0].id, {twf : true});
        await this.setupWeaponTest(weapons[1].id, {twf : true});
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