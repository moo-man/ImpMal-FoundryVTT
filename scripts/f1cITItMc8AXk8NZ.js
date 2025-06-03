        let test = await this.actor.setupSkillTest({key : "fortitude", name : "Endurance"}, {appendTitle : ` – ${this.effect.label}`});

if (test.result.SL < this.effect.sourceTest.result.SL)
{
     this.actor.addCondition("blinded", {flags : {impmal : {sunburst : 1}}});
}
else 
{
    this.effect.delete();
}