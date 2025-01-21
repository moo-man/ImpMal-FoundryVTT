import TableSettings from "../apps/table-settings";

export default function registerSettings() 
{
    game.settings.register("impmal", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: "0.0.0"
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

    // Register Automatic Success threshold
    game.settings.register("impmal", "automaticSuccess", {
        name: "IMPMAL.AutomaticSuccess",
        hint : "IMPMAL.AutomaticSuccessHint",
        scope: "world",
        config: true,
        type: Number,
        default: 5
    });

    // Register Automatic Failure threshold
    game.settings.register("impmal", "automaticFailure", {
        name: "IMPMAL.AutomaticFailure",
        hint : "IMPMAL.AutomaticFailureHint",
        scope: "world",
        config: true,
        type: Number,
        default: 96
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
            "talents" : "9SLhM8FOgluaUwvO",
            "origin" : "nyaEnNOrR8Sq8Wf4"
        }
    });

    game.settings.register("impmal", "disableTheme", {
        name: "IMPMAL.DisableTheme",
        hint: "IMPMAL.DisableThemeHint",
        scope: "user",
        config: true,
        default: false,
        type: Boolean,
        onChange : rule => rule ? document.body.classList.add("no-theme") : document.body.classList.remove("no-theme")
      });
  
}