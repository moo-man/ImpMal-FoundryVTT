import { EquipSlots } from "./components/equip-slots";
import { DamageModel } from "./components/damage";
import { EquippableItemModel } from "./components/equippable";
import { TraitListModel } from "./components/traits";
import { ModListModel } from "./modification";
let fields = foundry.data.fields;

export class WeaponModel extends EquippableItemModel
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.damage = new fields.EmbeddedDataField(DamageModel);
        schema.traits = new fields.EmbeddedDataField(TraitListModel);
        schema.ammo = new fields.EmbeddedDataField(DocumentReferenceModel);
        schema.ammoCost = new fields.NumberField();
        schema.attackType = new fields.StringField();
        schema.category = new fields.StringField();
        schema.spec = new fields.StringField();
        schema.range = new fields.StringField();
        schema.rangeModifier = new fields.SchemaField({
            value : new fields.NumberField({initial : 0}),
            override : new fields.StringField({})
        });
        schema.mag = new fields.SchemaField({
            value : new fields.NumberField({min: 0, integer: true, initial : 1}),
            current : new fields.NumberField({min: 0, integer : true, initial: 0})
        });
        schema.mods = new fields.EmbeddedDataField(ModListModel);
        schema.slots = new fields.EmbeddedDataField(EquipSlots);
        return schema;
    }


    async _preUpdate(data, options, user)
    {
        await super._preUpdate(data, options, user);
        if (foundry.utils.hasProperty(options.changed, "system.mag.value") && this.ammo.document)
        {
            foundry.utils.setProperty(data, "system.mag.current", data.system.mag.value);
        }
    }

    async _onUpdate(data, options, user)
    {
        await super._onUpdate(data, options, user);
        let updateData = {}
        // If ammo changed, also update current mag value
        // Can't be in _preUpdate because need to check ammo quantity, ammo.document would not ready 
        if (foundry.utils.hasProperty(data, "system.ammo.id"))
        {
            if (this.ammo.document)
            {
                foundry.utils.setProperty(updateData, "system.mag.current", Math.min(this.mag.value, this.ammo.document.system.quantity));
            }
            else if (!this.ammo.document)
            {
                foundry.utils.setProperty(updateData, "system.mag.current", 0);
            }
        }    

        if (!foundry.utils.isEmpty(updateData))
        {
            this.parent.update(updateData);
        }
    }


    computeBase() 
    {
        super.computeBase();
        if (game.settings.get("impmal", "countEveryBullet") && !this.mag.multiplied && (this.traits.has("burst") || this.traits.has("rapidFire")))
        {
            this.mag.value *= 5;
            this.mag.multiplied = true;
        }
        this.mods.prepareMods(this.parent);
        this.traits.compute();
        this.damage.SL = true;
        this.specialisation = game.impmal.config[`${this.attackType}Specs`][this.spec];
        this.computeEquipped();

        // Unlike other "equippable" items, weapons should not subtract encumbrance if it is equipped, So redo the calculation
        this.encumbrance.total = this.quantity * this.encumbrance.value;
    }

    computeOwned(actor) 
    {
        this.damage.compute(actor);
        this._applyModifications();
        this._applyAmmoMods();
        this._applyShieldMods(actor.items);
        this.computeRange();
        this.skill = this.getSkill(actor);
        this.skillTotal = this.skill instanceof Item ? this.skill?.system?.total : actor.system.skills[this.skill].total;
    }

    // For characters, equipped is determined if the item is held is left or right hand
    // For anything else, not needed, just use the equipped value
    computeEquipped()
    {
        let actor = this.parent?.actor;
        if (actor?.type == "character" && !this.isSlotted && !this.equipped.force)
        {
            let hands = actor.system.hands.isHolding(this.parent.id);
            this.equipped.value = isEmpty(hands) ? false : true;
            this.equipped.hands = hands;
            if (this.traits.has("twohanded"))
            {
                this.equipped.offhand = false;
            }
            else 
            {
                // Flip handedness to check
                this.equipped.offhand = hands[actor.system.handed == "right" ? "left" : "right"] == true;
            }
        }
    }

    getSkill(actor)
    {
        let skill = this.attackType;
        let skillObject = actor.system.skills[skill];
        let skillItem = skillObject.specialisations.find(i => i.name.slugify() == this.specialisation?.slugify());

        return skillItem ?? skill;
    }

    _addModelProperties()
    {
        if (this.parent.actor)
        {
            this.ammo.relative = this.parent.actor.items;
            this.slots.relative = this.parent.actor.items;
            this.slots.list.forEach(i => i.relative = this.slots.relative);
        }
    }

    get attackData() 
    {
        return {
            specialisation : this.specialisation,
            skillTotal : this.skillTotal,
            damage : this.damage, 
            traits : this.traits,
            range : this.range
        };
    }

    get ammoList()
    {
        let items = this.parent.actor?.items || [];
        if (this.isMelee)
        {
            return [];
        }
        if (this.category == "launcher")
        {
            return items.filter(i => i.type == "weapon" && i.system.spec == "ordnance" && i.system.category == "grenadesExplosives");
        }
        else 
        {
            return items.filter(i => i.type == "ammo");
        }
    }

    // Might be renamed, means "uses own quantity for ammo"
    get selfAmmo()
    {
        return this.category == "grenadesExplosives";
    }

    /**
     * 
     * @param {Boolean} trackAmmo Whether or not to check the quantity of the ammo item linked to the weapon
     * @returns 
     */
    reload(trackAmmo=true) 
    {
        if (!trackAmmo)
        {
            // If not tracking ammo, just return a full magazine
            return {"system.mag.current" : this.mag.value}; 
        }

        let ammo = this.ammo.document;
        if (!ammo)
        {
            throw game.i18n.localize("IMPMAL.ErrorReloadNoAmmo");
        }

        return {"system.mag.current" : Math.min(this.mag.value, this.mag.current + ammo.system.quantity, ammo.system.quantity)};
    }

    useAmmo(amount = 1)
    {

        if (this.isMelee)
        {
            throw game.i18n.localize("IMPMAL.ErrorMeleeWeapon");
        }
        
        if (this.selfAmmo)
        {
            return {"system.quantity" : this.quantity - amount};
        }
        else 
        {
            return {"system.mag.current" : this.mag.current - amount};
        }
    }

    hasAmmo()
    {
        if (this.isMelee)
        {
            return true;
        }

        else if (this.selfAmmo)
        {
            return this.quantity != 0;
        }

        else 
        { 
            return this.mag.current != 0;
        }
    }

    computeRange()
    {
        if (this.range)
        {
            let ranges = ["short","medium","long","extreme"];
            let index = ranges.findIndex(i => i == this.range);
            index = Math.clamp(index + this.rangeModifier.value, 0, ranges.length - 1);
            this.range = ranges[index];
        }

        if (this.rangeModifier.override)
        {
            this.range = this.rangeModifier.override;
        }
    }

    /**
     * This should be temporary, as it's ripped from Foundry and not very clean
     */
    _applyModifications()
    {
        for(let mod of this.mods.documents)
        {
            // Add traits
            this.traits.combine(mod.system.addedTraits);

            // Remove Traits
            this.traits.list = this.traits.list.filter(t => 
            {
                let removed = mod.system.removedTraits.has(t.key);
                if (removed)
                {
                    if (Number.isNumeric(t.value))
                    {
                        t.value -= (removed.value || 0);
                    }

                    // If boolean trait, or trait has negative value (after subtracting above), remove it
                    if (!Number.isNumeric(t.value) || t.value <= 0)
                    {
                        return false;
                    }
                    else 
                    {
                        return true;
                    }
                }
                else
                {
                    return true;
                }
            });
            this._applyEffects(mod.effects.filter(i => !i.disabled));
        }
    }


    _applyAmmoMods() 
    {
        let ammo = this.ammo.document;
        let ammoDamage;
        let ammoRange;
        if (ammo)
        {
            if (ammo.type == "weapon") // Launchers use grenades/explosive weapons
            {
                ammoDamage = Number(ammo.system.damage.base) || 0;
            }
            else if (ammo.type == "ammo") // Everything else
            {
                ammoDamage = (Number(ammo.system.damage) || 0);
                if (ammo.system.range)
                {
                    ammoRange = ammo.system.range;
                }
            }

            this.damage.value += ammoDamage;
            if (ammoRange)
            {
                this.range = ammoRange;
            }
            

            if (ammo.type == "weapon") // Launchers use grenades/explosive weapons
            {
                this.traits.combine(ammo.system.traits);
            }
            else if (ammo.type == "ammo")
            {
                this.traits.combine(ammo.system.addedTraits);
                this.traits.remove(ammo.system.removedTraits);
            }

            this._applyEffects(ammo.effects.filter(e => e.system.transferData.type == "document" && e.system.transferData.documentType== "Item" && !e.disabled));
        }
    }

    _applyEffects(effects)
    {
        // Add numeric effect values
        for(let effect of effects)
        {
            for(let change of effect.changes)
            {
                const current = foundry.utils.getProperty(this.parent, change.key) ?? null;
        
                const modes = CONST.ACTIVE_EFFECT_MODES;
                const changes = {};
                switch ( change.mode ) 
                {
        
                case modes.ADD:
                    effect._applyAdd(this.parent, change, current, Number(change.value), changes);
                    break;
                case modes.MULTIPLY:
                    effect._applyMultiply(this.parent, change, current, Number(change.value), changes);
                    break;
                case modes.OVERRIDE:
                    effect._applyOverride(this.parent, change, current, change.value, changes);
                    break;
                case modes.UPGRADE:
                case modes.DOWNGRADE:
                    effect._applyUpgrade(this.parent, change, current, Number(change.value), changes);
                    break;
                default:
                    effect._applyCustom(this.parent, change, current, Number(change.value), changes);
                    break;
                }
        
                // Apply all changes to the Actor data
                foundry.utils.mergeObject(this.parent, changes);
            }
        }
    }

    getOtherEffects()
    {
        // A weapon has more effects than just its own, it should include modification and ammo effects
        return super.getOtherEffects()
        .concat(this.categoryEffect || [])
        .concat(Object.values(this.traits.traitEffects("weapon")))
        .concat(
            (this.mods.documents || []).concat(
                this.ammo.document || [])
                .reduce((prev, current) => prev.concat(current.effects.contents), []));
        // .filter(e => e.applicationData.documentType == "Item"));
    }

    get categoryEffect()
    {
        let effectData = game.impmal.config.weaponCategoryEffects[this.category];
        if (effectData)
        {
            let effect = new ActiveEffect.implementation(effectData, {parent: this.parent});
            effect.updateSource({"flags.impmal.path" : `${this.schema.fieldPath}.categoryEffect`})
            return effect;
        }
    }


    _applyShieldMods(items) 
    {
        let shield = items.find(i => 
            i.type == "protection" && 
            i.system.isEquipped && 
            i.system.category == "shield" && 
            i.system.traits.has("shield"));

        if (this.isEquipped && this.isMelee && shield && !this.traits.has("defensive"))
        {
            this.traits.list.push({key : "defensive"});
        }
    }

    get isMelee()
    {
        return this.attackType == "melee";
    }

    get isRanged()
    {
        return this.attackType == "ranged";
    }

    async summaryData()
    {
        let data = await super.summaryData();
        let config = game.impmal.config;
        data.tags = data.tags.concat([
            game.i18n.format("IMPMAL.ItemDisplayXDamage", {damage : this.damage.value}),
            config.weaponTypes[this.attackType],
            this.specialisation,
            config.ranges[this.range],
            this.traits.htmlArray]).filter(i => i);
        return data;
    }

}