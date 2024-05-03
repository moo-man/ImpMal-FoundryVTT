let leg = await Dialog.wait({
        label : "Choose Leg",
        content : "Which Leg?",
        buttons : {
            leftLeg : {
                label : "Left Leg",
                callback : () => 
                {
                    return "leftLeg";
                }
            },
            rightLeg : {
                label : "Right Leg",
                callback : () => 
                {
                    return "rightLeg";
                }
            }
        }
    });
    let mainEffect = this.item.effects.contents[0];
    
    mainEffect.updateSource({"flags.impmal.location":  leg, name : mainEffect.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[leg].label)})`})
    
    this.item.updateSource({name : this.item.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[leg].label)})`});