if (args.context.resist.includes("power")) 
{
    args.result.SL = (args.context.resistingTest?.result?.SL + 1) || args.result.SL;
    args.result.text.blank = "Automatically win opposed tests against Psychic Powers";
    args.result.outcomeDescription = "Success"
}