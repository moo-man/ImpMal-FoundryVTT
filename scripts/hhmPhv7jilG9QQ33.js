if (args.type == "weapon" && args.system.traits.has("subtle") && args.system.damage.characteristic == "str")
{
    args.system.damage.characteristic = "ag"
}