// import ZoneSettings from "./zone-settings";

import ZoneConfig from "./zone-config";

export default class ImpMalActiveEffectConfig extends WarhammerActiveEffectConfig {

    systemTemplate="systems/impmal/templates/partials/effect-zones.hbs"

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["impmal"]);
        return options;
    }

    async _render(...args)
    {
        await super._render(...args);

        this.element.find(".zone-traits").click(ev => {
            new ZoneConfig(this.document).render(true);
        })
    }
}