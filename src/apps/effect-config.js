// import ZoneSettings from "./zone-settings";

import ZoneConfig from "./zone-config";

export default class ImpMalActiveEffectConfig extends WarhammerActiveEffectConfig {

    systemTemplate="systems/impmal/templates/partials/effect-zones.hbs"

    static DEFAULT_OPTIONS = {
        advancedActions : {
            zoneConfig : this._onZoneConfig
        }
    };


    static _onZoneConfig(ev, target)
    {
        new ZoneConfig(this.document).render({force : true});
    }
}