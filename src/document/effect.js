import { TestDataModel } from "../model/item/components/test";

export class ImpMalEffect extends WarhammerActiveEffect
{

    static CONFIGURATION = {
        zones : true,
        exclude : {},
        bracket : ["(", ")"]
    };

    async resistEffect()
    {
        let result = await super.resistEffect();
        if (result === false || result === true)
        {
            return result;
        }

        let transferData = this.system.transferData;

        let test;
        let options = {appendTitle : " - " + this.name, resist : [this.key].concat(this.sourceTest?.item?.type || []), resistingTest : this.sourceTest};
        if (transferData.avoidTest.value == "item")
        {
            test = await this.actor.setupTestFromItem(this.item.uuid, options);
        }
        else if (transferData.avoidTest.value == "custom")
        {
            test = await this.actor.setupTestFromData(transferData.avoidTest, options);
        }

        if (!transferData.avoidTest.reversed)
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (transferData.avoidTest.opposed && this.sourceTest)
            {
                return test.result.SL > this.sourceTest.result?.SL;
            }
            else 
            {
                return test.succeeded;
            }
        }
        else  // Reversed - Failure removes the effect
        {
            // If the avoid test is marked as opposed, it has to win, not just succeed
            if (transferData.avoidTest.opposed && this.sourceTest)
            {
                return test.result.SL < this.sourceTest.result?.SL;
            }
            else 
            {
                return !test.succeeded;
            }
        }
    }

    async createAndEquipSlot(item)
    {
        if (this.item && this.item.system.slots && this.actor)
        {
            if (typeof item == "string")
            {
                item = await fromUuid(item);
            }

            let createdItem = (await this.actor.createEmbeddedDocuments("Item", [item], {fromEffect: this.id}))[0]
            let slots = this.item.system?.toObject().slots.list
            let slot = {}
            slot.id = createdItem.id;
            slot.name = createdItem.name;

            let emptySlotIndex = slots.findIndex(i => !i.id);
            if (emptySlotIndex == -1)
            {
                slots.push(slot);
            }
            else 
            {
                slots[emptySlotIndex] = slot;
            }
            return {"system.slots" : {list : slots, value : slots.length}};
        }
    }

        
    get testDisplay() {

        if (this.system.transferData.avoidTest.value == "custom")
        {
            return TestDataModel.createLabelFromData(this.system.transferData.avoidTest);
        }
        else if (this.system.transferData.avoidTest.value == "item")
        {
            return TestDataModel.createLabelFromData(this.item.getTestData());
        }
    }

    // Need to override base getter because IM doesn't have a `data` property holding all the test data
    get sourceTest() 
    {
        return this.system.sourceData.test;
    }

    get isCondition() 
    {
        return !!game.impmal.config.conditions.find(i =>i.id == this.key);
    }

    get isMinor()
    {
        return this.system.type == "minor"; 
    }

    get isMajor()
    {
        return this.system.type == "major"; 
    }

    // Computed effects mean flagged to know that they came from a calculation, notably encumbrance causing overburdened or restrained
    get isComputed()
    {
        return this.system.computed;
    }

    static findEffect(key, type="minor")
    {
        let effects = foundry.utils.deepClone(game.impmal.config.conditions).concat(foundry.utils.deepClone(Object.values(game.impmal.config.zoneEffects)));

        let effect = effects.find(i => i.id == key && i.system?.type == type);
        if (!effect)
        {
            effect = effects.find(i => i.id == key);
        }
        return effect;
    }
}
