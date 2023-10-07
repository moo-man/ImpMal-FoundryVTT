import DocumentChoice from "../../apps/document-choice";
import ImpMalScript from "../../system/script";
import { DocumentListModel } from "../shared/list";
import { TestDataModel } from "./components/test";
import { StandardItemModel } from "./standard";
let fields = foundry.data.fields;

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
        schema.xp = new fields.NumberField({initial : 100, min: 0});
        schema.test = new fields.EmbeddedDataField(TestDataModel);
        schema.effectOptions = new fields.EmbeddedDataField(DocumentListModel);
        schema.effectTakenRequirement = new fields.ObjectField({}); // How many times must the talent be taken before each effect option can be selected, usually 2
        schema.effectChoices = new fields.ObjectField({}); // Choices selected
        return schema;
    }

    computeDerived()
    {
        super.computeDerived();
        this.effectOptions.findDocuments(this.parent.effects);
        this.xp = 100 * this.taken;
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

    allowEffect(effect)
    {
        return !this.effectOptions.list.find(i => i.id == effect.id) || this.effectChoices[effect.id];
    }

    async handleEffectSelection()
    {
        let effectOptions = this.effectOptions
            .findDocuments(this.parent.effects) // Retrieve talent effects
            .filter(i =>i) 
            .filter(i => this.effectTakenRequirement[i.id] <= this.taken) // Choices should only be those available to select (should not show if talent has been taken twice but needs 3)
            .filter(i => !this.effectChoices[i.id]);                      // Filter out choices that have already been selected

        if (effectOptions.length > 0)
        {

            let choice = await DocumentChoice.create(effectOptions, 1);
            if (choice.length)
            {
                this.parent.update({["system.effectChoices." + choice[0].id] : this.taken});
            }
        }
    }
}