

export class TestDialog extends WarhammerRollDialogV2
{

    static DEFAULT_OPTIONS = {
        position: {
            width: 600
        }
    };

    get tooltipConfig() 
    {
        return {
            modifier : {
                label : "IMPMAL.Modifier",
                type : 1,
                path : "fields.modifier",
                hideLabel : true
            },
            SL : {
                label : "IMPMAL.SL",
                type : 1,
                path : "fields.SL"
            },
            difficulty : {
                label : "IMPMAL.Difficulty",
                type : 0,
                path : "fields.difficulty"
            },
            advantage : {
                label : "IMPMAL.Advantage",
                type : 1,
                path : "advantage"
            },
            disadvantage : {
                label : "IMPMAL.Disadvantage",
                type : 1,
                path : "disadvantage"
            }
        }
    }

    static PARTS = {
        fields : {
            template : "systems/impmal/templates/apps/test-dialog/test-dialog.hbs",
            fields: true
        },
        state : {
            template : "systems/impmal/templates/apps/test-dialog/dialog-state.hbs",
            fields: true
        },
        mode : {
            template : "modules/warhammer-lib/templates/apps/dialog/dialog-mode.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    // Backwards compatibility for scripts referencing adv/disCount
    get advCount()
    {
        return this.advantage;
    }

    set advCount(value)
    {
        this.advantage = value;
    }

    get disCount()
    {
        return this.disadvantage;
    }

    set disCount(value)
    {
        this.disadvantage = value;
    }

    advantage = 0;
    disadvantage = 0;
    forceState = "";

    _defaultFields() 
    {
        return foundry.utils.mergeObject(super._defaultFields(), {
            modifier : 0,
            SL : 0,
            difficulty : "challenging",
            state : "none",
            fateAdvantage : false
        });
    }
    async _prepareContext(options) 
    {
        this.advantage = 0;
        this.disadvantage = 0;
        let context = await super._prepareContext(options);
        
        context.advantage = this.advantage;
        context.disadvantage = this.disadvantage;
        this.fields.state = this.computeState();
        context.showSuperiority = this.actor?.inCombat && this.actor?.hasPlayerOwner;
        return context
    }

    async computeFields() 
    {
        if (this.fields.useSuperiority)
        {
            this.fields.SL += game.impmal.resources.get("superiority")
            this.tooltips.add("SL", game.impmal.resources.get("superiority"), game.i18n.localize("IMPMAL.Superiority"))
        }

        if (this.fields.fateAdvantage)
        {
            this.advCount++;
            this.tooltips.add("advantage", 1, "Using Fate");
        }
    }

    /**
     * Compute whether disadvantage or advantage should be selected
     */
    computeState()
    {
        if (this.forceState) //"adv" "dis" and "none"
        {
            return this.forceState;
        }

        else if (this.advantage > this.disadvantage && this.advantage > 0)
        {
            this.tooltips.start(this);
            this.fields.modifier += 10 * ((this.advantage - 1) - this.disadvantage);
            this.tooltips.finish(this, "Excess Advantage");
            return "adv";
        }

        else if (this.disadvantage > this.advantage && this.disadvantage > 0)
        {
            this.tooltips.start(this);
            this.fields.modifier -= 10 * ((this.disadvantage - 1) - this.advantage);
            this.tooltips.finish(this, "Excess Disadvantage");
            return "dis";

        }

        else 
        {
            return "none";
        }
    }

    submit(ev)
    {
        if (this.fields.fateAdvantage)
        {
            this.actor.spend("system.fate.value");
        }
        return super.submit(ev);
    }

    _onFieldChange(ev) 
    {
        // If the user clicks advantage or disadvantage, force that state to be true despite calculations
        if (ev.currentTarget.name == "state")
        {
            this.forceState = ev.currentTarget.value;
            this.render(true);
        }
        else return super._onFieldChange(ev);
    }

    createBreakdown()
    {
        let breakdown = super.createBreakdown();
        let difficulty = game.impmal.config.difficulties[this.fields.difficulty];
        breakdown.base = `<p>${game.i18n.localize("IMPMAL.Base")}: @BASE</p>`;
        breakdown.modifier = `<p>${game.i18n.localize("IMPMAL.Modifier")}: ${HandlebarsHelpers.numberFormat(this.fields.modifier, {hash : {sign: true}})}</p>`;
        breakdown.difficulty = `<p>${game.i18n.localize("IMPMAL.Difficulty")}: ${game.i18n.localize(difficulty.name)} (${HandlebarsHelpers.numberFormat(difficulty.modifier, {hash : {sign: true}})})</p>`;
        breakdown.SL = `<p>${game.i18n.localize("IMPMAL.SL")}: ${HandlebarsHelpers.numberFormat(this.fields.SL, {hash : {sign: true}})}</p>`;
        breakdown.advantage = `<p>${game.i18n.localize("IMPMAL.Advantage")}: ${this.advCount} ${this.userEntry.state == "adv" ? "(" + "Forced" + ")" : "" }</p>`;
        breakdown.disadvantage = `<p>${game.i18n.localize("IMPMAL.Disadvantage")}: ${this.disCount} ${this.userEntry.state == "dis" ? "(" + "Forced" + ")" : "" }</p>`;

        breakdown.modifiersBreakdown = this.tooltips.getCollectedTooltips();
        return breakdown;
    }
   
    get title()
    {
        return this.data.title;
    }

    /**
     * 
     * @param {object} actor Actor performing the test
     * @param {object} data Dialog data, such as title and actor
     * @param {object} fields Predefine dialog fields
     */
    static setupData(actor, target, context={}, options={})
    {
        log(`${this.prototype.constructor.name} - Setup Dialog Data`, {args : Array.from(arguments).slice(2)});

        let dialogData = {data : {}, fields : options.fields || {}};
        if (actor)
        {
            dialogData.data.speaker = ChatMessage.getSpeaker({actor});
        }
        dialogData.data.actor = actor;
        dialogData.context = context || {}; // Arbitrary values - used with scripts
        dialogData.context.tags = context?.tags || {}; // Tags shown below test results - used with scripts
        dialogData.context.text = context?.text || {}; // Longer text shown below test results - used with scripts
        dialogData.context.skipTargets = context.skipTargets
        if (actor && !actor?.token)
        {
            // getSpeaker retrieves tokens even if this sheet isn't a token's sheet
            delete dialogData.data.speaker.scene;
        }
        dialogData.data.title = (context.title || game.i18n.localize("IMPMAL.Test")) + (context.appendTitle || "");
        if (target)
        {
            dialogData.data.target = target;
        }

        dialogData.fields.difficulty = dialogData.fields.difficulty || "challenging";

        let defendingAgainst = actor?.defendingAgainst

        dialogData.data.targets = (defendingAgainst || context.skipTargets) ? [] : Array.from(game.user.targets).filter(t => t.document.id != dialogData.data.speaker.token); // Remove self from targets

        // Defending scripts are dialog scripts coming from the attacker and/or the weapon used in the attack.
        // e.g. "Dodge tests to defend against this attack have disadvantage"
        let defendingScripts = defendingAgainst ? ((defendingAgainst.item?.getScripts("dialog").concat(defendingAgainst.actor?.getScripts("dialog"))).filter(s => s.options?.defending)) : []


        if (!context.skipTargets) 
        {
            // Collect Dialog effects 
            //   - Don't use our own targeter dialog effects, DO use targets' targeter dialog effects
            dialogData.data.scripts = foundry.utils.deepClone(
                (dialogData.data.targets
                    .map(t => t.actor)
                    .filter(actor => actor)
                    .reduce((prev, current) => prev.concat(current.getScripts("dialog", (s) => s.options?.targeter)), []) // Retrieve targets' targeter dialog effects
                    .concat(actor?.getScripts("dialog", (s) => !s.options?.targeter && !s.options?.defending) // Don't use our own targeter dialog effects
                    .concat(defendingScripts)
                    ))) || [];
        }
        else 
        {
            dialogData.data.scripts = actor?.getScripts("dialog", (s) => !s.options?.targeter).concat(defendingScripts) // Don't use our own targeter dialog effects
        }

        log(`${this.prototype.constructor.name} - Dialog Data`, {args : dialogData});
        return dialogData;
    }

}