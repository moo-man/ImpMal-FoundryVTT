if (args.name == "Bite")
{
	if (!args.system.traits.has("loud"))
	{
	
	args.system.traits.add("loud", {modify : true});
	args.system.traits.add("rend", {modify : true, value : 2})
	args.system.damage.base += 2;
}
}