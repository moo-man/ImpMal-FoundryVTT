import ArmourConfig from "../../apps/armour-config";
import IMActorSheet from "./actor";

export default class NPCSheet extends IMActorSheet
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static DEFAULT_OPTIONS = {
        classes: ["npc"],
        actions : {
          armourConfig : this._onArmourConfig,
          ammoChange : this._onAmmoChange,
          clickMag : {buttons : [0, 2], handler : this._onClickMag}

        },
        defaultTab : "main"
      }

      static PARTS = {
        header : {scrollable: [""], classes : ["npc-header"], template : 'systems/impmal/templates/actor/npc/npc-header.hbs' },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/npc/npc-main.hbs' },
        skills: { scrollable: [".sheet-list.skills .list-content"], template: 'systems/impmal/templates/actor/tabs/actor-skills.hbs' },
        powers: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-powers.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/actor/tabs/actor-effects.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/actor/npc/npc-notes.hbs' },
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
        notes: {
          id: "notes",
          group: "primary",
          label: "Notes",
        }
      }

      async _prepareContext(options)
      {
        let context = await super._prepareContext(options)
        context.attackItems = context.items.weapon.concat(context.items.trait.filter(t => t.system.attack.enabled));
        let physicalTypes = Object.keys(game.template.Item).filter(i => game.template.Item[i].templates?.includes("physical"));
        context.possessions = context.actor.items.filter(i => physicalTypes.includes(i.type));
        context.traits = context.items.trait.filter(t => !t.system.attack.enabled || t.system.roll.enabled || t.system.test.enabled).concat(context.items.corruption, context.items.talent)
        return context
      }

      async _handleEnrichment() 
      {
          let traits = this.actor.itemTypes.trait.filter(t => !t.system.attack.enabled || t.system.roll.enabled || t.system.test.enabled).concat(this.actor.itemTypes.corruption, this.actor.itemTypes.talent);
          let traitHTML = {};
          for(let t of traits)
          {
            let html = await foundry.applications.ux.TextEditor.enrichHTML(t.system.notes.player, {async: true, relativeTo: this.document, secrets : this.document.isOwner}) || `<p></p>`;
            if (game.user.isGM)
            {
                html += await foundry.applications.ux.TextEditor.enrichHTML(t.system.notes.gm, {async: true, relativeTo: this.document, secrets : this.document.isOwner});
            } 
            traitHTML[t.id] = html;
          }
          return foundry.utils.mergeObject(await super._handleEnrichment(), foundry.utils.expandObject({
            traits : traitHTML
          }));
      } 

      static _onArmourConfig()
      {
        new ArmourConfig(this.document).render({force : true});
      }
      
      static _onAmmoChange(ev, target)
      {
          let id = this._getId(ev);
          let item = this.actor.items.get(id);
          if (this.actor.itemTypes.ammo.length == 0)
          {
              ui.notifications.error(game.i18n.localize("IMPMAL.ErrorNoAmmoItems"));
              return;
          }
          ItemDialog.create([{id : "", name : "None"}].concat(this.actor.itemTypes.ammo), 1, {title : "Ammo", text : "Select ammunition to use"}).then(documents => 
          {
              let ammo = documents[0];
              item.update({"system.ammo.id" : ammo?.id});
          });
      }

      static _onClickMag(ev, target)
      {
        if (ev.button == 0)
        {
          let id = this._getId(ev);
          let item = this.actor.items.get(id);

          item.update(item.system.reload(!!item.system.ammo.document)).then(() => 
          {
              ui.notifications.notify(game.i18n.localize("IMPMAL.Reloaded"));
          });
        }
        else if (ev.button == 2)
        {
          let id = this._getId(ev);
          let item = this.actor.items.get(id);

          item.update(item.system.useAmmo());
        }
      }

      _addEventListeners()
      {
          super._addEventListeners();  

      }
      
}