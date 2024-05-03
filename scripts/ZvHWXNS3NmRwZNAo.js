        if (args.context.skill == "discipline" && args.result.outcome == "failure" && !hasProperty(args.context, "sanityIsForTheWeak"))
        {
            let use = await Dialog.wait({
                label : this.effect.name,
                content : "Sufffer 1d10 Damage to automatically pass?",
                buttons : {
                    yes : {
                        label : game.i18n.localize("Yes"),
                        callback : () => 
                        {
                            let damage = Math.ceil(10 * CONFIG.Dice.randomUniform());
                            this.actor.applyDamage(damage, {ignoreAP : true});
                            return damage;
                        }
                    },
                    no : {
                        label : game.i18n.localize("No"),
                        callback : () => 
                        {
                            return false;
                        }
                    }
                }
            });

            args.context.sanityIsForTheWeak = use;
        }

            if (args.context.sanityIsForTheWeak)
            {
                args.result.outcome = "success";
		args.result.outcomeDescription = "Success";
                args.result.SL = 1;
                args.result.text.sanityIsForTheWeak = `<strong>${this.effect.name}</strong>: Automatically Pass. Takes ${args.context.sanityIsForTheWeak} Damage`;
            }