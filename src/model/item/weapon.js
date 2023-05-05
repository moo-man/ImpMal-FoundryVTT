import { DocumentReferenceModel } from "../shared/reference";
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
        schema.attackType = new fields.StringField();
        schema.category = new fields.StringField();
        schema.spec = new fields.StringField();
        schema.range = new fields.StringField();
        schema.mag = new fields.SchemaField({
            value : new fields.NumberField({min: 0, integer: true}),
            current : new fields.NumberField({min: 0, integer : true})
        });
        schema.mods = new fields.EmbeddedDataField(ModListModel);
        return schema;
    }


    computeBase() 
    {
        super.computeBase();
        this.mods.prepareMods();
        this.traits.compute();
        this.specialisation = game.impmal.config[`${this.attackType}Specs`][this.spec];

        // Unlike other "equippable" items, weapons should not subtract encumbrance if it is equipped, So redo the calculation
        this.encumbrance.total = this.quantity * this.encumbrance.value;
    }

    computeOwnerDerived(actor) 
    {
        this.computeEquipped(actor);
        this.ammo.getDocument(actor.items);
        this.damage.compute(actor);
        this._applyModifications();
        this._applyAmmoMods();
        this._applyShieldMods(actor.items);
        this.skill = this.getSkill(actor);
        this.skillTotal = this.skill instanceof Item ? this.skill?.system?.total : actor.system.skills[this.skill].total;
    }

    // For characters, equipped is determined if the item is held is left or right hand
    // For anything else, not needed, just use the equipped value
    computeEquipped(actor)
    {
        if (actor.type == "character")
        {
            let hands = actor.system.hands.isHolding(this.id);
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
        let skillItem = skillObject.specialisations.find(i => i.name == this.specialisation);

        return skillItem ?? skill;
    }

    reload() 
    {
        let ammo = this.ammo.document;
        if (!ammo)
        {
            throw game.i18n.localize("IMPMAL.ErrorReloadNoAmmo");
        }

        return {"system.mag.current" : Math.min(this.mag.value, this.mag.current + ammo.system.quantity)};
    }

    useAmmo(amount = 1)
    {
        let ammo = this.ammo.document;

        if (this.attackType == "melee")
        {
            throw game.i18n.localize("IMPMAL.ErrorMeleeWeapon");
        }

        if (!ammo)
        {
            throw game.i18n.localize("IMPMAL.ErrorNoAmmo");
        }

        if (ammo.system.quantity < amount)
        {
            throw game.i18n.localize("IMPMAL.InsufficentQuantity");
        }

        return {"system.mag.current" : this.mag.current - amount};
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


            // Add numeric effect values
            for(let effect of mod.effects )
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
                        effect._applyOverride(actor, change, current, Number(change.value), changes);
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
    }


    _applyAmmoMods() 
    {
        let ammo = this.ammo.document;

        if (ammo)
        {
            this.damage.value += (Number(ammo.system.damage) || 0);
            
            if (ammo.system.range)
            {
                this.range = ammo.system.range;
            }
            
            this.traits.combine(ammo.system.traits);
        }
    }

    _applyShieldMods(items) 
    {
        let shield = items.find(i => 
            i.type == "protection" && 
            i.system.isEquipped && 
            i.system.category == "shield" && 
            i.system.traits.has("shield"));

        if (this.isEquipped && this.attackType == "melee" && shield)
        {
            this.traits.list.push({key : "defensive"});
        }
    }


    summaryData()
    {
        let data = super.summaryData();
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