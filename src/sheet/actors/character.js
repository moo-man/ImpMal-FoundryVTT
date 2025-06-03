import { AdvancementForm } from "../../apps/advancement";
import IMActorSheet from "./actor";

export default class CharacterSheet extends IMActorSheet
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static DEFAULT_OPTIONS = {
        classes: ["character"],
        window : {
          controls : [
            {
              icon : 'fa-solid fa-chevron-up',
              label : "Advancement",
              action : "advancement"
            }
          ]
        },
        actions : {
          showPatron : this._onShowPatron,
          equip : this._onEquipHand,
          advancement : this._onAdvancement,
          rollDodge : this._onRollDodge,
          rollInitiative : this._onRollInitiative,
          rollMutation : this._onRollMutation
        },
        defaultTab : "main"
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/impmal/templates/actor/character/character-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/character/character-main.hbs' },
        skills: { scrollable: [".sheet-list.skills .list-content"], template: 'systems/impmal/templates/actor/tabs/actor-skills.hbs' },
        talents: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-talents.hbs' },
        combat: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-combat.hbs' },
        powers: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-powers.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-effects.hbs' },
        equipment: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-equipment.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/actor/character/character-notes.hbs' },
      }

      
      static TABS = {
        main: {
          id: "main",
          group: "primary",
          label: "Main",
        },
        skills: {
          id: "skills",
          group: "primary",
          label: "Skills",
        },
        talents: {
          id: "talents",
          group: "primary",
          label: "Talents",
        },
        combat: {
          id: "combat",
          group: "primary",
          label: "Combat",
        },
        powers: {
          id: "powers",
          group: "primary",
          label: "Powers",
        },
        effects: {
          id: "effects",
          group: "primary",
          label: "Effects",
        },
        equipment: {
          id: "equipment",
          group: "primary",
          label: "Equipment",
        },
        notes: {
          id: "notes",
          group: "primary",
          label: "Notes",
        }
      }

      async _prepareContext(options)
      {
        let context = await super._prepareContext(options)
        let hands = this.actor.system.hands;
        // If holding two different weapons, can use TWF
        context.canUseTWF = (hands.left.document && hands.right.document && hands.left.id != hands.right.id);
        context.dodgeValue = this.actor.system.skills.reflexes.total;
        let dodge = this.actor.itemTypes.specialisation.find(i => i.name == "Dodge" && i.system.skill == "reflexes");
        if (dodge)
        {
            context.dodgeValue = dodge.system.total;
        }
        return context
      }

      async _onDropActor(data, ev)
      {
        let actor = await Actor.implementation.fromDropData(data);

        if (actor.type == "patron")
        {
          return this.document.update(this.document.system.patron.set(actor));
        }
      }
    
      static _onShowPatron(ev, target)
      {
        if (this.document.system.patron.document)
        {
            this.document.system.patron.document.sheet.render(true);
        }
        else 
        {
            ui.notifications.info("IMPMAL.AddPatron", {localize : true});
        }
      }

      static _onEquipHand(ev, target)
      {
        let itemId = this._getId(ev);
        let hand = target.dataset.hand;
        let item = this.actor.items.get(itemId);

        this.actor.update(this.actor.system.hands.toggle(hand, item));
      }

      static _onAdvancement(ev, target)
      {
        new AdvancementForm(this.actor).render(true);
      }

      static _onRollDodge()
      {
          this.actor.setupSkillTest({key : "reflexes", name : "Dodge"});
      }
  
      static _onRollInitiative()
      {
          this.actor.rollInitiative({createCombatants : true});
      }

      static _onRollMutation()
      {
        this.actor.system.rollMutation();
      }
  
      
}