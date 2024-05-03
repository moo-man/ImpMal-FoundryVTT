        let item = this.actor.items.get(this.effect.getFlag("impmal", "itemTargets")[0]);

        if (item && item.system.isEquipped)
        {
            this.actor.applyDamage(ChatMessage.getSpeakerActor(this.effect.sourceTest.context.speaker).system.characteristics.wil.bonus, {location: "body", ignoreAP : item.type == "protection"})
        }
else 
{
	this.script.scriptMessage("No Damage - Item is unequipped");
}