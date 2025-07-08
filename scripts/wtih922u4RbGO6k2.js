let arm = await foundry.applications.api.Dialog.wait({
    window: { title: this.item.name },
    content: "<p class='centered'>Choose Arm</p>",
    buttons: [
        {
            action: "leftArm",
            label: "Left Arm",
        },
        {
            action: "rightArm",
            label: "Right Arm",
        }
    ]
});
let mainEffect = this.item.effects.contents[0];

mainEffect.updateSource({ "flags.impmal.location": arm, name: mainEffect.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[arm].label)})` });

this.item.updateSource({ name: this.item.name + ` (${game.i18n.localize(this.actor.system.combat.hitLocations[arm].label)})` });