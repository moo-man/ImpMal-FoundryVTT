        if (args.context.resist?.includes("power") && !args.context.psychicCastigation && args.context.resistingTest?.result?.SL < args.result.SL) 
        {
            args.context.psychicCastigation = true;
            // Need to apply an effect because there will be permissions issues if we just apply damage directly (for players)
            let damageEffect = this.item.effects.get("McpFyX27K8ECVS4H").toObject();
            damageEffect.system.transferData.type == "document";
	        damageEffect.flags.impmal.damage =  args.result.SL - args.context.resistingTest?.result?.SL;
            args.context.resistingTest.actor.applyEffect({effectData : [damageEffect]});
        }