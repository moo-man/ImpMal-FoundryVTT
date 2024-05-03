let skill = args.actor.items.find(i => i.type == "specialisation" && i.name == "Adeptus Terra" && i.system.skill == "lore");
if (skill)
{
    args.fields.SL += skill.system.advances;
}
