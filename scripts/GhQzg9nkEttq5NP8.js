if (!this.item.isOwned)
  return;

let mode = this.item.getFlag("impmal", "mode");

this.item.name = this.item.setSpecifier("High " + mode.capitalize())

if (mode == "volume")
{
  this.item.system.damage.base = "5";
  this.item.system.traits.add("inflict", {value : "Stunned", modify : true})
}