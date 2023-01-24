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
}