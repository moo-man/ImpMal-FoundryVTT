if (!this.item.system.traits.has("ineffective") && await foundry.applications.api.Dialog.confirm({window : {title : this.effect.name}, content : "Activate secondary trigger to add +3 Damage?"}))
{
    args.modifiers.push({value : 3, label : this.effect.name});
    this.item.update({"system.traits.list" : this.item.system.traits.add("ineffective")})
    this.script.notification("Ineffective Added")
}