import IMActorSheetV2 from "./actor";

export default class IMCharacterSheetV2 extends IMActorSheetV2
{

    factionsExpanded={}; // Retain expanded influence sections on rerender;

    static DEFAULT_OPTIONS = {
        classes: ["character"],
        window : {
          controls : [
            {
              icon : 'fa-solid fa-chevron-up',
              label : "Advancement",
              action : "onAdvancement"
            }
          ]
        },
        actions : {

        },
        defaultTab : "main"
      }

      static PARTS = {
        header : {scrollable: [""], template : 'systems/impmal/templates/v2/actor/character/character-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        main: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/character/character-main.hbs' },
        skills: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/tabs/actor-skills.hbs' },
        talents: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/tabs/actor-talents.hbs' },
        combat: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/tabs/actor-combat.hbs' },
        effects: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/tabs/actor-effects.hbs' },
        powers: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/tabs/actor-powers.hbs' },
        equipment: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/tabs/actor-equipment.hbs' },
        notes: { scrollable: [""], template: 'systems/impmal/templates/v2/actor/character/character-notes.hbs' },
      }
      
}