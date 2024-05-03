if (args.context.automaticallySucceed)
{
	args.data.result.roll = 1;
	args.context.text["autoSucceed"] = `<strong>${this.item.name}:</strong> Automatically succeeded.`
}