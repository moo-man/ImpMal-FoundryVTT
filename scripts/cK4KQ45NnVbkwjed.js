let target = args.data.targets[0]?.actor
if (target)
{
	return target.statuses.has("poorlyLit") || target.statuses.has("dark");
}
