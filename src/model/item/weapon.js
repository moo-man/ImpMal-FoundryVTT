import { DocumentReferenceModel } from "../shared/reference";
import { DamageModel } from "./components/damage";
import { EquippableItemModel } from "./components/equippable";
import { TraitListModel } from "./components/traits";
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
        return schema;
    }


    computeBase() 
    {
        super.computeBase();
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
        this._applyAmmoMods();
        this.skill = this.getSkill(actor);
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
                this.equipped.offhand = hands[actor.system.handed] == true;
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

}