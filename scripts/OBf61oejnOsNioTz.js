for(let i = 0; i < args.result.SL; i++)
{
    let roll = await new Roll("1d10");
    roll.toMessage();
}