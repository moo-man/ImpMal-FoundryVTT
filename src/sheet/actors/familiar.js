import NPCSheet from "./npc"

export class FamiliarSheet extends NPCSheet
{

      static DEFAULT_OPTIONS = {
          classes : ["familiar"],
          actions : {
            removeHandler : this._removeHandler,
        },
      }

      static PARTS = {
        header : {scrollable: [""], classes : ["npc-header"], template : 'systems/impmal/templates/actor/familiar/familiar-header.hbs' },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/npc/npc-main.hbs' },
        skills: { scrollable: [".sheet-list.skills .list-content"], template: 'systems/impmal/templates/actor/tabs/actor-skills.hbs' },
        powers: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-powers.hbs' },
        familiarSpecific: { scrollable: [""], template: 'systems/impmal/templates/actor/familiar/familiar-specific.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-effects.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/actor/npc/npc-notes.hbs' },
      }

      static TABS = {
        main: {
          id: "main",
          group: "primary",
          label: "IMPMAL.Main",
        },
        skills: {
          id: "skills",
          group: "primary",
          label: "IMPMAL.Skills",
        },
        powers: {
          id: "powers",
          group: "primary",
          label: "IMPMAL.Powers",
        },
        familiarSpecific: {
          id: "familiarSpecific",
          group: "primary",
          label: "IMPMAL.FamiliarSpecific",
        },
        effects: {
          id: "effects",
          group: "primary",
          label: "IMPMAL.Effects",
        },
        notes: {
          id: "notes",
          group: "primary",
          label: "IMPMAL.Notes",
        }
      }


      static async _removeHandler(ev, target) {
        this.actor.update(this.actor.system.handler.removeId(target.dataset.uuid));
      }

      async _onDropActor(data, ev)
      {
        let actor = await Actor.implementation.fromDropData(data);

        if (actor.type == "character")
        {
          return this.document.update(this.document.system.handler.add(actor));
        }
      }

}