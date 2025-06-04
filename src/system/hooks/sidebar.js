import CharGenIM from "../../apps/chargen/char-gen";

export default function() {
  Hooks.on("renderActorDirectory", async (app, html) =>
    {
        let button = document.createElement("button");
        button.textContent = game.i18n.localize("IMPMAL.CharacterCreation");
        button.classList.add("character-creation");
  
        button.onclick = () => {CharGenIM.start();}
        let div = document.createElement("div");
        div.classList.add("action-buttons", "flexrow")
        div.appendChild(button);
        html.querySelector(".header-actions").insertAdjacentElement("afterend", div)
    })
}