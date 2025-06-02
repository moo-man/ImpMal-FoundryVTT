import "../style/impmal.scss";
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
import registerHooks from "./system/hooks";
import { CharacteristicTest } from "./system/tests/characteristic/characteristic-test";
import { SkillTest } from "./system/tests/skill/skill-test";
import { WeaponTest } from "./system/tests/weapon/weapon-test";
import { PowerTest } from "./system/tests/power/power-test";
import { TraitTest } from "./system/tests/trait/trait-test";
import { ImpMalEffect } from "./document/effect";
import { CorruptionModel } from "./model/item/corruption";
import { InjuryModel } from "./model/item/injury";
import { CriticalModel } from "./model/item/critical";
import { TraitModel } from "./model/item/trait";
import ImpMalUtility from "./system/utility";
import FoundryOverrides from "./system/overrides";
import debug from "./system/debug";
import ImpmalActiveEffectConfig from "./apps/effect-config";
import { VehicleModel } from "./model/actor/vehicle";
import TagManager from "./system/tag-manager";
import { ItemUse } from "./system/tests/item/item-use";
import { ImpMalChatMessage } from "./system/chat-message";
import { AvailabilityTest } from "./system/tests/availability/availability-test";
import ImpMalTables from "./system/tables";
import loadScripts from "../loadScripts.js";
import tokenHelpers from "./system/token-helpers.js";
import { ImpMalActiveEffectModel } from "./model/effect/effect.js";
import Migration from "./system/migration.js";
import { ImpMalTestMessageModel } from "./model/message/test.js";
import ZoneConfig from "./apps/zone-config.js";
import { RewardMessageModel } from "./model/message/reward.js";
import { PostedItemMessageModel } from "./model/message/item.js";
import ResourceManager from "./system/resources.js";
import { CorruptionMessageModel } from "./model/message/corruption.js";
import { OpposedTestMessageModel } from "./model/message/opposed.js";
import CharacterSheet from "./sheet/actors/character.js";
import PatronSheet from "./sheet/actors/patron.js";
import NPCSheet from "./sheet/actors/npc.js";
import VehicleSheet from "./sheet/actors/vehicle.js";
import AugmeticSheet from "./sheet/items/types/augmetic.js";
import AmmoSheet from "./sheet/items/types/ammo.js";
import BoonLiabilitySheet from "./sheet/items/types/boonLiability.js";
import CorruptionSheet from "./sheet/items/types/corruption.js";
import EquipmentSheet from "./sheet/items/types/equipment.js";
import ForceFieldSheet from "./sheet/items/types/forceField.js";
import ModificationSheet from "./sheet/items/types/modification.js";
import PowerSheet from "./sheet/items/types/power.js";
import ProtectionSheet from "./sheet/items/types/protection.js";
import SpecialisationSheet from "./sheet/items/types/specialisation.js";
import TalentSheet from "./sheet/items/types/talent.js";
import WeaponSheet from "./sheet/items/types/weapon.js";
import DutySheet from "./sheet/items/types/duty.js";
import FactionSheet from "./sheet/items/types/faction.js";
import OriginSheet from "./sheet/items/types/origin.js";
import RoleSheet from "./sheet/items/types/role.js";
import TraitSheet from "./sheet/items/types/trait.js";
import CriticalSheet from "./sheet/items/types/critical.js";
import InjurySheet from "./sheet/items/types/injury.js";

