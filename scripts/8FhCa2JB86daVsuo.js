let location = this.effect.getFlag("impmal", "location")?.split("Arm")[0];
if (this.actor.type == "character")
{
    return this.actor.system.hands[location].id == args.weapon?.id
}