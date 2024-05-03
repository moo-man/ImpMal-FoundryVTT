
                            let roll = new Roll("1d5").roll().then(async roll => {
                                this.actor.applyDamage(roll.total, {ignoreAP : true}).then(data => this.script.scriptMessage("Took " + data.woundsGained + " Damage from Ablaze"));
                            })
                            