if (args.opposed?.attackerTest?.item?.system.traits.has("flamer"))
        {
            args.modifiers.push({value : -2, label : this.effect.name, armour : true});
        }