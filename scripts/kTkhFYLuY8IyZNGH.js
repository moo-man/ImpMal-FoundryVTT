        if (args.opposed?.attackerTest?.item?.type == "power")
        {
            args.modifiers.push({value : -this.actor.system.characteristics.wil.bonus, label : game.i18n.localize(this.effect.name)});
        }