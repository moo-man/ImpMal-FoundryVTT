import sheetMixin from "../sheet/mixins/sheet-mixin";
import EffectScriptConfig from "./effect-script-config";
import ScriptConfig from "./script-config";
import ZoneSettings from "./zone-settings";

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
        let effectApplicationHTML = await renderTemplate("systems/impmal/templates/apps/effect-application-config.hbs", this);

        // Add Scripts Tab and tab section
        this.element.find("nav").append(`<a class='item' data-tab="scripts"><i class="fa-solid fa-code"></i>${game.i18n.localize("IMPMAL.EffectScripts")}</a>`);
        $(`<section class='tab' data-tab="scripts">${scriptHTML}</section>`).insertBefore(this.element.find("footer"));

        // Replace transfer field with Effect Application data (used to derive transfer value)
        this.element.find("[name='transfer']").parents(".form-group").replaceWith(effectApplicationHTML);

        // Replace attribute key field with a select field
        let effectsTab = this.element.find("section[data-tab='effects']");

        // Add a checkbox to toggle between <select> and <input> for effect keys
        $(`<div class="form-group">
        <label>${game.i18n.localize("IMPMAL.ManualEffectKeys")}</label>
        <input type="checkbox" class="manual-keys" name="flags.impmal.manualEffectKeys" ${this.object.getFlag("impmal", "manualEffectKeys") ? "checked" : ""}>
        </div>`).insertBefore(effectsTab.find(".effects-header"));

        // Replace all key inputs with <select> fields (unless disabled)
        if (!this.object.getFlag("impmal", "manualEffectKeys"))
        {
            for (let element of effectsTab.find(".key input"))
            {
                $(element).replaceWith(await renderTemplate("systems/impmal/templates/apps/effect-key-options.hbs", {name : element.name, value : element.value}));
            }
        }

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

        html.on("change", ".manual-keys", () => 
        {
            this.submit({preventClose: true});
        });

        html.on("click", ".traits-config", () => 
        {
            new ZoneSettings(this.object).render(true);
        });
    }

    get zoneTraitsDisplay()
    {
        let traitList = [];
        let traits = this.object.applicationData.traits;

        for(let key in traits)
        {
            if (traits[key])
            {
                let effectKey = typeof traits[key] == "boolean" ? key : traits[key];
                traitList.push(game.impmal.config.zoneEffects[effectKey]?.name);
            }
        }
        return traitList.join(", ");
    }

    _getDataAttribute = sheetMixin(this.constructor).prototype._getDataAttribute;
}