Hooks.once("init", () => 
{

    //shorten names
    const DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig

    // #if _ENV == "development"
    CONFIG.debug.impmal = true;
    debug();
    // #endif
    
    CONFIG.Actor.documentClass = ImpMalActor;
    CONFIG.Item.documentClass = ImpMalItem;
    CONFIG.ActiveEffect.documentClass = ImpMalEffect;
    CONFIG.ChatMessage.documentClass = ImpMalChatMessage;

    DocumentSheetConfig.registerSheet(Actor, "impmal", CharacterSheet, { types: ["character"], makeDefault: true, label : "Character Sheet" });
    DocumentSheetConfig.registerSheet(Actor, "impmal", PatronSheet, { types: ["patron"], makeDefault: true, label : "Patron Sheet" });
    DocumentSheetConfig.registerSheet(Actor, "impmal", NPCSheet, { types: ["npc"], makeDefault: true, label : "NPC Sheet" });
    DocumentSheetConfig.registerSheet(Actor, "impmal", VehicleSheet, { types: ["vehicle"], makeDefault: true, label : "Vehicle Sheet" });
    
    DocumentSheetConfig.registerSheet(Item, "impmal", AmmoSheet, { types: ["ammo"], makeDefault: true, label : "Ammo Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", AugmeticSheet, { types: ["augmetic"], makeDefault: true, label : "Augmetic Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", BoonLiabilitySheet, { types: ["boonLiability"], makeDefault: true, label : "Boon / Liability Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", CorruptionSheet, { types: ["corruption"], makeDefault: true, label : "Corruption Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", EquipmentSheet, { types: ["equipment"], makeDefault: true, label : "Equipment Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", ForceFieldSheet, { types: ["forceField"], makeDefault: true, label : "Force Field Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", ModificationSheet, { types: ["modification"], makeDefault: true, label : "Force Field Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", PowerSheet, { types: ["power"], makeDefault: true, label : "Power Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", ProtectionSheet, { types: ["protection"], makeDefault: true, label : "Protection Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", SpecialisationSheet, { types: ["specialisation"], makeDefault: true, label : "Specialisation Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", TalentSheet, { types: ["talent"], makeDefault: true, label : "Talent Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", WeaponSheet, { types: ["weapon"], makeDefault: true, label : "Weapon Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", DutySheet, { types: ["duty"], makeDefault: true, label : "Duty Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", FactionSheet, { types: ["faction"], makeDefault: true, label : "Faction Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", OriginSheet, { types: ["origin"], makeDefault: true, label : "Origin Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", RoleSheet, { types: ["role"], makeDefault: true, label : "Role Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", TraitSheet, { types: ["trait"], makeDefault: true, label : "Trait Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", CriticalSheet, { types: ["critical"], makeDefault: true, label : "Critical Sheet" });
    DocumentSheetConfig.registerSheet(Item, "impmal", InjurySheet, { types: ["injury"], makeDefault: true, label : "Injury Sheet" });
    DocumentSheetConfig.registerSheet(ActiveEffect, "impmal", ImpmalActiveEffectConfig, {makeDefault : true});

    // CONFIG.ActiveEffect.sheetClass = undefined;
    // DocumentSheetConfig.registerSheet(JournalEntryPage, "impmal", Level4TextPageSheet, { makeDefault: true, label: "Imperium Maledictum Journal Sheet" });

    CONFIG.Actor.dataModels["character"] = CharacterModel;
    CONFIG.Actor.dataModels["patron"] = PatronModel;
    CONFIG.Actor.dataModels["npc"] = NPCModel;
    CONFIG.Actor.dataModels["vehicle"] = VehicleModel;

    CONFIG.Item.dataModels["boonLiability"] = BoonLiabilityModel;
    CONFIG.Item.dataModels["origin"] = OriginModel;
    CONFIG.Item.dataModels["faction"] = FactionModel;
    CONFIG.Item.dataModels["role"] = RoleModel;
    CONFIG.Item.dataModels["talent"] = TalentModel;
    CONFIG.Item.dataModels["duty"] = DutyModel;
    CONFIG.Item.dataModels["specialisation"] = SpecialisationModel;
    CONFIG.Item.dataModels["weapon"] = WeaponModel;
    CONFIG.Item.dataModels["ammo"] = AmmoModel;
    CONFIG.Item.dataModels["modification"] = ModificationModel;
    CONFIG.Item.dataModels["protection"] = ProtectionModel;
    CONFIG.Item.dataModels["forceField"] = ForceFieldModel;
    CONFIG.Item.dataModels["equipment"] = EquipmentModel;
    CONFIG.Item.dataModels["augmetic"] = AugmeticModel;
    CONFIG.Item.dataModels["power"] = PowerModel;
    CONFIG.Item.dataModels["corruption"] = CorruptionModel;
    CONFIG.Item.dataModels["injury"] = InjuryModel;
    CONFIG.Item.dataModels["critical"] = CriticalModel;
    CONFIG.Item.dataModels["trait"] = TraitModel;

    CONFIG.ActiveEffect.dataModels["base"] = ImpMalActiveEffectModel
    CONFIG.ChatMessage.dataModels["test"] = ImpMalTestMessageModel;
    CONFIG.ChatMessage.dataModels["opposed"] = OpposedTestMessageModel;
    CONFIG.ChatMessage.dataModels["reward"] = RewardMessageModel;
    CONFIG.ChatMessage.dataModels["item"] = PostedItemMessageModel;
    CONFIG.ChatMessage.dataModels["corruption"] = CorruptionMessageModel;

    game.impmal = {
        config : IMPMAL,
        utility : ImpMalUtility,
        tags : new TagManager(),
        tables : ImpMalTables,
        migration : Migration,
        testClasses : {
            CharacteristicTest,
            SkillTest,
            WeaponTest,
            PowerTest,
            TraitTest,
            ItemUse,
            AvailabilityTest
        },
    };

    registerSettings();
    game.impmal.resources = new ResourceManager();
    registerHandlebars();

    game.impmal.resources.registerResource("IMPMAL.Superiority", "impmal", "superiority");
    
    foundry.utils.mergeObject(CONFIG, IM_CONFIG);

});

FoundryOverrides();
registerHooks();
loadScripts();
tokenHelpers()
ZoneConfig.addRegionControls();