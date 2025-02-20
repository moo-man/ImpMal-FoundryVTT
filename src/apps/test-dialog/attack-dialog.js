import { SkillTestDialog } from "./skill-dialog";
import ImpMalUtility from "../../system/utility";

export class AttackDialog extends SkillTestDialog
{  
    subTemplate = `systems/impmal/templates/apps/test-dialog/attack-fields.hbs`;

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

        if (this.fields.rapidFire)
        {
            this.advCount++;
            this.tooltips.add("advantage", 1, "Rapid Fire");
        }

        if (this.fields.burst)
        {
            this.fields.SL++;
            this.tooltips.add("SL", 1, "Burst");
        }

        if (this.data.context.twf)
        {
            this.disCount++;
            this.tooltips.add("disadvantage", 1, "Two Weapon Fighting");
        }

        if (this.data.skill === "ranged" && this.data.targets.length > 0 && game.settings.get("impmal", "gridBasedCombat")) {
            const distances = this.data.targets.map((target) => ImpMalUtility.getDistanceFromUserToTargetToken(target))
            const maxTargetDistance = Math.max(...distances);
            const weaponRange = this.data.item.system.rangeDistance;
            if (maxTargetDistance > weaponRange) {
                this.disCount++;
                this.tooltips.add("disadvantage", 1, "Target further then weapon range");
            }
            if (maxTargetDistance > weaponRange*2) {
                //There is an optional rule Guns at Range that allows to fire beyond double range so this is only a warning not a block
                ui.notifications.warn("Target beyond double weapon range");
            }
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
        return fields;
    }

    _onFieldChange(ev)
    {
        // Can't have both burst and rapidFire active
        let multiplier = game.settings.get("impmal", "countEveryBullet") ? 5 : 1;
        if (ev.currentTarget.name == "burst")
        {
            if (this.data.item.type == "weapon" &&  multiplier > this.data.item.system.mag.current)
            {
                ev.currentTarget.checked = false;
                ui.notifications.warn(game.i18n.localize("IMPMAL.NotEnoughAmmo"));
            }
            else 
            {
                delete this.userEntry.rapidFire;
            }
        }
        else if (ev.currentTarget.name == "rapidFire")
        {
            if (this.data.item.type == "weapon" && (Number(this.traits.has("rapidFire").value) * multiplier) > this.data.item.system.mag.current)
            {
                ev.currentTarget.checked = false;
                ui.notifications.warn(game.i18n.localize("IMPMAL.NotEnoughAmmo"));
            }
            else 
            {
                delete this.userEntry.burst;
            }
        }
        super._onFieldChange(ev);
    }
}