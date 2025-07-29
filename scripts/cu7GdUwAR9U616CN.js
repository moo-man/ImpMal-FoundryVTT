if (args.item.type != "protection")
 {
   return;
 }
args.item.system.armour ++
if (args.item.system.category != "mesh" && !args.item.system.traits.has("loud"))
{
  console.log("ADDED LOUD")
  args.item.system.traits.add("loud", {modify:true})
}