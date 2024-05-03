// This would be cleaner in its own Item effect
// But I want it to be in the same effect as the strength bonus
// So it's easier to toggle
if (this.item.uuid == args.uuid)
{
	args.system.encumbrance.value = 0;
}