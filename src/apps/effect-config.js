import sheetMixin from "../sheet/mixins/sheet-mixin";
import EffectScriptConfig from "./effect-script-config";
import ScriptConfig from "./script-config";

export default class ImpmalActiveEffectConfig extends ActiveEffectConfig 
{
    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes.push("impmal");
        return options;
    }


    async _render(force, options)
    {
        await super._render(force, options);

        let scriptHTML = await renderTemplate("systems/impmal/templates/apps/effect-scripts.hbs", {scripts : this.object.scriptData});
        let effectApplicationHTML = await renderTemplate("systems/impmal/templates/apps/effect-application-config.hbs", this.object);

        this.element.find("nav").append(`<a class='item' data-tab="scripts"><i class="fa-solid fa-code"></i>${game.i18n.localize("IMPMAL.EffectScripts")}</a>`);
        $(`<section class='tab' data-tab="scripts">${scriptHTML}</section>`).insertBefore(this.element.find("footer"));

        this.element.find("[name='transfer']").parents(".form-group").replaceWith(effectApplicationHTML);

        // Activate Script tab if that is the cause of the rerender. It is added after rendering so won't be automatically handled by the Tabs object
        if (options.data?.flags?.impmal?.scriptData)
        {
            this.activateTab("scripts");
        }
        this.element.css("height", "auto");
    }

    activateListeners(html)
    {
        super.activateListeners(html);

        html.on("click", ".add-script", () => 
        {
            let scripts = this.object.scriptData.concat({label : game.i18n.localize("IMPMAL.EffectNewScript"), string : ""});
            return this.submit({preventClose: true, updateData: {
                [`flags.impmal.scriptData`]: scripts
            }});
        });

        html.on("click", ".script-delete", ev => 
        {
            let index = this._getDataAttribute(ev, "index");
            let scripts = this.object.scriptData.filter((value, i) => i != index);
            return this.submit({preventClose: true, updateData: {
                [`flags.impmal.scriptData`]: scripts
            }});
        });

        html.on("click", ".script-edit", ev => 
        {
            let index = this._getDataAttribute(ev, "index");
            new EffectScriptConfig(this.object, {index}).render(true);
        });

        html.on("click", ".script-config", ev => 
        {
            new ScriptConfig(this.object, {path : this._getDataAttribute(ev, "path")}).render(true);
        });

        html.on("change", ".impmal-effect-config input,.impmal-effect-config select", () => 
        {
            this.submit({preventClose: true});
        });
    }

    _getDataAttribute = sheetMixin(this.constructor).prototype._getDataAttribute;
}