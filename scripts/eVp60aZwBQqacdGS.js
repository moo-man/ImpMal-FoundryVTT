        if (args.context.fullAutoFanatic) 
        {
            args.result.tags.fullAutoFanatic = this.effect.name;
	    args.result.text.fullAutoFanatic = "Affects all creatures within Close Range of the target"
            args.context.additionalAmmoUsed += args.computeAmmoUsed();
        }