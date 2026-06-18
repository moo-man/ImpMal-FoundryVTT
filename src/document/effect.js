import { TestDataModel } from "../model/item/components/test";

export class ImpMalEffect extends WarhammerActiveEffect
{

    static CONFIGURATION = {
        zone : true,
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

    get conditionValue()
    {
        return this.system.type || this.flags?.impmal?.type;
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

    
    get sourceTest() 
    {
        let testData = this.system.sourceData.test;
        let message = game.messages.get(testData.context?.messageId);
        if (testData)
        {
            return message ? message.system.test : new (game.impmal.testClasses[testData.class])(testData);
        }
    }

    get changeKeys()
    {
        return {choices: Object.keys(game.impmal.config.characteristics).map(i => {
            return {
                value: `system.characteristics.${i}.modifier`,
                label: game.impmal.config.characteristics[i],
                group: game.i18n.localize("IMPMAL.Characteristics")
            }
        }).concat(Object.keys(game.impmal.config.skills).map(i => {
            return {
                value: `system.skills.${i}.modifier`,
                label: game.impmal.config.skills[i],
                group: game.i18n.localize("IMPMAL.Skills")
            }
        }))
        .concat([{value: "system.influence.factions.*.modifier", label: game.i18n.localize("IMPMAL.ChooseFaction"), group: game.i18n.localize("IMPMAL.Influence")}])
        .concat(Object.keys(game.impmal.config.factions).map(faction => {
            return {
                value: `system.influence.factions.${faction}.modifier`, 
                label: game.impmal.config.factions[faction], 
                group: game.i18n.localize("IMPMAL.Influence")
            }
        }))
        .concat([
            {value: "system.combat.wounds.max", label: game.i18n.localize("IMPMAL.MaxWounds"), group: "Other"},
            {value: "system.combat.criticals.max", label: game.i18n.localize("IMPMAL.MaxCriticalWounds"), group: "Other"},
            {value: "system.combat.initiative", label: game.i18n.localize("IMPMAL.Initiative"), group: "Other"},
            {value: "system.warp.threshold", label: game.i18n.localize("IMPMAL.WarpChargeThreshold"), group: "Other"},
            {value: "system.encumbrance.overburdened", label: game.i18n.localize("IMPMAL.OverburdenedThreshold"), group: "Other"},
            {value: "system.encumbrance.restrained", label: game.i18n.localize("IMPMAL.RestrainedThreshold"), group: "Other"},
            {value: "system.augmetics.max", label: game.i18n.localize("IMPMAL.MaxAugmetics"), group: "Other"},
            {value: "system.combat.speed.land.modifier", label: game.i18n.localize("IMPMAL.SpeedModifierLand"), group: "Other"},
            {value: "system.combat.speed.fly.modifier", label: game.i18n.localize("IMPMAL.SpeedModifierFly"), group: "Other"},
            {value: "system.combat.armourModifier", label: game.i18n.localize("IMPMAL.ArmourAll"), group: "Other"},
            {value: "system.combat.hitLocations.head.armour", label: game.i18n.localize("IMPMAL.ArmourHead"), group: "Other"},
            {value: "system.combat.hitLocations.body.armour", label: game.i18n.localize("IMPMAL.ArmourBody"), group: "Other"},
            {value: "system.combat.hitLocations.leftArm.armour", label: game.i18n.localize("IMPMAL.ArmourLeftArm"), group: "Other"},
            {value: "system.combat.hitLocations.rightArm.armour", label: game.i18n.localize("IMPMAL.ArmourRightArm"), group: "Other"},
            {value: "system.combat.hitLocations.leftLeg.armour", label: game.i18n.localize("IMPMAL.ArmourLeftLeg"), group: "Other"},
            {value: "system.combat.hitLocations.rightLeg.armour", label: game.i18n.localize("IMPMAL.ArmourRightLeg"), group: "Other"}
        ]).concat([
            {value: "system.payment.gradeModifier", label: game.i18n.localize("IMPMAL.PayGradeModifier"), group: "Patron"},
            {value: "system.rangeModifier.value", label: game.i18n.localize("IMPMAL.RangeModifier"), group: "Item"},
            {value: "system.rangeModifier.override", label: game.i18n.localize("IMPMAL.RangeOverride"), group: "Item"}
        ])
        , 
        groups: ['IMPMAL.Characteristics',
        'IMPMAL.Skills',
        "IMPMAL.Influence",
        'Other',
        'Patron',
        'Item',
        ].map(i => game.i18n.localize(i))};
    }
}
