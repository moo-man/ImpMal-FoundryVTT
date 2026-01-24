let fields = foundry.data.fields;
/**
 * Abstract class that interfaces with the Actor class
 */
export class BaseActorModel extends BaseWarhammerActorModel 
{

    static defineSchema() 
    {
        let schema = {};
        schema.notes = new fields.SchemaField({
            player : new fields.HTMLField(),
            gm : new fields.HTMLField()
        });

        schema.autoCalc = new fields.SchemaField({});

        return schema;
    }
    
    async _preCreate(data, options, user) 
    {
        super._preCreate(data, options, user)
        if (!data.prototypeToken)
        {
            this.parent.updateSource({
                "prototypeToken.name" : data.name,
                "prototypeToken.displayName" : CONST.TOKEN_DISPLAY_MODES.HOVER,
                "prototypeToken.displayBars" : CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
            });
        }
    }

    initialize() 
    {

    }
    
    computeBase() 
    {
        this.initialize();
        super.computeBase();
    }

    embedData(options)
    {

        let html = "";
        if (options.description)
        {
            html += this.notes.player;
            if (game.user.isGM)
                html += this.notes.gm;
        }
        

        return {actor : this.parent, html, options}
    }

    applyDamage()
    {
        
    }

    async toEmbed(config, options)
    {

        let html = "";

        let actor = this.parent;

        if (config.description)
        {
            html += actor.system.notes.player;
            if (game.user.isGM)
                html += actor.system.notes.gm;
        }
        

        if (config.table)
        {
            let armour = actor.system.combat.armour.value;
            if (actor.system.combat.armour.formula)
            {
                armour = `${actor.system.combat.armour.formula} + ${armour}`;
            }

            let skills = [];
            for (let skillKey in actor.system.skills)
            {
                let skill = actor.system.skills[skillKey];
                // Only include skills in the main tab if they have advances
                if (skill.advances > 0)
                {
                    skills.push(`${game.impmal.config.skills[skillKey]} ${skill.total}`);
                }
    
                for(let skillItem of skill.specialisations)
                {
                    if (skillItem.system.advances > 0)
                    {
                        skills.push(`${skillItem.system.skillNameAndTotal}`);
                    }
                }
            }
        
            let template = await foundry.applications.handlebars.renderTemplate(`systems/impmal/templates/embeds/${actor.type}.hbs`, actor.system.embedData(config))

            html = await foundry.applications.ux.TextEditor.enrichHTML(template, {relativeTo : actor, async: true, secrets : actor.isOwner});
        }
        else 
        {
            let image = actor.img;
            if (config.token)
            {
                image = actor.prototypeToken.texture.src;
            }
            html += `<div class="journal-image centered" ><img src="${image}" width="200" height="200"></div>`
            html += `<p style="text-align:center">@UUID[${actor.uuid}]{${config.label || actor.name}}</p>`
            if (config.description)
            {
                if (game.user.isGM)
                {
                    html += actor.system.notes.gm || ""
                }
                html += actor.system.notes.player || ""
            }
        }   


        let div = document.createElement("div");

        // Embed template already uses the provided style
        if (!config.table)
        {
            div.style = config.style;
        }
        
        div.innerHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {relativeTo : this.parent, async: true, secrets : this.parent.isOwner});

        return div;
    }

}