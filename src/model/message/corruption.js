export class CorruptionMessageModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        let fields = foundry.data.fields;
        let schema = {};

        schema.exposure = new fields.StringField()
        schema.corruption = new fields.NumberField()
        schema.source = new fields.StringField()
        schema.skill = new fields.StringField()

        return schema;
    }

    async applyCorruptionTo(actor)
    {
        if (actor.type != "character")
        {
            return;
        }
        else 
        {
            actor.system.applyCorruption({exposure : this.exposure, corruption : this.corruption, skill : this.skill})
        }
    }

    /**
     * 
     * @param {String} exposure "minor" "moderate" or "major"
     * @param {Number} options.corruption Numeric amount of corruption to test against
     * @param {String} options.source descriptor of corruption source
     * @param {String} options.skill force "discipline" or "fortitude" instead of choosing
     */
    static async postExposure(exposure, {corruption, source, skill}={})
    {

        let title = exposure ? game.i18n.localize(`IMPMAL.Exposure${exposure.capitalize()}`) : `Corruption Exposure (${corruption})`

        let content = `
        <h3 style="text-align: center">${title}</h3>
        <button type="button" class="resist-corruption">${game.i18n.localize("IMPMAL.Resist")}${skill ? (" (" + game.i18n.localize("IMPMAL." + skill.capitalize()) + ")") : ""}</button>`

        ChatMessage.create({
            content,
            type : "corruption",
            system : {
                exposure,
                corruption,
                source,
                skill
            },
            speaker : {alias : source},
            flavor : game.i18n.localize("IMPMAL.Corruption")
        });
    }
}