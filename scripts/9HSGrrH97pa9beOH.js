let traits = args.opposed?.attackerTest?.item?.system.traits
if (traits.has("blast") || traits.has("spread"))
        {
            args.modifiers.push({value : -1, label : this.effect.name, armour : true});
        }