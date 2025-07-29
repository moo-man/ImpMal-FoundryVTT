let poisoned = this.actor.hasCondition("poisoned");

if (poisoned)
{
  poisone.delete();
  this.script.notification("Removed Poisoned")
}

let test = await this.actor.setupCharacteristicTest("tgh", {appendTitle : this.effect.name})
if (test.failed)
{
  let duration = await new Roll("1d10").roll();
  duration.toMessage(this.script.getChatData({flavor : "Stunned Duration"}))
  this.actor.addCondition("stunned", "minor", {duration : {seconds : duration.total * 60}})
}