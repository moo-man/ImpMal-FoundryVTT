let names = this.effect.getFlag("impmal", "trueNames") || []

if (names.length)
{
  this.script.notification(`Current Names: ${names.join(", ")}`)
}

let name = await ValueDialog.create({text: "Enter the name of a Daemon", title : this.effect.name})

if (name) {
this.effect.setFlag("impmal", "trueNames", names.concat(name))
}