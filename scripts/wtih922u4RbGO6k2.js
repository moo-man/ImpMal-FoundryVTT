let arm = await Dialog.wait({
            label : "Choose Arm",
            content : "Which Arm?",
            buttons : {
                leftArm : {
                    label : "Left Arm",
                    callback : () => 
                    {
                        return "leftArm";
                    }
                },
                rightArm : {
                    label : "Right Arm",
                    callback : () => 
                    {
                        return "rightArm";
                    }
                }
            }
        });
let mainEffect = this.item.effects.contents[0];

mainEffect.updateSource({"flags.impmal.location":  arm, name : mainEffect.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[arm].label)})`});

this.item.updateSource({name : this.item.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[arm ].label)})`});