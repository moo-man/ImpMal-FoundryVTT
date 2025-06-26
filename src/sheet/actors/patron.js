import RewardDialog from "../../apps/reward-dialog";
import { RewardMessageModel } from "../../model/message/reward";
import IMActorSheet from "./actor";

export default class PatronSheet extends IMActorSheet
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static DEFAULT_OPTIONS = {
        classes: ["patron"],
        actions : {
          createItem : this._onCreateItem,
          postReward : this._onPostReward
        },
        defaultTab : "main"
      }

      static PARTS = {
        header : {scrollable: [""], classes : ["sheet-header"], template : 'systems/impmal/templates/actor/patron/patron-header.hbs' },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/actor/patron/patron-main.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/actor/patron/patron-effects.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/actor/patron/patron-notes.hbs' },
      }

      
      static TABS = {
        main: {
          id: "main",
          group: "primary",
          label: "Main",
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
        if (!game.user.isGM)
          {
              context.items.boonLiability = context.items.boonLiability.filter(i => i.system.visible);
              for(let faction in context.system.influence.factions)
              {
                  context.system.influence.factions[faction].hide = context.system.influence.factions[faction].hidden;
              }
          }
        return context;
      }


      _prepareEffectsContext(context) 
      {
        context.effects = this.actor.effects.contents.concat(this.actor.items
          .reduce((prev, current) => prev.concat(current.effects.contents), [])
          .filter(e => game.user.isGM || (e.parent.type == "boonLiability" ? e.parent.system.visible : game.user.isGM))) // Only show effect if it's visible or user is GM
          .filter(e => e.system.transferData.documentType != "character");
        return context
      }

      static async _onCreateItem(ev, target) 
      {
          let type = this._getType(ev);
          let category = target.dataset.category;
          this.document.createEmbeddedDocuments("Item", [{type, name : `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`, system : {category}}]).then(item => item[0].sheet.render(true));
      }
  

      async _handleEnrichment() 
      {
        let enriched = {}
        for (let i of this.actor.itemTypes.boonLiability)
        {
            enriched[i.id] = await TextEditor.enrichHTML(i.system.notes.player, {async: true, relativeTo: this.parent, secrets: game.user.isGM});
            if (game.user.isGM)
            {
                enriched[i.id] += await TextEditor.enrichHTML(i.system.notes.gm, {async: true, relativeTo: this.parent, secrets: game.user.isGM});
            }
        }
        return foundry.utils.mergeObject(await super._handleEnrichment(), enriched);
      }       

      static async _onPostReward()
      {
          let patron = this.actor;
          let defaultPay = patron.system.payment.value;
          
          let reward = await RewardDialog.prompt({solars: defaultPay, reason : `Payment from ${patron.name}`});
          reward.patron = patron;
          
          RewardMessageModel.postReward(reward);
      }
}