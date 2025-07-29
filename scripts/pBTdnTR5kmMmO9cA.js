this.item.update({"system.traits.list" : this.item.system.traits.list.filter(i => i.key != "ineffective")})

this.script.notification("Ineffective Removed")