        if (args.opposed?.attackerTest?.item?.system.isRanged && !args.opposed?.attackerTest?.actor?.statuses.has("psychic-barrier"))
        {
            args.modifiers.push({value : this.effect.sourceTest.result.SL * -2, label : this.effect.name});
        }