let hidden = args.data.skill != "awareness" || (this.actor.getFlag("impmal", "earsLost") || 0) < 2 || args.lostEarShown

if (!hidden)
{
	args.lostEarShown = true; // Prevents this being shown twice
}
return hidden