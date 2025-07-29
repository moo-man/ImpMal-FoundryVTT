let roll = (await new Roll("1d100").roll());
roll.toMessage(this.script.getChatData({flavor: this.script.label}));
if (roll.total <= 10)
{
  (await new Roll("30").roll()).toMessage(this.script.getChatData({flavor: "Damage"}))
}