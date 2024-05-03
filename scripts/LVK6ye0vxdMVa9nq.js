        if ((this.actor.statuses.has("lightCover") || this.actor.statuses.has("mediumCover") || this.actor.statuses.has("heavyCover")) && args.opposed && args.opposed.attackerTest.item?.system.isRanged)
        {
            args.modifiers.push({value : -1, label : this.script.label, armour : true});
        }