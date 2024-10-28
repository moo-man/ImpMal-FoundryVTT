export default class ZoneConfig extends WarhammerZoneConfig
{
    static configTemplate = "systems/impmal/templates/apps/zone-config.hbs";
    static PARTS = {
        tabs : {template : "modules/warhammer-lib/templates/partials/sheet-tabs.hbs"},
        config: { template: this.configTemplate },
        effects : { template : "modules/warhammer-lib/templates/apps/zone-effects.hbs" }
    };


    static DEFAULT_OPTIONS = 
    {
        //classes : ["impmal"], 
    };
}