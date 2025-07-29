if (this.item.system.isEquipped)
{
    await this.item.system.unequip();

}
if (this.item.system.traits.has("twohanded"))
{
   await this.item.update(this.item.system.traits.removeKey("twohanded"));
}
else 
{
    await this.item.update({"system.traits.list" : this.item.system.traits.add("twohanded")})
}

await this.item.system.equip();