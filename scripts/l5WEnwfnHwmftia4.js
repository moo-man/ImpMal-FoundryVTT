        let ownWP = this.actor.system.characteristics.wil.total;
        let casterWP = ChatMessage.getSpeakerActor(this.effect.sourceTest.context.speaker).system.characteristics.wil.total;
        if (casterWP > ownWP)
        {
            args.fields.modifier = casterWP - ownWP;
        }
        args.advCount++;