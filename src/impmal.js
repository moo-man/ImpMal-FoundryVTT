import { ImpMalActor } from "./document/actor";
import { ImpMalItem } from "./document/item";
import { CharacterModel } from "./model/actor/character";
import { NPCModel } from "./model/actor/npc";
import { PatronModel } from "./model/actor/patron";
import { AmmoModel } from "./model/item/ammo";
import { AugmeticModel } from "./model/item/augmetic";
import { BoonLiabilityModel } from "./model/item/boonLiability";
import { DutyModel } from "./model/item/duty";
import { EquipmentModel } from "./model/item/equipment";
import { FactionModel } from "./model/item/faction";
import { ModificationModel } from "./model/item/modification";
import { OriginModel } from "./model/item/origin";
import { PowerModel } from "./model/item/power";
import { ProtectionModel } from "./model/item/protection";
import { RoleModel } from "./model/item/role";
import { ForceFieldModel } from "./model/item/forceField";
import { SpecialisationModel } from "./model/item/specialisation";
import { TalentModel } from "./model/item/talent";
import { WeaponModel } from "./model/item/weapon";
import {IMPMAL, IM_CONFIG} from "./system/config";
import registerHandlebars from "./system/handlebars";
import registerSettings from "./system/settings";
import ImpMalCharacterSheet from "./sheet/actors/character-sheet";
import ImpMalItemSheet from "./sheet/items/item-sheet";
import log  from "./system/logger";
import ProtectionItemSheet from "./sheet/items/item-protection-sheet";
import registerHooks from "./system/hooks";
import { CharacteristicTest } from "./system/tests/characteristic/characteristic-test";
import { SkillTest } from "./system/tests/skill/skill-test";
import { WeaponTest } from "./system/tests/weapon/weapon-test";
import { PowerTest } from "./system/tests/power/power-test";
import { TraitTest } from "./system/tests/trait/trait-test";
import SuperiorityManager from "./system/superiority";
import { ImpMalEffect } from "./document/effect";
import ImpMalPatronSheet from "./sheet/actors/patron-sheet";
import ImpMalNPCSheet from "./sheet/actors/npc-sheet";
import { CorruptionModel } from "./model/item/corruption";
import { InjuryModel } from "./model/item/injury";
import { CriticalModel } from "./model/item/critical";
import { TraitModel } from "./model/item/trait";
import TraitItemSheet from "./sheet/items/item-trait-sheet";
import WeaponItemSheet from "./sheet/items/item-weapon-sheet";
import ModificationItemSheet from "./sheet/items/item-modification-sheet";
import ImpMalUtility from "./system/utility";
import { ChoiceConfig } from "./apps/choice-config";
import BackgroundItemSheet from "./sheet/items/item-background-sheet";
import OriginItemSheet from "./sheet/items/item-origin-sheet";
import RoleItemSheet from "./sheet/items/item-role-sheet";
import FoundryOverrides from "./system/overrides";
import AmmoItemSheet from "./sheet/items/item-ammo-sheet";

Hooks.once("init", () => 
{

    // #if _ENV == "development"
    CONFIG.debug.impmal = true;
    // #endif

    CONFIG.Actor.documentClass = ImpMalActor;
    CONFIG.Item.documentClass = ImpMalItem;
    CONFIG.ActiveEffect.documentClass = ImpMalEffect;

    Actors.registerSheet("impmal", ImpMalCharacterSheet, { types: ["character"], makeDefault: true });
    Actors.registerSheet("impmal", ImpMalPatronSheet, { types: ["patron"], makeDefault: true });
    Actors.registerSheet("impmal", ImpMalNPCSheet, { types: ["npc"], makeDefault: true });
    Items.registerSheet("impmal", ImpMalItemSheet, { makeDefault: true });
    Items.registerSheet("impmal", ProtectionItemSheet, { types: ["protection"], makeDefault: true });
    Items.registerSheet("impmal", TraitItemSheet, { types: ["trait"], makeDefault: true });
    Items.registerSheet("impmal", WeaponItemSheet, { types: ["weapon"], makeDefault: true });
    Items.registerSheet("impmal", ModificationItemSheet, { types: ["modification"], makeDefault: true });
    Items.registerSheet("impmal", BackgroundItemSheet, { types: ["faction", "duty"], makeDefault: true });
    Items.registerSheet("impmal", OriginItemSheet, { types: ["origin"], makeDefault: true });
    Items.registerSheet("impmal", RoleItemSheet, { types: ["role"], makeDefault: true });
    Items.registerSheet("impmal", AmmoItemSheet, { types: ["ammo"], makeDefault: true });

    // CONFIG.ActiveEffect.sheetClass = undefined;
    // DocumentSheetConfig.registerSheet(JournalEntryPage, "impmal", Level4TextPageSheet, { makeDefault: true, label: "Imperium Maledictum Journal Sheet" });

    CONFIG.Actor.systemDataModels["character"] = CharacterModel;
    CONFIG.Actor.systemDataModels["patron"] = PatronModel;
    CONFIG.Actor.systemDataModels["npc"] = NPCModel;

    CONFIG.Item.systemDataModels["boonLiability"] = BoonLiabilityModel;
    CONFIG.Item.systemDataModels["origin"] = OriginModel;
    CONFIG.Item.systemDataModels["faction"] = FactionModel;
    CONFIG.Item.systemDataModels["role"] = RoleModel;
    CONFIG.Item.systemDataModels["talent"] = TalentModel;
    CONFIG.Item.systemDataModels["duty"] = DutyModel;
    CONFIG.Item.systemDataModels["specialisation"] = SpecialisationModel;
    CONFIG.Item.systemDataModels["weapon"] = WeaponModel;
    CONFIG.Item.systemDataModels["ammo"] = AmmoModel;
    CONFIG.Item.systemDataModels["modification"] = ModificationModel;
    CONFIG.Item.systemDataModels["protection"] = ProtectionModel;
    CONFIG.Item.systemDataModels["forceField"] = ForceFieldModel;
    CONFIG.Item.systemDataModels["equipment"] = EquipmentModel;
    CONFIG.Item.systemDataModels["augmetic"] = AugmeticModel;
    CONFIG.Item.systemDataModels["power"] = PowerModel;
    CONFIG.Item.systemDataModels["corruption"] = CorruptionModel;
    CONFIG.Item.systemDataModels["injury"] = InjuryModel;
    CONFIG.Item.systemDataModels["critical"] = CriticalModel;
    CONFIG.Item.systemDataModels["trait"] = TraitModel;

    game.impmal = {
        config : IMPMAL,
        log : log,
        utility : ImpMalUtility,
        testClasses : {
            CharacteristicTest,
            SkillTest,
            WeaponTest,
            PowerTest,
            TraitTest
        },
        apps : {
            ChoiceConfig
        }
    };

    registerSettings();
    game.impmal.superiority = new SuperiorityManager();
    registerHandlebars();
    
    mergeObject(CONFIG, IM_CONFIG);

});

FoundryOverrides();
registerHooks();