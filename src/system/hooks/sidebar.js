import CharGenIM from "../../apps/chargen/char-gen";

export default function() {
  Hooks.on("renderSidebarTab", async (app, html) => 
  {
    if (app instanceof ActorDirectory)
    {
      let button = $(`<button>${game.i18n.localize("IMPMAL.CharacterCreation")}</button>`)
  
      button.click(ev => {
        CharGenIM.start();
      })
  
      button.insertAfter(html.find(".header-actions"))
      
    }
  })
}