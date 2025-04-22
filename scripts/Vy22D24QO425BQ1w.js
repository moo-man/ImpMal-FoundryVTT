if (await foundry.applications.api.DialogV2.confirm({ window: { title: this.effect.name }, content: "Are you sure you wish to modify the target's characteristics? This is not reversible." })) {
    let target = Array.from(game.user.targets)[0]

    await target.actor.update({
        system: {
            characteristics: {
                wil: {
                    starting: this.actor.system.characteristics.wil.starting,
                    modifier: 0
                },
                per: {
                    starting: this.actor.system.characteristics.per.starting,
                    modifier: 0
                },
                int: {
                    starting: this.actor.system.characteristics.int.starting,
                    modifier: 0
                },
                fel: {
                    starting: this.actor.system.characteristics.fel.starting,
                    modifier: 0
                }
            }
        }
    })


    await target.actor.addEffectItems(["Compendium.impmal-core.items.Item.owV6X67ajuIlIiK7",
        "Compendium.impmal-core.items.Item.iF1qxYZdS6GKxaVk",
        "Compendium.impmal-inquisition.items.Item.hkQ5a28KjUr21qBT",
        "Compendium.impmal-core.items.Item.XnKX6A6hVzeXsGld",
        "Compendium.impmal-core.items.Item.FlK5TFyjJNmgnExw",
        "Compendium.impmal-core.items.Item.I6NTqen3Srp90dyW",
        "Compendium.impmal-core.items.Item.dXuovICcPa2cssAn",
        "Compendium.impmal-inquisition.items.Item.lwD2p2jSEj6Io81A",
        "Compendium.impmal-core.items.Item.sZluux2xrMuK4w1H",
        "Compendium.impmal-core.items.Item.42dhMCtTnzvxtiUM",
        "Compendium.impmal-core.items.Item.plATcbLJsFW1evOT",
        "Compendium.impmal-core.items.Item.23AM9iBKKeWZKZNj"], this.effect)
}