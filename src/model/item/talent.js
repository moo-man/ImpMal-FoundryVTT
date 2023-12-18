import DocumentChoice from "../../apps/document-choice";
import ImpMalScript from "../../system/script";
import { DocumentListModel } from "../shared/list";
import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;


/**
 * Talent effects are special in that they can be gated behind how many times the talent has been taken
 * This causes some complexity in regards to whether it should be transferred or used 
 * 
 * effectOptions - shows all the available effect options that can be chosen as the talent is taken multiple times.
 * Notably, if an effect is NOT included in the options, it's assumed that the effect is gained inherently with the talent upon first getting it
 * 
 * effectTakenRequirement - for all the effects in effectOptions, how many times does the talent need to be taken before it can be chosen. 
 * if you have some effects A, B, C, and D, set to 2, 2, 3, 3: when you take the talent a second time, A and B are available to be selected. 
 * When you take it a third time, A, B, C and D are all available (minus the one selected previously)
 * 
 * {
 *   idA : 2,
 *   idB : 2,
 *   idC : 3,
 *   idD : 3
 * }
 * 
 * effectChoices - Which talents have been chosen and at what level they were chosen 
 * 
 * {
 *   idA : 2,
 *   idC : 3
 *  } // B and D have not been chosen yet
 * 
 */

export class TalentModel extends StandardItemModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.requirement = new fields.SchemaField({
            value : new fields.StringField(),
            script : new fields.StringField()
        });
        schema.taken = new fields.NumberField({initial : 1});
        schema.xpCost = new fields.NumberField({initial : 100, min: 0});
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.effectOptions = new fields.EmbeddedDataField(DocumentListModel);
        schema.effectTakenRequirement = new fields.ObjectField({}); // How many times must the talent be taken before each effect option can be selected, usually 2
        schema.effectRepeatable = new fields.ObjectField({}); // How many times must the talent be taken before each effect option can be selected, usually 2
        schema.effectChoices = new fields.ObjectField({}); // Choices selected
        return schema;
    }

    async createChecks(data, options, user) 
    {
        await super.createChecks(data, options, user);
        this.handleEffectSelection();
    }

    computeDerived()
    {
        super.computeDerived();
        this.effectOptions.findDocuments(this.parent.effects);
        this.xp = this.xpCost * this.taken;
    }

    summaryData()
    {
        let data = super.summaryData();
        data.details.item.requirement = `<strong>${game.i18n.localize("IMPMAL.Requirement")}</strong>: ${this.requirement.value}`;
        return data;
    }

    allowCreation()
    {
        let allowed = super.allowCreation(this.parent);
        
        if (allowed && this.parent.actor && this.requirement.script)
        {
            let script = new ImpMalScript({string : this.requirement.script, label : "Talent Requirement"}, ImpMalScript.createContext(this.parent));
            allowed = script.execute() ? true : false; // Make sure it's boolified
            if (!allowed)
            {
                ui.notifications.error("Talent Requirement not met");
            }
        }
        let existing = this.parent.actor?.itemCategories.talent.find(i => i.name == this.parent.name);
        if (existing)
        {
            existing.update({"system.taken" : existing.system.taken + 1}).then(item => 
            {
                item.system.handleEffectSelection();
            });
            allowed = false;
        }
        return allowed;
    }

    // updateChecks(data, options)
    // {
    //     super.updateChecks();
    //     if (data.system.taken)
    //     {
    //         this.handleEffectSelection();
    //     }
    //     return {};
    // }


    // Applicable - Basically just checks whether an effect has been chosen and isn't disabled
    effectIsApplicable(effect)
    {
        return super.effectIsApplicable(effect) && this.effectIncluded(effect);
    }

    // Transfer - Should check whether an effect has been chosen, but doesn't care about enabled or disabled
    // as a disabled effect should still be transfered to the parent actor so that it's visible
    shouldTransferEffect(effect)
    {
        return super.shouldTransferEffect(effect) && this.effectIncluded(effect);
    }


    // Check whether an effect has either been chosen or was included without a choice
    // Returns false for effects that have not been included in effectChoices
    effectIncluded(effect)
    {
        return !this.effectOptions.list.find(i => i.id == effect.id) || this.effectChoices[effect.id];
    }

    async handleEffectSelection()
    {
        // Only relevant to owned items
        if (!this.parent?.actor)
        {
            return;
        }

        let effectOptions = this.effectOptions
            .findDocuments(this.parent.effects) // Retrieve talent effects
            .filter(i =>i) 
            .filter(i => this.effectTakenRequirement[i.id] <= this.taken) // Choices should only be those available to select (should not show if talent has been taken twice but needs 3)
            .filter(i => !this.effectChoices[i.id] || this.effectRepeatable[i.id]); // Filter out choices that have already been selected and can't be selected more than once

        if (effectOptions.length > 0)
        {
            let choice = await DocumentChoice.create(effectOptions, 1);
            if (choice.length)
            {
                return this.parent.update({["system.effectChoices." + choice[0].id] : this.taken}).then(() => 
                {
                    // Simulate the selected effect being created
                    choice[0].handleImmediateScripts();
                });
            }
        }
    }
}