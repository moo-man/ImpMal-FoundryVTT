        this.actor.applyDamage(5).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));

        this.actor.setupSkillTest({key : "reflexes", name : "Dodge"}, {fields : {difficulty : "hard"}, appendTitle : ` – ${this.effect.name}`}).then(test => {if (!test.succeeded)
        {
            this.actor.addCondition("ablaze");
        }
        });