let newMode = this.item.getFlag("impmal", "mode") == "pressure" ? "volume" : "pressure"

this.item.setFlag("impmal", "mode", newMode);