let specialisations = await warhammer.utility.findAllItems("specialisation", "", true, ["system.skill"]);

        specialisations = specialisations.filter(i => i.system.skill == "piloting");
        let choice = [];
        if (specialisations.length)
        {
            choice = await ItemDialog.create(specialisations, 1, {text : game.i18n.localize("IMPMAL.ChooseSpecialisation"), title : this.effect.name});
        }

        if (!choice[0])
        {
            choice = [{name : await ValueDialog.create({title : this.effect.name, text : "Enter Specialisation"})}]
        }


        if (choice[0])
        {
            this.item.updateSource({name : this.item.setSpecifier(choice[0].name)});
        }