if (args.woundsGained > 0) 
{
    let frightened = this.actor.hasCondition("frightened");
    if (frightened)
    {
        this.script.scriptMessage("No longer Frightened")
        frightened.delete();
    }
}