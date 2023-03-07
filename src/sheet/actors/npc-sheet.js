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
            if (trait.system.attack.enabled && !trait.system.roll.enabled && !trait.system.test.enabled)
            {
                continue; // If a trait only specifies attack, only show in attacks
            }
            elements.push(`
                <div>
                <a class="trait-name list-edit-rc" data-id="${trait.id}"><strong>${trait.name}: </strong></a>
                ${await TextEditor.enrichHTML(trait.system.notes.player, {async: true})}
                ${game.user.isGM ? await TextEditor.enrichHTML(trait.system.notes.gm, {async: true}) : ""}
                </div>
                `);
        }

        return {html: elements.join(""), show : elements.length > 0};
    }
        
    async _formatAttacks(data)
    {
        let config = game.impmal.config;
        let elements = [];

        data.items.weapon.forEach(weapon => 
        {
            elements.push(`
                <div>
                    <a class="roll list-edit-rc" data-type="weapon" data-id="${weapon.id}"><strong>${weapon.name}: </strong></a>
                    <span class="roll" data-action="weapon">${config.weaponTypes[weapon.system.attackType]} (${weapon.system.specialisation}) ${weapon.system.skillTotal}</span>
                    </span>, </span>
                    <span class="damage">${weapon.system.damage.value} + SL ${weapon.system.attackType == "melee" ? "difference" : ""} Damage. </span>
                    
                    <span class="range">${weapon.system.attackType == "ranged" ? config.ranges[weapon.system.range] + " Range" : ""}</span>
                    <span class="attack-traits">${weapon.system.traits.displayArray.map(i => `<a class="item-trait">${i}</a>`).join(", ")}
                </div>
            `);
        });

        
        data.items.trait.forEach(trait => 
        {
            let skill = config.weaponTypes[trait.system.attack.type];
            if (trait.system.attack.skill.key != "melee" && trait.system.attack.skill.key != "ranged")
            {
                skill = config.skills[trait.system.attack.skill.key];
            }

            if (trait.system.attack.skill.specialisation)
            {
                skill += ` (${trait.system.attack.skill.specialisation})`;
            }
            
            let damage = `${trait.system.attack.damage.value}`;
            if (trait.system.attack.damage.SL)
            {
                damage += ` + SL ${trait.system.attack.type == "melee" ? "difference" : ""} Damage.`;
            }

            elements.push(`
                    <div>
                        <a class="trait-action list-edit-rc" data-action="attack" data-id="${trait.id}"><strong>${trait.name}: </strong></a>
                        <span>${skill} ${trait.system.attack.target}</span>
                        </span>, </span>
                        <span class="damage">${damage}</span>
                        <span class="range">${trait.system.attack.type == "ranged" ? config.ranges[trait.system.attack.range] + " Range" : ""}</span>
                        <span class="attack-traits">${trait.system.attack.traits.displayArray.map(i => `<a class="item-trait">${i}</a>`).join(", ")}
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