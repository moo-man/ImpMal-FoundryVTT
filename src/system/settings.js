import TableSettings from "../apps/table-settings";
import IMThemeConfig from "../apps/theme";

export default function registerSettings() 
{
    game.settings.register("impmal", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: "0.0.0"
    });

    game.settings.registerMenu("impmal", "themeConfig", {
        name: "WH.Theme.Config",
        label : "WH.Theme.ConfigButton",
        hint : "WH.Theme.ConfigHint",
        icon: "fa-solid fa-table-layout",
        scope: "user",
        config: true,
        type: IMThemeConfig
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
        label : game.i18n.localize("IMPMAL.TableConfigure"),
        hint : game.i18n.localize("IMPMAL.TableSettingsHint"),
        icon : "fa-solid fa-list",
        type : TableSettings,
        restricted : true
    })  ;

    game.settings.register("impmal", "tableSettings", {
        name: "IMPMAL.TableSettings",
        scope: "world",
        config: false,
        type: TableSettings.schema
    });
    
    game.settings.register("impmal", "playerExperienceEditing", {
        name: "IMPMAL.PlayerExperienceEditing",
        hint: "IMPMAL.PlayerExperienceEditingHint",
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register("impmal", "theme", {
        name: "Theme",
        scope: "client",
        config: false,
        type: IMThemeConfig.schema
    });
  
    warhammer.utility.registerPremiumModuleInitialization()
  
}