if (args.opposed?.attackerTest?.item?.system.traits.has("blast") || args.opposed?.attackerTest?.item?.system.traits.has("spread"))
        {
            args.modifiers.push({value : -3, label : this.effect.name, armour : true});
        }