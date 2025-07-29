let traits = args.opposed?.attackerTest?.item?.system.traits
if (traits.has("flamer") || traits.has("spread"))
        {
            args.modifiers.push({value : -2, label : this.effect.name, armour : true});
        }