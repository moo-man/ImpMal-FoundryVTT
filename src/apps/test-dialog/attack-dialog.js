import { SkillTestDialog } from "./skill-dialog";

export class AttackDialog extends SkillTestDialog
{  
    get tooltipConfig() 
    {
        return foundry.utils.mergeObject(super.tooltipConfig, {
            damage : {
                label : "IMPMAL.Damage",
                type : 1,
                path : "fields.damage",
            }
        })
    }


    constructor(...args)
    {
        super(...args)
        this.data.showTraits = this.showTraits;
        this.data.fireMode = this.fireMode;
        this.data.hitLocations = {
            "roll" : "IMPMAL.Roll",
            "head" : "IMPMAL.Head",
            "body" : "IMPMAL.Body",
            "leftArm" : "IMPMAL.LeftArm",
            "rightArm" : "IMPMAL.RightArm",
            "leftLeg" : "IMPMAL.LeftLeg",
            "rightLeg" : "IMPMAL.RightLeg",
        };

    }

    get isAttack()
    {
        return !this.actor.defendingAgainst;
    }

    computeFields() 
    {
        if (this.fields.hitLocation != "roll")
        {
            this.disCount++;
            this.tooltips.add("disadvantage", 1, "Targeting Location");
        }

        switch (this.fields.fireMode) {
            case "burst":
                this.fields.SL++;
                this.tooltips.add("SL", 1, "Burst");
                break;
            case "rapidFireAdv":
                this.advCount++;               
                this.tooltips.add("advantage", 1, "Rapid Fire (Advantage + Damage)");
                this.fields.damage += Number(this.traits.has("rapidFire").value);
                this.tooltips.add("damage", Number(this.traits.has("rapidFire").value), "Rapid Fire (Advantage + Damage)");
                break;
            case "rapidFireSpread":
                break;
        }

        if (this.context.twf)
        {
            this.disCount++;
            this.tooltips.add("disadvantage", 1, "Two Weapon Fighting");
        }
        super.computeFields();
    }

    get showTraits() 
    {
        return {
            burst : this.traits.has("burst") || this.traits.has("rapidFire"),
            rapidFire : this.traits.has("rapidFire"),
            supercharge : this.traits.has("supercharge")
        };
    }

    get traits() 
    {
        return this.data.item.system.traits || this.data.item.system.attack.traits;
    }

    _defaultFields() 
    {
        let fields = super._defaultFields();
        fields.hitLocation = "roll";
        fields.damage = 0;
        fields.fireMode = "normal";
        return fields;
    }

    _onFieldChange(ev)
    {
        let multiplier = game.settings.get("impmal", "countEveryBullet") ? 5 : 1;
        if (ev.currentTarget.name == "fireMode") {
            switch (ev.currentTarget.value) {
                case "burst":
                    if (this.data.item.type == "weapon" && multiplier > this.data.item.system.mag.current) {
                        ev.currentTarget.value = "normal";
                        ui.notifications.warn(game.i18n.localize("IMPMAL.NotEnoughAmmo"));
                    }
                    break;
                case "rapidFireSpread":
                case "rapidFireAdv":
                    if (this.data.item.type == "weapon" && (Number(this.traits.has("rapidFire").value) * multiplier) > this.data.item.system.mag.current) {
                        ev.currentTarget.value = "normal";
                        ui.notifications.warn(game.i18n.localize("IMPMAL.NotEnoughAmmo"));
                    }
                    break;
            }
        }
        super._onFieldChange(ev);
    }
}