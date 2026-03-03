import { EquipSlots } from "./components/equip-slots";
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
    static LOCALIZATION_PREFIXES = ["WH.Models.talent"];
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.requirement = new fields.SchemaField({
            value : new fields.StringField(),
            script : new fields.JavaScriptField()
        });
        schema.taken = new fields.NumberField({initial : 1});
        schema.xpCost = new fields.NumberField({initial : 100, min: 0});
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.effectOptions = new fields.EmbeddedDataField(DocumentReferenceListModel);
        schema.effectTakenRequirement = new fields.ObjectField({}); // How many times must the talent be taken before each effect option can be selected, usually 2
        schema.effectRepeatable = new fields.ObjectField({}); // How many times must the talent be taken before each effect option can be selected, usually 2
        schema.effectChoices = new fields.ObjectField({}); // Choices selected
        schema.slots = new fields.EmbeddedDataField(EquipSlots);

        return schema;
    }

    async _preUpdate(data, options, user)
    {
        if (foundry.utils.hasProperty(options.changed, "system.slots.value"))
        {
            data.system.slots.list = this.slots.updateSlotsValue(foundry.utils.getProperty(options.changed, "system.slots.value"))
        }
    }

    async _onCreate(data, options, user) 
    {
        await super._onCreate(data, options, user);
        this.handleEffectSelection();
    }

    computeDerived()
    {
        super.computeDerived();
        this.xp = this.xpCost * this.taken;
    }

    async summaryData()
    {
        let data = await super.summaryData();
        data.details.item.requirement = `<strong>${game.i18n.localize("IMPMAL.Requirement")}</strong>: ${this.requirement.value}`;
        return data;
    }

    async allowCreation(data, options, user)
    {
        let allowed = await super.allowCreation(data, options, user);
        
        if (allowed && this.parent.actor?.type == "character" && this.requirement.script && !options.skipRequirement)
        {
            let script = new WarhammerScript({script : this.requirement.script, label : "Talent Requirement"}, WarhammerScript.createContext(this.parent));
            allowed = script.execute() ? true : false; // Make sure it's boolified
            if (!allowed)
            {
                allowed = await Dialog.confirm({title : game.i18n.localize("IMPMAL.IgnorePrerequisite"), content : game.i18n.localize("IMPMAL.IgnorePrerequisiteContent")});
            }
        }
        let existing = this.parent.actor?.itemTypes.talent.find(i => i.name == this.parent.name);
        if (existing)
        {
            existing.update({"system.taken" : existing.system.taken + 1}).then(async item => 
            {
                // Rerun immediate scripts for any effect that isn't a choice
                for(let e of item.effects.contents)
                {
                    if (!item.system.effectChoices[e.id])
                    {
                        await e.handleImmediateScripts();
                    }
                }
                await item.system.handleEffectSelection();
            });
            allowed = false;
        }
        return allowed;
    }

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

    // All the effects that come with purchasing the talent multiple times
    get advancedEffects()
    {
        return Array.from(this.parent.allApplicableEffects()).filter(i => this.effectChoices[i.id])
    }

    _addModelProperties()
    {
        this.effectOptions.relative = this.parent.effects;
        if (this.parent.actor)
        {
            this.slots.relative = this.parent.actor.items;
            this.slots.list.forEach(i => i.relative = this.slots.relative);
        }
    }

    async handleEffectSelection()
    {
        // Only relevant to owned items
        if (!this.parent?.actor)
        {
            return;
        }

        let effectOptions = this.effectOptions
            .documents
            .filter(i =>i) 
            .filter(i => this.effectTakenRequirement[i.id] <= this.taken) // Choices should only be those available to select (should not show if talent has been taken twice but needs 3)
            .filter(i => !this.effectChoices[i.id] || this.effectRepeatable[i.id]); // Filter out choices that have already been selected and can't be selected more than once

        if (effectOptions.length > 0)
        {
            let choice = await ItemDialog.create(effectOptions, 1, {title : "Talent Effect", text: "Choose Talent Option"});
            if (choice.length)
            {
                // If repeatable effect chosen again, recreate that effect
                if (this.effectRepeatable[choice[0]?.id] && this.parent.system.effectChoices[choice[0]?.id] >= 1) // for some reason this.effectChoices is different than this.parent.system.effectChoices???
                {
                    let newEffect = await this.parent.createEmbeddedDocuments("ActiveEffect", [choice[0].toObject()]);
                    await this.parent.update({["system.effectChoices." + newEffect[0].id] : this.taken})
                }
                else // If non-repeatable or first time choosing repeatable effect, just run immediate scripts
                {
                    await this.parent.update({["system.effectChoices." + choice[0].id] : this.taken})
                    choice[0].handleImmediateScripts();
                }
            }
        }
    }

    async toEmbed(config, options)
    {

        let html = `
            <h4>@UUID[${this.parent.uuid}]{${config.label || this.parent.name}}</h4>
            ${this.notes.player}
            ${game.user.isGM ? this.notes.gm : ""}
        `;


        let div = document.createElement("div");
        div.style = config.style;
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this.parent, async: true, secrets : options.secrets});
        return div;
    }
}