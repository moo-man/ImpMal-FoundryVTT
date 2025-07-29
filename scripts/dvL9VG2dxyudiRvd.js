if (this.item.getFlag("impmal", "years"))
  return;

let roll = await foundry.applications.api.Dialog.confirm({
  window: {title : this.effect.name},
  content : "<p>Roll additional Life Expectancy?</p>"
})

if (!roll)
  return

let years = 3 + Math.ceil(CONFIG.Dice.randomUniform() * 10);

await this.item.setFlag("impmal", "years", years);

this.item.update({"system.notes.gm" : `<p><strong>Additional Life Expectancy</strong>: ${years} years</p>`})
this.script.notification("Life expectancy result placed in Item GM Notes")