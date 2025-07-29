let duration = await new Roll("1d10 + @characteristics.tgh.bonus", this.actor.getRollData()).roll();
duration.toMessage(this.script.getChatData({flavor : "Duration"}));
this.effect.updateSource({"duration.rounds" : duration.total})