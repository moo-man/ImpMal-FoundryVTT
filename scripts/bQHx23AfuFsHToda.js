        if (!args.context.psychicFlood)
        {

            let gain = (await ValueDialog.create({title : this.effect.name, text : "Warp Charge / SL Gained"})) || 0;
            args.context.psychicFlood = gain;
            args.context.tags.push("Psychic Flood: " + gain);
            await this.actor.update({"system.warp.charge" : this.actor.system.warp.charge += gain});
        }