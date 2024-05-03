        if (this.actor.system.fate.value > 0)
        {
            this.scriptNotification("Cannot gain Fate Points", "error");
            this.actor.update({"system.fate.value" : 0});
        }