import TableSettings from "../apps/table-settings";

export default function registerSettings() 
{
    game.settings.register("impmal", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: 0
    });

    game.settings.register("impmal", "superiority", {
        name: "IMPMAL.Superiority",
        scope: "world",
        config: false,
        type: Number,
        default: 0
    });

    game.settings.register("impmal", "countEveryBullet", {
        name: "IMPMAL.CountEveryBullet",
        hint : "IMPMAL.CountEveryBulletHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.registerMenu("impmal", "tableSettingsMenu", {
        name : game.i18n.localize("IMPMAL.TableSettings"),
        label : game.i18n.localize("IMPMAL.TableSettings"),
        hint : game.i18n.localize("IMPMAL.TableSettingsHint"),
        type : TableSettings,
        restricted : true
    })  ;

    game.settings.register("impmal", "tableSettings", {
        name: "IMPMAL.TableSettings",
        scope: "world",
        config: false,
        type: Object,
        default: {
            "critarm" : "7PZdfk0TRBPDr0QR",
            "critleg" : "2GOSTiyV8FH51YD2",
            "crithead" : "dvsiB3K8ezHI8F7M",
            "critbody" : "kCP63j7ZWPVquLqW",
            "critvehicle" : "wyIDvsnkkI18FbJy",
            "fumble" : "HL6DtTGWIUQy5NZ9",
            "perils" : "2YYlAUyaVIt4bZVa",
            "phenomena" : "9aSbu2mswOOI43J1",
            "talents" : "9SLhM8FOgluaUwvO"
        }
    });
}