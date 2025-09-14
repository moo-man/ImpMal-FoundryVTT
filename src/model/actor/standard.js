import { BaseActorModel } from "./base";
import { CharacteristicsModel } from "./components/characteristics";
import { StandardCombatModel } from "./components/combat";
import { SkillsModel } from "./components/skills";
let fields = foundry.data.fields;

/**
 * Represents actors that have characteristics and skills
 * Encompasses player characters and NPCs
 */
export class StandardActorModel extends BaseActorModel 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.characteristics = new fields.EmbeddedDataField(CharacteristicsModel);
        schema.skills = new fields.EmbeddedDataField(SkillsModel);
        schema.combat = new fields.EmbeddedDataField(StandardCombatModel);
        schema.warp = new fields.SchemaField({
            charge : new fields.NumberField({min: 0}),
            state : new fields.NumberField({initial: 0, min: 0}),
            sustaining : new fields.EmbeddedDataField(DocumentReferenceListModel)
        });

        schema.autoCalc = new fields.SchemaField({
            wounds: new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.AutoCalc.Wounds"}),
            criticals : new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.AutoCalc.CriticalWounds"}),
            initiative : new fields.BooleanField({initial : true, label : "IMPMAL.ActorConfig.AutoCalc.Initiative"}),
        });
        return schema;
    }

    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user);

        // Prevent wounds from exceeding max
        if (foundry.utils.hasProperty(data, "system.combat.wounds.value"))
        {
            if (data.system.combat.wounds.value > this.combat.wounds.max)
            {
                data.system.combat.wounds.value = this.combat.wounds.max;
            }

            options.deltaWounds = data.system.combat.wounds.value - this.combat.wounds.value;
        }
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        //TODO: Check for dead effect if above critical wound threshold

        if (options.deltaWounds)
        {
            if (options.deltaWounds > 0)
            {
                TokenHelpers.displayScrollingText("+" + options.deltaWounds, this.parent, {fill: "0xB31B1B"});
            }
            else if (options.deltaWounds < 0)
            {
                TokenHelpers.displayScrollingText(options.deltaWounds, this.parent, {fill: "0xB31B1B"});
            }
        }

        if (options.showActionText && data.system.combat.action)
        {
            TokenHelpers.displayScrollingText(game.impmal.config.actions[data.system.combat.action].label, this.parent);
        }
    }
    
    initialize() 
    {
        this.encumbrance = {};
        this.encumbrance.overburdened = 0;
        this.encumbrance.restrained = 0;
        this.encumbrance.value = 0;
        this.combat.initialize();
    }

    computeBase() 
    {
        super.computeBase();
        this.characteristics.computeTotals();
        this.characteristics.computeBonuses();
        this.combat.criticals.value = this.parent.itemTypes.critical.length;
        this.warp.threshold = this.characteristics.wil.bonus; // Put this in base so it's modifiable by effects
        if (this.warp.sustaining.list.length)
        {
            let minCharge = this.warp.sustaining.documents.reduce((sum, power) => sum + power?.system?.rating || 0, 0);
            if (this.warp.charge < minCharge)
            {
                    this.warp.charge = minCharge;
            }
        }

    }

    computeDerived() 
    {
        super.computeDerived();
        // Recompute bonuses as active effects may have changed it
        this.characteristics.computeTotals();
        this.characteristics.computeBonuses();
        this.runScripts("computeCharacteristics", this);
        this.skills.computeTotals(this.characteristics);
        this.skills.findSpecialisations(this.parent.itemTypes.specialisation);
        this.computeEncumbranceThresholds(this.parent.itemTypes);
        this.runScripts("computeEncumbrance", this);
        this.computeEncumbranceState();
        this.combat.computeCombat(this.characteristics, this.parent.itemTypes);
        this.runScripts("computeCombat", this);
        this.computeWarpState();
        this.runScripts("computeWarpState", this);
        this.vehicle = game.actors.find(v => v.type == "vehicle" && (v.system.actors.list.find(i => i.id == this.parent.id)));
    }

    computeEncumbranceThresholds(items) 
    {
        let list = [];
        let physicalTypes = Object.keys(game.template.Item).filter(i => game.template.Item[i].templates?.includes("physical"));
        
        for (let type in items)
        {
            if (physicalTypes.includes(type))
            {
                list = list.concat(items[type]);
            }
        }

        this.encumbrance.overburdened += this.characteristics.str.bonus + this.characteristics.tgh.bonus; 
        this.encumbrance.restrained += (this.characteristics.str.bonus + this.characteristics.tgh.bonus) * 2;

        this.encumbrance.value += list.reduce((acc, item) => 
        {
            if (item.system.inPack && item.system.inPack.system.ignoreEncumbrance)
            {
                return acc;
            }
            else
            {
                return acc + item.system.encumbrance.total
            }
        }, 0);
    }

    computeEncumbranceState()
    {
        if (this.encumbrance.value <= this.encumbrance.overburdened)
        {
            this.encumbrance.state = 0;
        }
        else if (this.encumbrance.value <= this.encumbrance.restrained)
        {
            this.encumbrance.state = 1;
        }
        else if (this.encumbrance.value > this.encumbrance.restrained)
        {
            this.encumbrance.state = 2;
        }
    }

    computeWarpState()
    {
        // State = 0: Charge <= Threshold
        // State = 1: Charge > Threshold and has not failed Psychic Mastery Test
        // State = 2: Charge > Threshold and has failed Psychic Mastery test, has not rolled Perils yet

        // State 1 and 2 cannot be "computed", State 0 can be computed 
        // So if state is 0 and charge > threshold, state should be 1 instead
        // State 1 -> 2 is determined via test results
        if (this.warp.charge > this.warp.threshold && this.warp.state == 0)
        {
            this.warp.state = 1;
        }
        if (this.warp.charge <= this.warp.threshold)
        {
            this.warp.state = 0;
        }
    }

    _checkEncumbranceEffects(actor)
    {
        let overburdened = actor.hasCondition("overburdened");
        let restrained = actor.hasCondition("restrained");
        let effect;

        if (actor.system.encumbrance.state == 0)
        {
            if (overburdened?.isComputed)
            {
                overburdened.delete();
            }
            if (restrained?.isComputed)
            {
                restrained.delete();
            }
        }

        else if (actor.system.encumbrance.state == 1)
        {
            if (!overburdened)
            {   
                effect = "overburdened";
            }

            if (restrained?.isComputed)
            {
                restrained.delete();
            }
        }
        else if (actor.system.encumbrance.state == 2)
        {
            if (!restrained)
            {   
                effect = "restrained";
            }
        }

        if (effect)
        {
            actor.addCondition(effect, null, {"system.computed" : true})
        }

    }

    get slots()
    {
        return this.parent.items.filter(i => i.system.slots).reduce((slots, item) => slots.concat(item.system.slots.list.map(s => {s.source = item; return s;})), []);
    }

    _addModelProperties()
    {
        super._addModelProperties();
        this.warp.sustaining.relative = this.parent.items;
    }

    async useAction(action)
    {
        let actionData = game.impmal.config.actions[action];
        let effectAdded = false; // Flag effect being added so scrolling text doesn't overlap

        if (action == "twf")
        {
            return this.parent.useTWF();
        }

        if (actionData.execute)
        {
            actionData.execute(this.parent);
        }
        else if (actionData.effect)
        {
            effectAdded = await ActiveEffect.implementation.create(actionData.effect, {parent : this.parent});
        }
        else if (actionData.test)
        {
            this.parent.setupTestFromData(actionData.test, {appendTitle : ` – ${actionData.label}`});
        }
        this.parent.update({"system.combat.action" : action}, {showActionText : !effectAdded});
    }

    async applyDamage(value, {ignoreAP=false, location="roll", message=false, opposed, update=true, context={}}={})
    {   
        let modifiers = [];
        let traits = opposed?.attackerTest?.itemTraits;
        let locationKey;
        if (typeof location == "string")
        {
            if (location == "roll")
            {
                locationKey  = this.combat.randomHitLoc();
            }
            else // if location is some other string, assume it is the location key
            {
                locationKey = location;
            }
        }
        else if (typeof location == "number")
        {
            locationKey  = this.combat.hitLocAt(location);
        }
        let locationData = this.combat.hitLocations[locationKey];

        let args = {actor : this.parent, value, ignoreAP, modifiers, locationData, opposed, traits, context};
        await Promise.all(opposed?.attackerTest?.actor.runScripts("preApplyDamage", args) || []);
        await Promise.all(opposed?.attackerTest?.item?.runScripts?.("preApplyDamage", args) || []);
        await Promise.all(this.parent.runScripts("preTakeDamage", args)); 
        // Reassign primitive values that might've changed in the scripts
        value = args.value;
        ignoreAP = args.ignoreAP;

        let woundsGained = value;
        let armourRoll;

        if (locationData.field)
        {
            await locationData.field.system.applyField(value, modifiers);
        }

        if (!ignoreAP && (locationData.armour || locationData.formula))
        {
            let armourValue = locationData.armour || 0;
            if (locationData.formula)
            {
                armourRoll = new Roll(locationData.formula);
                await armourRoll.roll();
                if (game.dice3d)
                {
                    game.dice3d.showForRoll(armourRoll);
                }
                armourValue += armourRoll.total;
            }
            let penetrating = traits?.has("penetrating");
            if (penetrating)
            {
                armourValue = Math.max(0, armourValue - Number(penetrating.value || 0));
                modifiers.push({value : penetrating.value, label : game.i18n.localize("IMPMAL.Penetrating"), applied : true});
            }
            modifiers.push({value : -armourValue, label : game.i18n.localize("IMPMAL.Protection"), armour : true});
            if (traits?.has("ineffective"))
            {
                modifiers.push({value : -armourValue, label : game.i18n.localize("IMPMAL.Ineffective"), armour : true});
            }
        }
        
        for (let modifier of modifiers)
        {
            // Skip modifier if it's from armour when ignoreAP is true, or if the modifier has already been applied
            if (!modifier.applied && (!modifier.armour || !ignoreAP))
            {
                woundsGained += Number(modifier.value || 0);
            }
        }
        woundsGained = Math.max(0, woundsGained);


        let excess = 0;
        let critical = false;
        if ((woundsGained + this.combat.wounds.value) > this.combat.wounds.max)
        {
            excess = (woundsGained + this.combat.wounds.value) - this.combat.wounds.max;
            critical = true;
        }

        let critModifier = opposed?.attackerTest?.result.critModifier;
        let text = "";
        args = {actor : this.parent, woundsGained, locationData, opposed, critModifier, excess, critical, text, modifiers, context};
        await Promise.all(opposed?.attackerTest?.actor.runScripts("applyDamage", args) || []);
        await Promise.all(opposed?.attackerTest?.item?.runScripts?.("applyDamage", args) || []);
        await Promise.all(this.parent.runScripts("takeDamage", args)); 
        woundsGained = args.woundsGained;
        critModifier = args.critModifier;
        excess = args.excess;
        critical = args.critical;
        text = args.text;
        // A script might replace text
        text = text || game.i18n.format("IMPMAL.WoundsTaken", {wounds : woundsGained, location : game.i18n.localize(locationData.label)});
        let critFormula = ``;
        if (excess)
        {
            critFormula += " + " + excess;
        }
        if (critModifier)
        {
            critFormula +=  " + " + critModifier;
        }
        let critString;
        if (critical)
        {
            critString = ` <a class="table-roll" data-table="crit${game.impmal.config.generalizedHitLocations[locationKey]}" data-formula="1d10 + ${critFormula}"><i class="fa-solid fa-dice-d10"></i>Critical ${critFormula}</a>`;
        }

        let updateData = {"system.combat.wounds.value" : this.combat.wounds.value + woundsGained};

        let damageData = {
            damage : value,
            text, 
            woundsGained, 
            message : message ? ChatMessage.create({content : (`<p>${text}</p>` + `<p>${(critString ? critString : "")}</p>`), speaker : ChatMessage.getSpeaker({actor : this.parent})}) : null,
            modifiers,
            critical : critString,
            excess,
            location,
            updateData,
            armourRoll
        };

        if (update)
        {
            await this.parent.update(updateData);
        }
        if (traits?.has("rend"))
        {
            damageData.rend = traits.has("rend").value;
            // TODO: this isn't supported if update flag is false
            if (update)
            {
                await this.parent.damageArmour(locationKey, damageData.rend, null, {prompt : true, rend : true});
            }
        }
        return damageData;
    }

}

