        let items = (await game.impmal.utility.getAllItems(["equipment", "weapon", "modification", "protection", "augmetic"])).filter(i => i.system.encumbrance.value == 0);

        let choice = await ItemDialog.create(items, 1)

        if (choice.length) {
            if (choice[0].system.cost > this.actor.system.solars)
            {
                return ui.notifications.error("Not Enough Solars!");
            }
            this.actor.createEmbeddedDocuments("Item", choice).then(items => {
                this.actor.update({
                    "system.solars": this.actor.system.solars - items[0].system.cost
                })
            })
        }