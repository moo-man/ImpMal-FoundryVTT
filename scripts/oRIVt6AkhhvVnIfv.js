
        let roll = Math.ceil(CONFIG.Dice.randomUniform() * 10);
        let item;
        if (roll <= 2)
        {
            item = this.actor.items.get("2SZrKJ0gmD4XNAfF")
        }
        else if (roll <= 4)
        {
            item = this.actor.items.get("QRwhlJY9CXkKCiUT")
        }
        else if (roll <= 6)
        {
            item = this.actor.items.get("B1OrTmkBMJze5TZU")
        }
        else if (roll <= 8)
        {
            item = this.actor.items.get("EQjhALZOZZOeXlM3")
        }
        else if (roll <= 10)
        {
            item = this.actor.items.get("Lhwa7OvB2p8z7zLs")
            await this.actor.setupTraitTest(item.id);
            ui.notifications.notify("Resolve this attack with the target before rolling the next attack")
        }

        this.actor.setupTraitTest(item.id);

        this.script.scriptMessage(`<a class="inline-roll"><i class="fa-solid fa-dice-d10"></i>${roll}</a>: ${item.name}`)