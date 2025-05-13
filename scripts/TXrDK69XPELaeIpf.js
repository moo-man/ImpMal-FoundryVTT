let heavyBolter = await fromUuid("Compendium.impmal-core.items.Item.rMIaVi1gx3wUghfU");
let multimelta = heavyBolter.toObject();
let plasmaCannon = heavyBolter.toObject();

foundry.utils.mergeObject(multimelta, {name : "Multi-melta", system : {
        category : "melta",
        damage : {
            base : "16",
        },
        traits : {
            list : [{key : "heavy", value : '4'}, {key : "rend", value : '10'}, {key : "twohanded", value : undefined}]
        }
    },
    id : randomID()
})

foundry.utils.mergeObject(plasmaCannon, {name : "Plasma Cannon", system : {
        category : "plasma",
        damage : {
            base : "12",
        },
        traits : {
            list : [
                {key : "heavy", value : '4'}, 
                {key : "twohanded", value : undefined}, 
                {key : "unstable", value : undefined}, 
                {key : "supercharge", value : "4"}, 
                {key : "loud", value : undefined}, 
                {key : "penetrating", value : "6"}
            ]
        }
    },
    id : randomID()
})

let choice = await ItemDialog.create([heavyBolter, plasmaCannon, multimelta], 1, "Choose Weapon");

this.actor.createEmbeddedDocuments("Item", choice);