        if (args.data.system?.fate?.value < this.actor.system.fate?.value)
        {	
            ChatMessage.implementation.corruptionMessage("minor", {}, {speaker: {alias : this.effect.name}});
        }