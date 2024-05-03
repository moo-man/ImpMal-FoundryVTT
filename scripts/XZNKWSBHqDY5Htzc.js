        let SL = this.effect.sourceTest?.result.SL;
        let penetrating = args.system.traits.list.find(i => i.key == "penetrating");
        if (penetrating)
        {
            penetrating.value = Math.max(penetrating.value, SL);
        }
        else 
        {
            args.system.traits.list.push({key : "penetrating", value : SL});
        }