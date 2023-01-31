import ImpMalActorSheet from "./actor-sheet";

export default class ImpMalNPCSheet extends ImpMalActorSheet
{

    static get defaultOptions() 
    {
        const options = super.defaultOptions;
        options.classes = options.classes.concat("npc");
        options.height = 600;
        options.width = 530;
        return options;
    }

    async getData() 
    {
        let data = await super.getData();
        data.sections = await this._formatSections(data);
        return data;
    }

    async _formatSections(data)
    {
        let sections = {};
        sections.skills = await this._formatSkills(data);
        sections.attacks = await this._formatAttacks(data);
        sections.possessions = await this._formatPossessions(data);
        sections.traits = await this._formatTraits(data);
        return sections;
    }
    
    async _formatSkills(data)
    {
        let elements = [];
        let show = false;
        for (let skillKey in data.actor.system.skills)
        {
            let skill = data.actor.system.skills[skillKey];
            if (skill.advances > 0)
            {
                elements.push(`<a class="roll" data-type="skill" data-key=${skillKey}>${game.impmal.config.skills[skillKey]} ${skill.total}</a>`);
                show = true;
            }

            for(let skillItem of skill.specialisations)
            {
                if (skillItem.system.advances > 0)
                {
                    elements.push(`<a class="roll list-edit-rc" data-id="${skillItem.id}" data-type="skill" data-item-id="${skillItem.id}">${skillItem.system.skillNameAndTotal}</a>`);
                    show = true;
                }
            }
        }

        return {show, html : `<strong>${game.i18n.localize("IMPMAL.Skills")}:</strong> ${elements.join("<span>, </span>")}`};
    }

    async _formatTraits(data)
    {
        let elements = [];
        let items = data.items.trait.concat(data.items.corruption, data.items.talent);
        for (let trait of items)
        {
            elements.push(`
                <div>
                    <a class="trait-name list-edit-rc" data-id="${trait.id}"><strong>${trait.name}: </strong></a>
                    ${await TextEditor.enrichHTML(trait.system.notes.player, {async: true})}
                    ${game.user.isGM ? await TextEditor.enrichHTML(trait.system.notes.gm, {async: true}) : ""}
                </div>
            `);
        }

        return {html: elements.join(""), show : items.length > 0};
    }
        
    async _formatAttacks(data)
    {
        let config = game.impmal.config;
        let elements = [];

        data.items.weapon.forEach(weapon => 
        {
            elements.push(`
                <div>
                    <a class="roll list-edit-rc" data-type="weapon" data-id="${weapon.id}" data-item-id="${weapon.id}"><strong>${weapon.name}: </strong></a>
                    <span class="skill">${config.weaponTypes[weapon.system.attackType]} (${weapon.system.specialisation}) ${weapon.system.skillTotal}</span>
                    </span>, </span>
                    <span class="damage">${weapon.system.damage.value} + SL ${weapon.system.attackType == "melee" ? "difference" : ""} Damage. </span>
                    
                    <span class="range">${weapon.system.attackType == "ranged" ? config.ranges[weapon.system.range] + " Range" : ""}</span>
                    <span class="attack-traits">${weapon.system.traits.displayArray.map(i => `<a class="item-trait">${i}</a>`).join(", ")}
                </div>
            `);
        });

        return {html: elements.join(""), show : data.items.weapon.length > 0};
    }

    async _formatPossessions(data)
    {
        let elements = [];

        let physicalTypes = Object.keys(game.template.Item).filter(i => game.template.Item[i].templates?.includes("physical"));
        let show = false;
        data.actor.items.filter(i => physicalTypes.includes(i.type)).forEach(i => 
        {
            elements.push(`
                    <a class="list-edit-rc" data-id="${i.id}">${i.name}</a>
            `);
            show = true;
        });

        return {html: `<strong>${game.i18n.localize("IMPMAL.Possessions")}: </strong> ${elements.join(", ")}`, show};
    }



}