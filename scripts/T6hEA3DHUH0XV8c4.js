        let lostFingers = this.actor.getFlag("impmal", "lostFingers") || 0;
        if (this.actor.system.hands[this.item.system.location.value].id == args.context.weapon.id && lostFingers < 5 && lostFingers > 0 && args.result.outcome == "failure")
        {
            let ones = Number(args.result.roll.toString().split("").pop());
            if (ones <= lostFingers)
            {
                args.result.fumble = true;
		        args.result.text["lostFingerFumble"] = "Fumbled due to lost fingers"
            }
        }