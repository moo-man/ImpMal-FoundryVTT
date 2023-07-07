import { CharacteristicTestDialog } from "../apps/test-dialog/characteristic-dialog";
import { PowerTestDialog } from "../apps/test-dialog/power-dialog";
import { SkillTestDialog } from "../apps/test-dialog/skill-dialog";
import { TestDialog } from "../apps/test-dialog/test-dialog";
import { TraitTestDialog } from "../apps/test-dialog/trait-dialog";
import { WeaponTestDialog } from "../apps/test-dialog/weapon-dialog";
import { BaseTest } from "../system/tests/base/base-test";
import { CharacteristicTest } from "../system/tests/characteristic/characteristic-test";
import { PowerTest } from "../system/tests/power/power-test";
import { SkillTest } from "../system/tests/skill/skill-test";
import { TraitTest } from "../system/tests/trait/trait-test";
import { WeaponTest } from "../system/tests/weapon/weapon-test";
import ImpMalDocumentMixin from "./mixin";

export class ImpMalActor extends ImpMalDocumentMixin(Actor)
{
    prepareBaseData()
    {
        this.system.computeBase();
        this.itemCategories = this.itemTypes;
    }

    prepareDerivedData() 
    {
        this.system.computeDerived(mergeObject(this.itemCategories, {all : this.items}, {inplace : false}));
        this.items.forEach(i => i.prepareOwnedData());
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
        if (options.warp == 2)
        {
            return new Roll(`1d100 + ${10 * (this.system.warp.charge - this.system.warp.threshold)}`).roll({async: true}).then(roll => 
            {
                roll.toMessage({speaker : ChatMessage.getSpeaker(this), flavor : game.i18n.localize("IMPMAL.PerilsOfTheWarp")});
                this.update({"system.warp.charge" : 0});
            });
        }
        return this._setupTest(SkillTestDialog, SkillTest, {itemId, name, key}, options, roll);
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

    async setupTestFromItem(uuid)
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
        let test; // Item data for the test
        if (item.type == "trait")
        {
            test = item.system.test;
        }
        else if (item.type == "power")
        {
            test = item.system.opposed;
        }

        let testData = {};
        let testOptions = {};
        let testFunction;
        if (test.skill.specialisation)
        {
            testData = {name : test.skill.specialisation, key : test.skill.key};
            testOptions = {fields: {characteristic: test.characteristic, difficulty : test.difficulty}};
            testFunction = this.setupSkillTest.bind(this);
        }
        else if (test.skill.key)
        {
            testData = {key : test.skill.key};
            testOptions = {fields: {characteristic: test.characteristic, difficulty : test.difficulty}};
            testFunction = this.setupSkillTest.bind(this);
        }
        else if (test.characteristic)
        {
            testData = test.characteristic;
            testOptions = {fields: {difficulty : test.difficulty}};
            testFunction = this.setupCharacteristicTest.bind(this);
        }
        else 
        {
            return ui.notifications.error("Item does not provide sufficient data to perform a Test. It must specify at least a Skill or Characteristic");
        }

        return testFunction(testData, testOptions);
    }

    async applyDamage(value, {ignoreAP=false, location="roll", message=false, test}={})
    {
        let reductions = [];
        let traits = test?.itemTraits;
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

        let woundsGained = value;
        if (locationData.field)
        {
            woundsGained = await locationData.field.system.applyField(value, reductions);
        }

        if (!ignoreAP && locationData.armour)
        {
            let armourValue = locationData.armour;
            let penetrating = traits?.has("penetrating");
            if (penetrating)
            {
                armourValue = Math.max(0, locationData.armour - Number(penetrating.value || 0));
                // reductions.push({value : penetrating.value, label : game.i18n.localize("IMPMAL.Penetrating")});
            }
            woundsGained -= armourValue;
            reductions.push({value : armourValue, label : game.i18n.localize("IMPMAL.Protection")});
            if (traits?.has("ineffective"))
            {
                woundsGained -= armourValue;
                reductions.push({value : armourValue, label : game.i18n.localize("IMPMAL.Ineffective")});

            }
        }

        woundsGained = Math.max(0, woundsGained);

        let text = game.i18n.format("IMPMAL.WoundsTaken", {wounds : woundsGained, location : game.i18n.localize(locationData.label)});

        let crit;
        let excess = 0;
        if ((woundsGained + this.system.combat.wounds.value) > this.system.combat.wounds.max)
        {
            excess = (woundsGained + this.system.combat.wounds.value) - this.system.combat.wounds.max;
            crit = ` [[/r 1d10 + ${excess}]]{Critical (+${excess})}`;
        }

        this.update({"system.combat.wounds.value" : this.system.combat.wounds.value + woundsGained});
        return {
            text,
            message : message ? ChatMessage.create({content : text + crit ? crit : ""}) : null,
            reductions,
            crit,
            excess,
            location : locationKey
        };
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

    clearOpposed()
    {
        return this.update({"flags.impmal.-=opposed" : null});
    }

    _findAttackingMessage()
    {
        return game.messages.get(this.getFlag("impmal", "opposed"));
    }
}