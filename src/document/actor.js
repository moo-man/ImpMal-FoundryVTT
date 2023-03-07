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
import { ImpMalEffect } from "./effect";

export class ImpMalActor extends Actor 
{
    
    async _preCreate(data, options, user) 
    {
        await super._preCreate(data, options, user);
        this.updateSource(this.system.preCreateData(data));
    }

    async _preUpdate(data, options, user) 
    {
        await super._preUpdate(data, options, user);
        this.system.preUpdateChecks(data);
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        this.update(this.system.updateChecks(data));
    }


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

    addCondition(key, {overlay=false, type}={})
    {
        let existing = this.hasCondition(key);
        let effectData;
        if (existing)
        {
            if (existing.isMinor)
            {
                effectData = ImpMalEffect.findEffect(key, "major"); // Escalate to major if existing is minor
            }
            else 
            {
                return; // If already has condition or condition is major already, don't do anything
            }
        }
        else if (!existing)
        {
            effectData = ImpMalEffect.findEffect(key, type); // defaults to minor
        }

        let createData = ImpMalEffect.getCreateData(effectData, overlay);


        // Replace minor with major if existing
        if (existing)
        {
            return existing.update(createData).then(e => e._displayScrollingStatus(true));
        }
        else 
        {
            const cls = getDocumentClass("ActiveEffect");
            return cls.create(createData, {parent: this});
        }
    }

    removeCondition(key)
    {
        let existing = this.hasCondition(key);
        if (existing)
        {
            if (!existing.isMajor)
            {
                return existing.delete();
            }
            else if (existing.isMajor)
            {
                let effectData = ImpMalEffect.findEffect(key, "minor");
                let createData = ImpMalEffect.getCreateData(effectData);
                // Convert major to minor effect
                existing._displayScrollingStatus();
                return existing.update(createData);
            }
        }
    }

    hasCondition(key)
    {
        return this.effects.find(e => e.conditionKey == key);
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

    setupSkillTest({itemId, key}={}, options={}, roll=true) 
    {
        return this._setupTest(SkillTestDialog, SkillTest, {itemId, key}, options, roll);
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
}