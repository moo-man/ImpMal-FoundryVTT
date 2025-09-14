        if (args.context.skill == "discipline" && args.result.outcome == "failure" && !foundry.utils.hasProperty(args.context, "sanityIsForTheWeak"))
        {

            let use = await foundry.applications.api.Dialog.confirm({
                window : {title : this.effect.name},
                content : "Suffer 1d10 Damage to automatically pass?",
            });

            if (use)
            {
                let damage = Math.ceil(10 * CONFIG.Dice.randomUniform());
                this.actor.applyDamage(damage, {ignoreAP : true});
                args.context.sanityIsForTheWeak = damage;
            }
        }

            if (args.context.sanityIsForTheWeak)
            {
                args.result.outcome = "success";
		        args.result.outcomeDescription = "Success";
                args.result.SL = 1;
                args.result.text.sanityIsForTheWeak = `<strong>${this.effect.name}</strong>: Automatically Pass. Takes ${args.context.sanityIsForTheWeak} Damage`;
            }