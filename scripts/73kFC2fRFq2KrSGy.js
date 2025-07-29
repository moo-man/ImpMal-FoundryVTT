if (args.context.resist?.includes("poisoned"))
{
  this.script.notification("Automatically succeeds on resisting Poisoned, effect now disabled.");
this.effect.update({"disabled" : true});
args.abort = true;
}