        if (!args.context.psychicFlood)
        {

            let gain = 0;
            await Dialog.wait({
                title : this.effect.name,
                content: "<p>Warp Charge / SL Gained</p><input type='number' value='0'/>",
                buttons : {
                    confirm : {
                        label : game.i18n.localize("Confirm"),
                        callback : (dlg) => 
                        {
                            let input = dlg.find("input")[0];
                            gain = Math.max(0, Number(input.value));
                        }
                    }
                },
                default : "confirm"
            });
            args.context.psychicFlood = gain;
            args.context.tags.push("Psychic Flood: " + gain);
            await this.actor.update({"system.warp.charge" : this.actor.system.warp.charge += gain});
        }