let isEnergy = ["flamer", "las", "melta", "plasma"].includes(args.opposed?.attackerTest?.item?.system?.category)


if (isEnergy)
{
	args.modifiers.push({value : this.effect.sourceTest.result.SL, label : this.script.label})
}


