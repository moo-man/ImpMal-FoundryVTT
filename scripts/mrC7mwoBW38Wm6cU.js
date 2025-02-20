let weapons = await Promise.all(["Compendium.impmal-core.items.Item.jNxvsLBybPPenmmn",
"Compendium.impmal-core.items.Item.CslpAA241OSUVaGF",
"Compendium.impmal-core.items.Item.DEguAzj8uwUgVTs8"].map(fromUuid));

let choice = await ItemDialog.create(weapons, 1, {title : this.effect.name, text : "Choose Digital Weapon"})

if (choice[0])
{
    let weaponTraits = choice[0].system.traits;
    this.item.updateSource({
        name : this.item.setSpecifier(choice[0].name),
        system : {
            damage : choice[0].system.damage,
            traits: {
                list : weaponTraits.list.concat([weaponTraits.has("subtle") ? [] : {key: "subtle"}], [weaponTraits.has("close") ? [] : {key: "close"}])
            }
        }
    })
}