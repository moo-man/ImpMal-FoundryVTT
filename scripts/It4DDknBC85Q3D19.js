let construction = game.tables.get("ZZQAxUp0yHiQSvvd");
let hereticus = game.tables.get("lrKz476zeIi8kWl1")
let malleus = game.tables.get("PqgFUM1ho5eUIRdE")
let xenos = game.tables.get("9quYsnavFYvVyFFS")
let universal = game.tables.get("1JJRYMCf0w0I6m3H")

let table = await ItemDialog.create([hereticus, malleus, xenos, universal], 1, {text : "Choose Rosette Type", title : this.effect.name});

let resultIcons = {
    "JcSbae8YAvpvjxea" : "modules/impmal-inquisition/assets/misc/rosette-silver.webp",
    "G8tk1VLLtd8fenYU" : "modules/impmal-inquisition/assets/misc/rosette-cover.webp",
    "9gQ2lv3JeamnCQfv" : "modules/impmal-inquisition/assets/misc/rosette-marble.webp",
    "LDJnXXVB0vHOmbFq" : "modules/impmal-inquisition/assets/misc/rosette-silver.webp",
    "YsFVFeaSDJDpzBWk" : "modules/impmal-inquisition/assets/misc/rosette-scraps.webp",
    "dQmK4L4hZzn2Opbe" : "modules/impmal-inquisition/assets/misc/rosette-hololith.webp",
    "bXpdMh0wBLriYUlr" : "modules/impmal-inquisition/assets/misc/rosette-crystal.webp",
    "bEJdcgJSC2swy9na" : "modules/impmal-inquisition/assets/misc/rosette-scraps.webp",
    "6LjYOMf2ezJQgW4J" : "modules/impmal-inquisition/assets/misc/rosette-marble.webp",
    "AI0Rv516JVWQpD8f" : "modules/impmal-inquisition/assets/misc/rosette-brass.webp",
}

let rosetteConstruction = await construction.roll();

let rosetteText = (await table[0].roll()).results[0].text;

this.item.update({
    img : resultIcons[rosetteConstruction.results[0].id],
    system : {
        notes : {
            player : `${rosetteConstruction.results[0].text}${rosetteText}`
        }
    }
})

this.effect.delete();