        if (!args.options.wastedFrame && (args.data.system?.skills?.athletics?.advances || args.data.system?.skills?.fortitude?.advances))
        {
            delete args.data.system?.skills?.athletics?.advances;
            delete args.data.system?.skills?.fortitude?.advances;
            this.script.scriptNotification("Cannot advance this skill, use the Advance manual script to advance with the increased XP cost");
        }