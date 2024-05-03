if (args.type == "weapon" && !args.system.traits.has("subtle") && !args.system.traits.has("twohanded"))
{
   args.system.traits.add("defensive", {modify: true})
}