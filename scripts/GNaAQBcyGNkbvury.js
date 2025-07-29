if (args.targetTokens[0]?.actor.type == "vehicle" && args.result.outcome == "success" && args.result.roll % 10 == 0)
{
  args.result.critical = true;
}