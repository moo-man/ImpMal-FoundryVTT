import { PhysicalItemModel } from "./physical";

let fields = foundry.data.fields;

export class EquippableItemModel extends PhysicalItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.equipped = new fields.SchemaField({
            value: new fields.BooleanField(),
            force: new fields.BooleanField()
        });

        return schema;
    }

    async _preUpdate(data, options, user) {
        await super._preUpdate(data, options, user);
        if (foundry.utils.hasProperty(options.changed, "system.slots.value") && !foundry.utils.hasProperty(options.changed, "system.slots.list")) {
            data.system.slots.list = this.slots.updateSlotsValue(foundry.utils.getProperty(options.changed, "system.slots.value"))
        }

    }

    async _onUpdate(data, options, user) {
        await super._onUpdate(data, options, user)
        if (game.user.id === user && foundry.utils.hasProperty(data, "system.equipped")) {
            await this.onEquipToggle();
        }
    }

    computeBase() {
        super.computeBase();

        if (this.equipped.force) {
            this.equipped.value = true;
        }

        // A slotted item is equipped if the parent item is not equippable or if it is equippable, if it's equipped
        if (this.isSlotted && (!(this.isSlotted?.system?.equippable) || this.isSlotted?.system?.isEquipped)) {
            this.equipped.value = true;
        }

        // if equipped/worn, reduce encumbrance by 1
        if (this.equipped.value) {
            this.encumbrance.total = Math.max(0, this.encumbrance.total - 1);
        }
    }
    get isEquipped() {
        return this.equipped.value;
    }

    async unequip() {
        if (this.equipped.value && this.parent.isOwned) {

            await this.parent.update({ "system.equipped.value": false, "system.equipped.force": false });
            if (this.parent.actor?.type == "character") {
                await this.parent.actor.update(this.parent.actor.system.hands.unequip(this.parent));
            }
        }
    }

    async equip(hand) {
        if (this.parent.isOwned) 
        {
            if (this.parent.actor?.type == "character") 
            {
                await this.parent.actor.update(this.parent.actor.system.hands.equip(this.parent, hand));
            }
            else 
            {
                await this.parent.update({ "system.equipped.value": true });
            }
        }
    }

    get equippable() {
        return true;
    }

    shouldTransferEffect(effect) {
        // effect.equipTransfer means to check the item equip state and only transfer the effect if true. If equipTransfer is false, always transfer the effect
        return super.shouldTransferEffect(effect) && (!effect.system.transferData.equipTransfer || (effect.system.transferData.equipTransfer && this.isEquipped));
    }

    /**
   * This should be temporary, as it's ripped from Foundry and not very clean
   */
    _applyModifications() {
        for (let mod of this.mods.documents) {
            // Add traits
            this.traits.combine(mod.system.addedTraits);

            // Remove Traits
            this.traits.list = this.traits.list.filter(t => {
                let removed = mod.system.removedTraits.has(t.key);
                if (removed) {
                    if (Number.isNumeric(t.value)) {
                        t.value -= (removed.value || 0);
                    }

                    // If boolean trait, or trait has negative value (after subtracting above), remove it
                    if (!Number.isNumeric(t.value) || t.value <= 0) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return true;
                }
            });
            this._applyEffects(mod.effects.filter(i => !i.disabled));
        }
    }


    _applyAmmoMods() {
        let ammo = this.ammo.document;
        let ammoDamage;
        let ammoRange;
        if (ammo) {
            if (ammo.type == "weapon") // Launchers use grenades/explosive weapons
            {
                ammoDamage = Number(ammo.system.damage.base) || 0;
            }
            else if (ammo.type == "ammo") // Everything else
            {
                ammoDamage = (Number(ammo.system.damage) || 0);
                if (ammo.system.range) {
                    ammoRange = ammo.system.range;
                }
            }

            this.damage.value += ammoDamage;
            if (ammoRange) {
                this.range = ammoRange;
            }


            if (ammo.type == "weapon") // Launchers use grenades/explosive weapons
            {
                this.traits.combine(ammo.system.traits);
            }
            else if (ammo.type == "ammo") {
                this.traits.combine(ammo.system.addedTraits);
                this.traits.remove(ammo.system.removedTraits);
            }

            this._applyEffects(ammo.effects.filter(e => e.system.transferData.type == "document" && e.system.transferData.documentType == "Item" && !e.disabled));
        }
    }

    _applyEffects(effects) {
        // Add numeric effect values
        for (let effect of effects) {
            for (let change of effect.changes) {
                const current = foundry.utils.getProperty(this.parent, change.key) ?? null;

                const modes = CONST.ACTIVE_EFFECT_MODES;
                const changes = {};
                switch (change.mode) {

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

    async onEquipToggle(value) {
        let args = { equipped: value ?? this.isEquipped }
        await Promise.all(this.parent.runScripts("equipToggle", args));
        if (args.abort) {
            // TODO allow prevent unequip
        }
    }

}