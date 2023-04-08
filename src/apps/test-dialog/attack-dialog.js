import { SkillTestDialog } from "./skill-dialog";

export class AttackDialog extends SkillTestDialog
{  
    fieldsTemplate = `systems/impmal/templates/apps/test-dialog/attack-fields.hbs`;

    async getTemplateFields() 
    {
        let data = await super.getTemplateFields();
        data.hitLocations = {
            "roll" : "IMPMAL.Roll",
            "head" : "IMPMAL.Head",
            "body" : "IMPMAL.Body",
            "leftArm" : "IMPMAL.LeftArm",
            "rightArm" : "IMPMAL.RightArm",
            "leftLeg" : "IMPMAL.LeftLeg",
            "rightLeg" : "IMPMAL.RightLeg",
        };
        return data;
    }

    computeFields() 
    {
        super.computeFields();

        if (this.fields.hitLocation != "roll")
        {
            this.disCount++;
        }    
    }

    _defaultFields() 
    {
        let fields = super._defaultFields();
        fields.hitLocation = "roll";
        return fields;
    }
}