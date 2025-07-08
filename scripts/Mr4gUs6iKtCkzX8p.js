let choice = await foundry.applications.api.Dialog.wait({
    window : {title : "Advance Skill"},
    content : "Choose which skill to advance. This will cost double XP.",
    buttons : [
        {
            action : "athletics",
            label : game.i18n.localize("IMPMAL.Athletics"),
        },
        {
            action : "fortitude",
            label : game.i18n.localize("IMPMAL.Fortitude"),
        }
    ]
});

let advances = this.actor.system.skills[choice].advances + 1
if (advances > 4)
{
    return ui.notifications.error("Cannot advance beyond 4");
}

let cost = XPModel.skillTotalCosts[advances];

if (this.actor.system.xp.available >= cost * 2)
{
    this.actor.update({[`system.skills.${choice}.advances`] : advances, "system.xp" : this.actor.system.xp.other.add({description : `Wasted Frame (${game.impmal.config.skills[choice]})`, xp : cost})}, {wastedFrame : true});
    this.script.scriptNotification("Spent " + (cost * 2) + " XP");
}
else 
{
    ui.notifications.error("Not enough XP");
}