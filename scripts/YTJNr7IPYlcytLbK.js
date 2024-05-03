let SL = this.effect.sourceTest?.result?.SL || 0;
let strB = args.characteristics.str.bonus;

if (SL > strB)
{
    args.characteristics.str.bonus = SL;
}