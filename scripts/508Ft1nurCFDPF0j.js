let leg = await foundry.applications.api.Dialog.wait({
    window: { title: this.item.name },
    content: "<p class='centered'>Choose Leg</p>",
    buttons: [
        {
            action: "leftLeg",
            label: "Left Leg",
        },
        {
            action: "rightLeg",
            label: "Right Leg",
        }
    ]
});

let mainEffect = this.item.effects.contents[0];

mainEffect.updateSource({ "flags.impmal.location": leg, name: mainEffect.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[leg].label)})` })

this.item.updateSource({ name: this.item.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[leg].label)})` });