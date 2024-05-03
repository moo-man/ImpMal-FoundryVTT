// We want to be able to toggle the power armour armour, but we don't want it to be enabled if the power armour itself is inactive

// This is why we can't make a conditional script - we wont it to be toggleable off when the item is worn

if (!this.effect.disabled && !this.item.system.isEquipped)
{
	ui.notification.error("Cannot activate while Item is unequipped");
	this.effect.update({disabled : true});
}