let blinded = this.actor.hasCondition("blinded");
let fatigued = this.actor.hasCondition("fatigued");
let frightened = this.actor.hasCondition("frightened");
let poisoned = this.actor.hasCondition("poisoned");

if (blinded || fatigued || frightened || poisoned)
{
	blinded?.delete();
	fatigued?.delete();
	frightened?.delete();
	poisoned?.delete();
	this.script.notification("Immune to <em>Blinded</em>, <em>Fatigued</em>, <em>Frightened</em>, <em>Poisoned</em>")
}