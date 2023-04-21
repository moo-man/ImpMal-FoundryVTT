import { ItemManagementForm } from "../../apps/item-management";
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

    _getHeaderButtons() 
    {
        let buttons = super._getHeaderButtons();
        if (this.actor.isOwner) 
        {
            buttons = [
                {
                    label: game.i18n.localize("IMPMAL.ManageItems"),
                    class: "manage-items",
                    icon: "fa-solid fa-suitcase",
                    onclick: () => 
                    {
                        if (this.actor.items.size == 0)
                        {
                            ui.notifications.notify(game.i18n.localize("IMPMAL.NoItems"));
                        }
                        else 
                        {
                            new ItemManagementForm(this.actor).render(true);
                        }
                    }
                }
            ].concat(buttons);
        }
        return buttons;
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
    

    //#region Item Sections
    async _formatSkills(data)
    {
        let elements = [];
        let show = false;
        for (let skillKey in data.actor.system.skills)
        {
            let skill = data.actor.system.skills[skillKey];
            // Only include skills in the main tab if they have advances
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
        let template = 
        `
        <div data-id="@ID">
        <a class="@CLASSES"><strong>@NAME: </strong></a>
        @DESCRIPTION
        </div>
        `;

        for (let trait of items)
        {
            if (trait.system.attack.enabled && !trait.system.roll.enabled && !trait.system.test.enabled)
            {
                continue; // If a trait only specifies attack, only show in attacks
            }

            let classes = ["trait-name", "list-edit-rc"];
            let name = trait.name;
            let description = await TextEditor.enrichHTML(trait.system.notes.player, {async: true});

            if (trait.system.roll.enabled)
            {
                classes.push("trait-roll");
                name = `<i class="fa-regular fa-dice-d10"></i>` + name;
            }

            if (game.user.isGM)
            {
                description += await TextEditor.enrichHTML(trait.system.notes.gm, {async: true});
            }

            if (trait.system.test.enabled)
            {
                let testClass = trait.system.test.target == "self" ? "roll" : "target-test";
                let testName = trait.system.testLabel("test");

                // add crosshairs if not self target
                if (trait.system.test.target == "targets")
                {
                    testName = `<i class="fa-solid fa-crosshairs"></i>` + testName ;
                }
                description += `<button type="button" data-type="item" class="${testClass}">${testName} Test</button>`;
            }
            
            elements.push(template.replace("@ID", trait.id).replace("@CLASSES", classes.join(" ")).replace("@NAME", name).replace("@DESCRIPTION", description));
        }

        return {html: elements.join(""), show : elements.length > 0};
    }
        
    async _formatAttacks(data)
    {
        let config = game.impmal.config;
        let elements = [];
        let items = data.items.weapon.concat(data.items.trait.filter(t => t.system.attack.enabled));

        let template = 
        `
        <div data-id="@ID">
            <a class="roll list-edit-rc" data-type="@TYPE" data-action="@ACTION"><strong>@NAME: </strong></a>
            <span>@TESTLABEL @SKILLTOTAL</span>
            </span>, </span>
            <span class="damage">@DAMAGE</span>
            <span class="range">@RANGE</span>
            <span class="attack-traits">@TRAITS</span>
        </div>
        `;


        items.forEach(item => 
        {
            let type = item.type;
            let action = type == "trait" ? "attack" : "";
            let id = item.id;
            let name = item.name;
            let testLabel, skillTotal, damage, range, traits;


            // testLabel
            if (type == "trait")
            {
                testLabel = item.system.testLabel("attack");
            }
            else if (type == "weapon")
            {
                testLabel = `${config.weaponTypes[item.system.attackType]} (${item.system.specialisation})`;
            }


            // skillTotal
            if (type == "trait")
            {
                skillTotal = item.system.attack.target;
            }
            else if (type == "weapon")
            {
                skillTotal = item.system.skillTotal;
            }


            // damage
            if (type == "trait")
            {
                damage = `${item.system.attack.damage.value}`;
                if (item.system.attack.damage.SL)
                {
                    damage += ` + SL ${item.system.attack.type == "melee" ? "difference" : ""}`;
                }
                damage += " Damage.";
            }
            else if (type == "weapon")
            {
                damage = `${item.system.damage.value} + SL ${item.system.attackType == "melee" ? "difference" : ""} Damage.`;
            }

            // range
            if (type == "trait")
            {
                range = `${item.system.attack.type == "ranged" ? config.ranges[item.system.attack.range] + " Range" : ""}`;
            }
            else if (type == "weapon")
            {
                range = `${item.system.attackType == "ranged" ? config.ranges[item.system.range] + " Range" : ""}`;
            }

            // traits 

            if (type == "trait")
            {
                traits = item.system.attack.traits.displayArray.map(i => `<a class="item-trait">${i}</a>`).join(", ");
            }
            else if (type == "weapon")
            {
                traits = item.system.traits.displayArray.map(i => `<a class="item-trait">${i}</a>`).join(", ");
            }

            elements.push(
                template
                    .replace("@TYPE", type)
                    .replace("@ACTION", action)
                    .replace("@ID", id)
                    .replace("@NAME", name)
                    .replace("@TESTLABEL", testLabel)
                    .replace("@SKILLTOTAL", skillTotal)
                    .replace("@DAMAGE", damage)
                    .replace("@RANGE", range)
                    .replace("@TRAITS", traits)
            );
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

    //#endregion


    editMode() 
    {
        this.element.find(`[data-id]`).each((index, element) => 
        {
            $(element).prepend($(`<a class="list-delete"><i class="fa-solid fa-xmark"></i></a>`));
        });
    }


    activateListeners(html) 
    {
        super.activateListeners(html);
        if (!this.isEditable)
        {
            return;
        }

        html.find(".characteristic").on("mouseover", (ev) => 
        {
            $(ev.currentTarget).find(".die-icon")[0].style.visibility = "visible";
        });

        html.find(".characteristic").on("mouseleave", (ev) => 
        {
            $(ev.currentTarget).find(".die-icon")[0].style.visibility = "hidden";
        });
    }


}