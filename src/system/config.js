import ImpMalUtility from "./utility";

const IMPMAL = {
    characteristics : {
        ws : "IMPMAL.WeaponSkill",
        bs : "IMPMAL.BallisticSkill",
        str : "IMPMAL.Strength",
        tgh : "IMPMAL.Toughness",
        ag : "IMPMAL.Agility",
        int : "IMPMAL.Intelligence",
        per : "IMPMAL.Perception",
        wil : "IMPMAL.Willpower",
        fel : "IMPMAL.Fellowship"
    },

    characteristicAbbrev : {
        ws : "IMPMAL.WS",
        bs : "IMPMAL.BS",
        str : "IMPMAL.Str",
        tgh : "IMPMAL.Tgh",
        ag : "IMPMAL.Ag",
        int : "IMPMAL.Int",
        per : "IMPMAL.Per",
        wil : "IMPMAL.Wil",
        fel : "IMPMAL.Fel"
    },

    skills : {
        athletics : "IMPMAL.Athletics",
        awareness : "IMPMAL.Awareness",
        dexterity : "IMPMAL.Dexterity",
        discipline : "IMPMAL.Discipline",
        fortitude : "IMPMAL.Fortitude",
        intuition : "IMPMAL.Intuition",
        linguistics : "IMPMAL.Linguistics",
        logic : "IMPMAL.Logic",
        lore : "IMPMAL.Lore",
        medicae : "IMPMAL.Medicae",
        melee : "IMPMAL.Melee",
        navigation : "IMPMAL.Navigation",
        presence : "IMPMAL.Presence",
        piloting : "IMPMAL.Piloting",
        psychic : "IMPMAL.PsychicMastery",
        ranged : "IMPMAL.Ranged",
        rapport : "IMPMAL.Rapport",
        reflexes : "IMPMAL.Reflexes",
        stealth : "IMPMAL.Stealth",
        tech : "IMPMAL.Tech"
    },

    defaultSkillCharacteristics : {
        athletics : "str",
        awareness : "per",
        dexterity : "ag",
        discipline : "wil",
        fortitude : "tgh",
        intuition : "per",
        linguistics : "int",
        logic : "int",
        lore : "int",
        medicae : "int",
        melee : "ws",
        navigation : "int",
        piloting : "ag",
        presence : "wil",
        psychic : "wil",
        ranged : "bs",
        rapport : "fel",
        reflexes : "ag",
        stealth : "ag",
        tech : "int"
    },

    attitudes : {
        "5" : "IMPMAL.Honoured",
        "4" : "IMPMAL.Prized",
        "3" : "IMPMAL.Trusted",
        "2" : "IMPMAL.Liked",
        "1" : "IMPMAL.Welcomed",
        "0" : "IMPMAL.Neutral",
        "-1" : "IMPMAL.Unwelcome",
        "-2" : "IMPMAL.Distrusted",
        "-3" : "IMPMAL.Despised",
        "-4" : "IMPMAL.Vilified",
        "-5" : "IMPMAL.Hunted",
    },

    attitudeTexts : {},

    sizes : {
        tiny : "IMPMAL.Tiny",
        small : "IMPMAL.Small",
        medium : "IMPMAL.Medium",
        large : "IMPMAL.Large",
        enormous : "IMPMAL.Enormous",
        monstrous : "IMPMAL.Monstrous"
    },


    speeds : {
        slow : "IMPMAL.Slow",
        normal : "IMPMAL.Normal",
        fast : "IMPMAL.Fast",
    },

    npcRoles : {
        troop : "IMPMAL.Troop",
        elite : "IMPMAL.Elite",
        leader : "IMPMAL.Leader"
    },


    hitLocations : {
        head : "IMPMAL.Head",
        leftArm : "IMPMAL.LeftArm",
        rightArm : "IMPMAL.RightArm",
        leftLeg : "IMPMAL.LeftLeg",
        rightLeg : "IMPMAL.RightLeg",
        body : "IMPMAL.Body"
    },

    generalizedHitLocations : {
        head : "head",
        leftArm : "arm",
        rightArm : "arm",
        leftLeg : "leg",
        rightLeg : "leg",
        body : "body"
    },

    availability : {
        "" : "-",
        common : "IMPMAL.Common",
        scarce : "IMPMAL.Scarce",
        rare : "IMPMAL.Rare",
        exotic : "IMPMAL.Exotic",
    },

    worlds : {
        feral : "IMPMAL.WorldFeral",
        feudal : "IMPMAL.WorldFeudal",
        agri : "IMPMAL.WorldAgri",
        shrine : "IMPMAL.WorldShrine",
        hive : "IMPMAL.WorldHive",
        forge : "IMPMAL.WorldForge"
    },

    worldAvailability : {
        feral : {
            common : 100,
            scarce : 15,
            rare : 0,
            exotic : 0
        },
        feudal : {
            common : 100,
            scarce : 30,
            rare : 5,
            exotic : 0
        },
        agri : {
            common : 100,
            scarce : 45,
            rare : 15,
            exotic : 0
        },
        shrine : {
            common : 100,
            scarce : 60, 
            rare : 25,
            exotic : 0
        },
        hive : {
            common : 100,
            scarce : 75,
            rare : 35,
            exotic : 0
        },
        forge : {
            common : 100,
            scarce : 90,
            rare : 45,
            exotic : 0
        },
    },

    ranges : {
        short : "IMPMAL.Short",
        medium : "IMPMAL.Medium",
        long : "IMPMAL.Long",
        extreme : "IMPMAL.Extreme",
    },

    weaponTypes : {
        melee : "IMPMAL.Melee",
        ranged : "IMPMAL.Ranged"
    },

    meleeTypes : {
        mundane : "IMPMAL.Mundane",
        chain : "IMPMAL.Chain",
        force : "IMPMAL.Force",
        shock : "IMPMAL.Shock",
        power : "IMPMAL.Power",
    },

    meleeSpecs : {
        oneHanded : "IMPMAL.OneHanded",
        twoHanded : "IMPMAL.TwoHanded",
        brawling : "IMPMAL.Brawling",
    },

    rangedTypes : {
        bolt : "IMPMAL.Bolt",
        flame : "IMPMAL.Flame",
        las : "IMPMAL.Las",
        launcher : "IMPMAL.Launcher",
        melta : "IMPMAL.Melta",
        plasma : "IMPMAL.Plasma",
        solid : "IMPMAL.Solid",
        specialised : "IMPMAL.Specialised",
        grenadesExplosives : "IMPMAL.GrenadesExplosives",
    },

    rangedSpecs : {
        pistol : "IMPMAL.Pistol",
        longGun : "IMPMAL.LongGun",
        ordnance : "IMPMAL.Ordnance",
        thrown : "IMPMAL.Thrown",
        engineering : "IMPMAL.Engineering",
    },

    paymentGrade : {
        poor : "IMPMAL.Poor",
        standard : "IMPMAL.Standard",
        good : "IMPMAL.Good",
        excellent : "IMPMAL.Excellent"
    },

    paymentAmount : {
        poor : 50,
        standard : 100,
        good : 200,
        excellent : 600
    },

    difficulties : {
        veryEasy : {
            modifier : 60,
            name : "IMPMAL.VeryEasy"
        },
        easy : {
            modifier : 40,
            name : "IMPMAL.Easy"
        },
        routine : {
            modifier : 20,
            name : "IMPMAL.Routine"
        },
        challenging : {
            modifier : 0,
            name : "IMPMAL.Challenging"
        },
        difficult : {
            modifier : -10,
            name : "IMPMAL.Difficult"
        },
        hard: {
            modifier : -20,
            name : "IMPMAL.Hard"
        },
        veryHard : {
            modifier : -30,
            name : "IMPMAL.VeryHard"
        }
    },

    weaponArmourTraits : {
        blast : "IMPMAL.Blast",
        burst : "IMPMAL.Burst",
        close : "IMPMAL.Close",
        defensive : "IMPMAL.Defensive",
        flamer : "IMPMAL.Flamer",
        heavy : "IMPMAL.Heavy",
        ineffective : "IMPMAL.Ineffective",
        inflict : "IMPMAL.Inflict",
        loud : "IMPMAL.Loud",
        penetrating : "IMPMAL.Penetrating",
        rapidFire: "IMPMAL.RapidFire",
        reach : "IMPMAL.Reach",
        reliable : "IMPMAL.Reliable",
        rend : "IMPMAL.Rend",
        shield : "IMPMAL.Shield",
        spread : "IMPMAL.Spread",
        subtle : "IMPMAL.Subtle",
        supercharge : "IMPMAL.Supercharge",
        thrown : "IMPMAL.Thrown",
        twohanded : "IMPMAL.TwoHanded",
        unstable : "IMPMAL.Unstable"
    },

    itemTraits : {
        bulky : "IMPMAL.Bulky",
        shoddy : "IMPMAL.Shoddy",
        ugly : "IMPMAL.Ugly",
        unreliable : "IMPMAL.Unreliable",
        lightweight : "IMPMAL.Lightweight",
        mastercrafted : "IMPMAL.Mastercrafted",
        ornamental : "IMPMAL.Ornamental",
        durable : "IMPMAL.Durable"
    },

    traitDescriptions : {

    },

    traitHasValue : {
        heavy : true,
        inflict : true,
        penetrating : true,
        rapidFire : true,
        rend : true,
        shield : true,
        supercharge : true,
        thrown : true,
    },

    protectionTypes : {
        mundane : "IMPMAL.Mundane",
        flak : "IMPMAL.Flak",
        mesh : "IMPMAL.Mesh",
        carapace : "IMPMAL.Carapace",
        power : "IMPMAL.Power",
        shield : "IMPMAL.Shield"
    },

    modificationTypes : {
        combat : "IMPMAL.CombatAttachment",
        sight : "IMPMAL.SightAttachment", 
        support : "IMPMAL.SupportAttachment"
    },

    disciplines : {
        minor : "IMPMAL.Minor",
        biomancy : "IMPMAL.Biomancy",
        divination : "IMPMAL.Divination",
        pyromancy : "IMPMAL.Pyromancy",
        telekinesis : "IMPMAL.Telekinesis",
        telepathy : "IMPMAL.Telepathy"
    },

    powerRanges : {
        special : "IMPMAL.Special",
        self : "IMPMAL.Self",
        immediate : "IMPMAL.Immediate",
        short : "IMPMAL.Short",
        medium : "IMPMAL.Medium",
        long : "IMPMAL.Long"
    },

    powerDurations : {
        instant : "IMPMAL.Instant",
        sustained : "IMPMAL.Sustained",
        special : "IMPMAL.Special",
        permanent : "IMPMAL.Permanent"
    },

    corruptionType : {
        mutation : "IMPMAL.Mutation",
        malignancy : "IMPMAL.Malignancy"
    },

    corruptionValues : {
        minor : 1,
        moderate : 2,
        major : 4
    },

    corruptionLabel : {
        minor : "IMPMAL.Minor",
        moderate : "IMPMAL.Moderate",
        major : "IMPMAL.Major"
    },

    coverTypes : {
        "" : "",
        lightCover : "IMPMAL.LightCover",
        mediumCover : "IMPMAL.MediumCover",
        heavyCover : "IMPMAL.HeavyCover"
    },

    obscuredTypes : {
        "" : "",
        lightlyObscured : "IMPMAL.LightlyObscured",
        heavilyObscured : "IMPMAL.HeavilyObscured"
    },

    hazardTypes : {
        "" : "",
        minorHazard:  "IMPMAL.MinorHazard",
        majorHazard:  "IMPMAL.MajorHazard",
        deadlyHazard:  "IMPMAL.DeadlyHazard"
    },

    lightTypes : {
        "" : "",
        poorlyLit : "IMPMAL.PoorlyLit",
        dark : "IMPMAL.Dark"
    },

    age: {},
    factions: {},

    tieredCondition: {
        ablaze: true,
        bleeding: true,
        blinded: false,
        deafened: false,
        fatigued: true,
        frightened: true,
        incapacitated: false,
        overburdened: false,
        poisoned: true,
        prone: false,
        restrained: true,
        stunned: true,
        unconscious: false,
        dead: false
    },

  
    scriptTriggers : {
        manual : "IMPMAL.TriggerManual",
        immediate : "IMPMAL.TriggerImmediate",
        prepareBaseData : "IMPMAL.TriggerPrepareBaseData",
        prePrepareDerivedData : "IMPMAL.TriggerPrePrepareDerivedData",
        postPrepareDerivedData : "IMPMAL.TriggerPostPrepareDerivedData",

        prepareOwnedItemBaseData : "IMPMAL.TriggerPrepareOwnedItemBaseData",
        prePrepareOwnedItemDerivedData : "IMPMAL.TriggerPrePrepareOwnedItemDerivedData",
        postPrepareOwnedItemDerivedData : "IMPMAL.TriggerPostPrepareOwnedItemDerivedData",

        computeCharacteristics : "Compute Characteristics",
        computeEncumbrance : "Compute Encumbrance",
        computeCombat : "Compute Combat",
        computeWarpState : "Compute Warp State",
        prepareOwnedItems : "Prepare Owned Items",
        prepareOwnedData : "Prepare Owned Data",

        dialog : "IMPMAL.TriggerDialog",

        preRollTest : "IMPMAL.TriggerPreRollTest",
        preRollSkillTest : "IMPMAL.TriggerPreRollSkillTest",
        preRollWeaponTest : "IMPMAL.TriggerPreRollWeaponTest",
        preRollTraitTest : "IMPMAL.TriggerPreRollTraitTest",
        preRollPowerTest : "IMPMAL.TriggerPreRollPowerTest",

        rollTest : "IMPMAL.TriggerRollTest",
        rollSkillTest : "IMPMAL.TriggerRollSkillTest",
        rollWeaponTest : "IMPMAL.TriggerRollWeaponTest",
        rollTraitTest : "IMPMAL.TriggerRollTraitTest",
        rollPowerTest : "IMPMAL.TriggerRollPowerTest",

        // preAttackerEvaluateOpposed : "IMPMAL.TriggerPreAttackerEvaluateOpposed",
        // preAttackerComputeOpposedDamage : "IMPMAL.TriggerPreAttackerComputeOpposedDamage",
        // postAttackerEvaluateOpposed : "IMPMAL.TriggerAttackerEvaluateOpposed",

        // preDefenderEvaluateOpposed : "IMPMAL.TriggerPreDefenderEvaluateOpposed",
        // preDefenderComputeOpposedDamage : "IMPMAL.TriggerPreDefenderComputeOpposedDamage",
        // postDefenderEvaluateOpposed : "IMPMAL.TriggerDefenderEvaluateOpposed",

        preApplyDamage : "IMPMAL.TriggerPreApplyDamage",
        applyDamage : "IMPMAL.TriggerApplyDamage",
        preTakeDamage : "IMPMAL.TriggerPreTakeDamage",
        takeDamage : "IMPMAL.TriggerTakeDamage",

        createToken : "IMPMAL.TriggerCreateToken",
        createItem : "IMPMAL.TriggerCreateItem",
        preUpdateDocument : "IMPMAL.TriggerPreUpdateDocument",
        updateDocument : "IMPMAL.TriggerUpdateDocument",
        createCondition : "IMPMAL.TriggerCreateCondition",
        deleteEffect : "IMPMAL.TriggerDeleteEffect",

        startRound : "IMPMAL.TriggerStartRound",
        endRound : "IMPMAL.TriggerEndRound",
        startTurn : "IMPMAL.TriggerStartTurn",
        endTurn : "IMPMAL.TriggerEndTurn",
        updateCombat  : "IMPMAL.UpdateCombat"
    },

    asyncTriggers: { 
        "manual" : true,
        "immediate": true, 
        "preRollTest": true, 
        "preRollSkillTest": true, 
        "preRollWeaponTest": true, 
        "preRollTraitTest": true, 
        "preRollPowerTest": true, 
        "rollTest": true, 
        "rollSkillTest": true, 
        "rollWeaponTest": true, 
        "rollTraitTest": true, 
        "rollPowerTest": true, 
        "updateDocument": true, 
        "createCondition": true, 
        "deleteEffect": true, 
        "dialog": true,
        "createItem" : true,
        "preApplyDamage" : true,
        "preTakeDamage" : true,
        "applyDamage" : true,
        "takeDamage" : true,
        "createToken" : true
    },

    placeholderItemData : {
        type : "equipment",
        img : "modules/impmal-core/assets/icons/equipment/equipment.webp"
    },


    actions : {
        aim : {
            label : "IMPMAL.Aim",
            effect :         
            {
                name: "IMPMAL.Aim",
                statuses : ["aim"],
                icon: "icons/svg/aura.svg",
                flags: {
                    impmal: {
                        scriptData: [
                            {
                                label: "Range",
                                string: `if (args.type == "weapon" && args.system.isRanged) args.system.rangeModifier.value+= 0.5; //gross workaround for double preparation bug`,
                                trigger: "prePrepareOwnedItemDerivedData",
                            },
                            {
                                label : "No Target Location Penalty",
                                string : "args.disCount--;",
                                trigger : "dialog",
                                options : {
                                    dialog: {
                                        hideScript : "return !args.isAttack;",
                                        activateScript : "return args.fields.hitLocation != \"roll\""
                                    }
                                }
                            },
                            {
                                label : "Tag",
                                string : "args.context.tags[\"aimedShot\"] = \"Aimed Shot\";\nthis.effect.delete();",
                                trigger : "rollWeaponTest"
                            }
                        ]
                    }
                }
            },
            test : {},
            execute : ``
        },
        charge : {
            label : "IMPMAL.Charge",
            effect :  {
                name: "IMPMAL.Charge",
                statuses : ["charge"],
                icon: "icons/svg/aura.svg",
                flags: {
                    impmal: {
                        scriptData: [
                            {
                                label : "Advantage with Melee Attack",
                                string : "args.advCount++;",
                                trigger : "dialog",
                                options : {
                                    dialog: {
                                        hideScript : "return this.effect.used || !args.isAttack || !args.weapon.system.isMelee;",
                                        activateScript : "return args.weapon.system.isMelee",
                                        submissionScript : "this.effect.used = true;"
                                    }
                                }
                            },
                            {
                                label : "Disadvantage to defend yourself",
                                string : "args.disCount++;",
                                trigger : "dialog",
                                options : {
                                    dialog: {
                                        hideScript : "return !this.actor.defendingAgainst;",
                                        activateScript : "return this.actor.defendingAgainst && (args.weapon || args.data.skill == 'reflexes')",
                                    }
                                }
                            },
                            {
                                label : "Remove",
                                string : "this.effect.delete();",
                                trigger : "startTurn"
                            }
                        ]
                    }
                }
            },
            test : {},
            execute : ``
        },
        defend : {
            label : "IMPMAL.Defend",
            effect : {
                label: "IMPMAL.Defended",
                icon: "icons/svg/aura.svg",
                statuses : ["defended"],
                flags: {
                    impmal: {
                        scriptData: [
                            {
                                label : "Defended",
                                string: "ui.notifications.warn(`<strong>Defended</strong>: Must target ${this.effect.sourceName}`, {permanent: true});//setTimeout(dlg => dlg.close(), 250, args);",
                                trigger: "dialog",
                                options: {
                                    dialog: {
                                        hideScript: `return !args.isAttack`,
                                        activateScript: `return args.isAttack`,
                                        targeter : true
                                    },
                                }
                            },
                            {
                                label : "Remove",
                                string: "if (args.combatant.actor.uuid == this.effect.origin) this.effect.delete();", // Delete at the start of the defender's turn
                                trigger: "updateCombat",
                            }
                        ]
                    },
                }
            },
            test : {},
            execute : function(actor)
            {
                let target = Array.from(game.user.targets)[0];
                let data = foundry.utils.deepClone(this.effect);
                data.origin = actor.uuid;
                if (target?.actor)
                {
                    target.actor.applyEffect({effectData : [data]});
                }
            }
        },
        disengage : {
            label : "IMPMAL.Disengage"
        },
        dodge : {
            label : "IMPMAL.Dodge",
            effect :  {
                name: "IMPMAL.Dodge",
                statuses : ["dodge"],
                icon: "icons/svg/aura.svg",
                flags: {
                    impmal: {
                        scriptData: [
                            {
                                label : "Advantage to defend yourself",
                                string : "args.advCount++;",
                                trigger : "dialog",
                                options : {
                                    dialog: {
                                        hideScript : "return !this.actor.defendingAgainst || this.effect.used;",
                                        activateScript : "return this.actor.defendingAgainst && (args.weapon || args.data.skill == 'reflexes')",
                                        submissionScript : "this.effect.used = true;"
                                    }
                                }
                            },
                            {
                                label : "Remove",
                                string : "this.effect.delete();",
                                trigger : "startTurn"
                            }
                        ]
                    }
                }
            },
            test : {},
            execute : ``
        },
        flee : {
            label : "IMPMAL.Flee"
        },
        grapple : {
            label : "IMPMAL.Grapple"
        },
        help : {
            label : "IMPMAL.Help",
            effect :  {
                label: "Helped",
                icon: "icons/svg/aura.svg",
                statuses : ["helped"],
                flags: {
                    impmal: {
                        scriptData: [
                            {
                                label : "Advantage on next test",
                                string: "args.advCount++;",
                                trigger: "dialog",
                                options: {
                                    dialog: {
                                        hideScript: ``,
                                        activateScript: `return true`,
                                        submissionScript : `this.effect.delete();`
                                    }
                                }
                            }
                        ]
                    },
                }
            },
            test : {},
            execute : function(actor)
            {
                let target = Array.from(game.user.targets)[0];
                let data = foundry.utils.deepClone(this.effect);
                data.origin = actor.uuid;
                if (target?.actor)
                {
                    target.actor.applyEffect({effectData : [data]});
                }
            }
        },
        hide : {
            label : "IMPMAL.Hide",
            test : {
                skill : {
                    key : "stealth",
                    specialisation : "Hide"
                }
            }
        },
        run : {
            label : "IMPMAL.Run"
        },
        search : {
            label : "IMPMAL.Search",
            test : {
                skill : {
                    key : "awareness",
                    specialisation : "Sight"
                }
            }
        },
        seize : {
            label : "IMPMAL.SeizeTheInitiative",
            execute : function(actor)
            {
                let combatant = game.combat.combatants.find(i => i.actor?.uuid == actor?.uuid);
                combatant?.update({initiative : game.combat.turns[0].initiative + 1});
            }
        },
        shove : {
            label : "IMPMAL.Shove",
            test : {
                skill : {
                    key : "athletics",
                    specialisation : "Might"
                }
            }
        },
        cover : {
            label : "IMPMAL.TakeCover"
        }
    },


    conditions : [
        {
            icon: "systems/impmal/assets/icons/conditions/ablaze-minor.svg",
            id: "ablaze",
            statuses : ["ablaze"],
            name: "IMPMAL.ConditionAblazeMinor",
            flags : {
                impmal : {
                    type : "minor",
                    scriptData: [
                        {
                            label: "Damage",
                            string: `
                            let roll = new Roll("1d5").roll().then(async roll => {
                                this.actor.applyDamage(roll.total, {ignoreAP : true}).then(data => this.script.scriptMessage("Took " + data.woundsGained + " Damage from Ablaze"));
                            })
                            `,
                            trigger: "startTurn",
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/ablaze-major.svg",
            id: "ablaze",
            statuses : ["ablaze"],
            name: "IMPMAL.ConditionAblazeMajor",
            flags : {
                impmal : {
                    type : "major",
                    impmal : {
                        type : "minor",
                        scriptData: [
                            {
                                label: "Damage",
                                string: `
                                let roll = new Roll("1d10").roll().then(async roll => {
                                    this.actor.applyDamage(roll.total, {ignoreAP : true}).then(data => this.script.scriptMessage("Took " + data.woundsGained + " Damage"));
                                })
                                `,
                                trigger: "startTurn",
                            }
                        ]
                    }
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/bleeding-minor.svg",
            id: "bleeding",
            statuses : ["bleeding"],
            name: "IMPMAL.ConditionBleedingMinor",
            flags : {
                impmal : {
                    type : "minor",
                    scriptData: [
                        {
                            label: "Damage",
                            string: `this.actor.applyDamage(1, {ignoreAP : true}).then(data => this.script.scriptMessage("Took " + data.woundsGained + " Damage"));`,
                            trigger: "endTurn",
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/bleeding-major.svg",
            id: "bleeding",
            statuses : ["bleeding"],
            name: "IMPMAL.ConditionBleedingMajor",
            flags : {
                impmal : {
                    type : "major",
                    scriptData: [
                        {
                            label: "Damage",
                            string: `this.actor.applyDamage(3, {ignoreAP : true}).then(data => this.script.scriptMessage("Took " + data.woundsGained + " Damage"));`,
                            trigger: "endTurn",
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/blinded.svg",
            id: "blinded",
            statuses : ["blinded"],
            name: "IMPMAL.ConditionBlinded",
            flags : {
                impmal : {
                    scriptData: [
                        {
                            label: "Tests that rely on sight only succeed on a roll of 01-05",
                            string: "",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !(["awareness"].includes(args.data.skill) || args.weapon?.system?.isRanged)`,
                                    activateScript: `return args.skillItem?.name == "Sight" || args.weapon?.system?.isRanged`,
                                    submissionScript: `args.data.onlyAutomaticSuccess = true`,
                                },
                            }
                        },
                        {
                            label: "Disadvantage on Melee and Reflexes (Dodge)",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !["melee", "reflexes"].includes(args.data.skill);`,
                                    activateScript: `return args.data.skill == "melee" || args.skillItem?.name == "Dodge"`
                                },
                            }
                        },
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/deafened.svg",
            id: "deafened",
            statuses : ["deafened"],
            name: "IMPMAL.ConditionDeafened"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/fatigued-minor.svg",
            id: "fatigued",
            statuses : ["fatigued"],
            name: "IMPMAL.ConditionFatiguedMinor",
            flags : {
                impmal : {
                    type : "minor",
                    scriptData: [
                        {
                            label: "Disadvantage on all Tests",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: ``,
                                    activateScript: `return true`
                                },
                            }
                        },
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/fatigued-major.svg",
            id: "fatigued",
            statuses : ["fatigued"],
            name: "IMPMAL.ConditionFatiguedMajor",
            flags : {
                impmal : {
                    type : "major",
                    scriptData: [
                        {
                            label: "All Tests are Very Hard (-30)",
                            string: "args.fields.difficulty = 'veryHard';",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: ``,
                                    activateScript: `return true`
                                },
                            }
                        },
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/frightened-minor.svg",
            id: "frightened",
            statuses : ["frightened"],
            name: "IMPMAL.ConditionFrightenedMinor",
            flags : {
                impmal : {
                    type : "minor",
                    scriptData: [
                        {
                            label: "Disadvantage to confront the source of Fear",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: ``,
                                    activateScript: ``
                                },
                            }
                        },
                        {
                            label: "Advantage on Awareness and Intuition",
                            string: "args.advCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !["awareness", "intuition"].includes(args.data.skill);`,
                                    activateScript: `return ["awareness", "intuition"].includes(args.data.skill);`
                                },
                            }
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/frightened-major.svg",
            id: "frightened",
            statuses : ["frightened"],
            name: "IMPMAL.ConditionFrightenedMajor",
            flags : {
                impmal : {
                    type : "major"
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/incapacitated.svg",
            id: "incapacitated",
            statuses : ["incapacitated"],
            name: "IMPMAL.ConditionIncapacitated",
            flags : {
                impmal: {
                    scriptData: [
                        {
                            "label": "Automatic Crits",
                            "string": `
                            args.crit = true;`
                            ,
                            "trigger": "takeDamage"
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/overburdened.svg",
            id: "overburdened",
            statuses : ["overburdened"],
            name: "IMPMAL.ConditionOverburdened",
            changes : [{key: "system.combat.speed.land.modifier", value: "-1", mode: 2}],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Disadvantage on Agility Tests",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    "hideScript": `return args.data.characteristic != "ag";`,
                                    "activateScript": `return args.data.characteristic == "ag";`,
                                },
                            }
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/poisoned-minor.svg",
            id: "poisoned",
            statuses : ["poisoned"],
            name: "IMPMAL.ConditionPoisonedMinor",
            flags : {
                impmal : {
                    type : "minor",
                    scriptData: [
                        {
                            label: "Disadvantage on Strength and Toughness Tests",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    "hideScript": `return !["str", "tgh"].includes(args.data.characteristic)`,
                                    "activateScript": `return ["str", "tgh"].includes(args.data.characteristic)`,
                                },
                            }
                        },
                        {
                            label: "SL",
                            string: "if (args.result.SL > 0) { args.result.SL = Math.min(args.result.SL, this.actor.system.characteristics.tgh.bonus); }",
                            trigger: "rollTest",
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/poisoned-major.svg",
            id: "poisoned",
            statuses : ["poisoned"],
            name: "IMPMAL.ConditionPoisonedMajor",
            flags : {
                impmal : {
                    type : "major",
                    scriptData: [
                        {
                            label: "Prone and Incapacitated",
                            string: "await this.actor.addCondition('prone'); await this.actor.addCondition('incapacitated')",
                            trigger: "immediate",
                            options : {
                                immediate : {
                                    deleteEffect : false
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/prone.svg",
            id: "prone",
            statuses : ["prone"],
            name: "IMPMAL.ConditionProne",
            flags : {
                impmal : {
                    scriptData: [
                        {
                            label: "Disadvantage on Melee Tests",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !["melee"].includes(args.data.skill);`,
                                    activateScript: `return args.data.skill == "melee"`
                                },
                            }
                        },
                        {
                            label: "Advantage from within Immediate Range",
                            string: "args.advCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !args.weapon && !args.trait`,
                                    targeter : true
                                },
                            }
                        },
                        {
                            label: "Disadvantage from outside immediate Range",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !args.weapon && !args.trait`,
                                    targeter : true
                                },
                            }
                        }
                    ]
                }

            }
        },

        {
            icon: "systems/impmal/assets/icons/conditions/restrained-minor.svg",
            id: "restrained",
            statuses : ["restrained"],
            name: "IMPMAL.ConditionRestrainedMinor",
            flags : {
                impmal : {
                    type : "minor",
                    scriptData: [
                        {
                            label: "Disadvantage on Movement tests",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: ``,
                                    activateScript: `return ["athletics", "dexterity", "melee", "reflexes", "ranged"].includes(args.data.skill);`
                                },
                            }
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/restrained-major.svg",
            id: "restrained",
            statuses : ["restrained"],
            name: "IMPMAL.ConditionRestrainedMajor",
            flags : {
                impmal : {
                    type : "major",
                    scriptData: [
                        {
                            label: "Incapacitated",
                            string: "await this.actor.addCondition('incapacitated');",
                            trigger: "immediate",
                            options : {
                                immediate : {
                                    deleteEffect : false
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/stunned-minor.svg",
            id: "stunned",
            statuses : ["stunned"],
            name: "IMPMAL.ConditionStunnedMinor",
            flags : {
                impmal : {
                    type : "minor"
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/stunned-major.svg",
            id: "stunned",
            statuses : ["stunned"],
            name: "IMPMAL.ConditionStunnedMajor",
            flags : {
                impmal : {
                    type : "major",
                    scriptData: [
                        {
                            label: "Disadvantage on all Tests",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: ``,
                                    activateScript: `return true;`
                                },
                            }
                        }
                    ]
                }
            }
        },

        {
            icon: "systems/impmal/assets/icons/conditions/unconscious.svg",
            id: "unconscious",
            statuses : ["unconscious"],
            name: "IMPMAL.ConditionUnconscious",
            flags : {
                impmal : {
                    scriptData : [
                        {
                            label: "Prone and Incapacitated",
                            string: "await this.actor.addCondition('prone'); await this.actor.addCondition('incapacitated')",
                            trigger: "immediate",
                            options : {
                                immediate : {
                                    deleteEffect : false
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            icon: "systems/impmal/assets/icons/conditions/dead.svg",
            id: "dead",
            statuses : ["dead"],
            name: "IMPMAL.Dead"
        },
    ],

    zoneEffects : {
        barrier : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.Barrier",
            id : "barrier",
            statuses : ["barrier"]
        },
        lightCover : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.LightCover",
            id : "lightCover",
            statuses : ["lightCover"],
            flags: {
                impmal: {
                    applicationData : {
                        enableConditionScript : `return this.actor.system.combat.action == "cover"`
                    },
                    scriptData: [
                        {
                            "label": "Light Cover",
                            "string": `
                            if (args.opposed && args.opposed.attackerTest.item?.system.isRanged)
                            {
                                args.modifiers.push({value : -2, label : this.effect.name, armour : true})
                            }`,
                            "trigger": "preTakeDamage"
                        },
                        {
                            "label": "Start Turn",
                            "string": `delete this.effect.conditionScript; this.effect.update({"flags.impmal.applicationData.enableConditionScript" : ""})`, // Start turn doesn't require action to benefit
                            "trigger": "startTurn"
                        }
                    ]
                }
            }
        },
        mediumCover : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.MediumCover",
            id : "mediumCover",
            statuses : ["mediumCover"],
            flags: {
                impmal: {
                    applicationData : {
                        enableConditionScript : `return this.actor.system.combat.action == "cover"`
                    },
                    scriptData: [
                        {
                            "label": "Medium Cover",
                            "string": `
                            if (args.opposed && args.opposed.attackerTest.item?.system.isRanged)
                            {
                                args.modifiers.push({value : -4, label : this.effect.name, armour : true})
                            }`,
                            "trigger": "preTakeDamage"
                        },
                        {
                            "label": "Start Turn",
                            "string": `delete this.effect.conditionScript; this.effect.update({"flags.impmal.applicationData.enableConditionScript" : ""})`, // Start turn doesn't require action to benefit
                            "trigger": "startTurn"
                        }
                    ]
                }
            }
        },
        heavyCover : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.HeavyCover",
            id : "heavyCover",
            statuses : ["heavyCover"],
            flags: {
                impmal: {
                    applicationData : {
                        enableConditionScript : `return this.actor.system.combat.action == "cover"`
                    },
                    scriptData: [
                        {
                            "label": "Heavy Cover",
                            "string": `
                            if (args.opposed && args.opposed.attackerTest.item?.system.isRanged)
                            {
                                args.modifiers.push({value : -6, label : this.effect.name, armour : true})
                            }`,
                            "trigger": "preTakeDamage"
                        },
                        {
                            "label": "Start Turn",
                            "string": `delete this.effect.conditionScript; this.effect.update({"flags.impmal.applicationData.enableConditionScript" : ""})`, // Start turn doesn't require action to benefit
                            "trigger": "startTurn"
                        }
                    ]
                }
            }
        },
        difficultTerrain : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.DifficultTerrain",
            id : "difficultTerrain",
            statuses : ["difficultTerrain"],
            changes : [{key: "system.combat.speed.land.modifier", value: "-1", mode: 2}],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Disadvantage on Athletics (Running) and Reflexes (Dodge)",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    "hideScript": `return !["reflexes", "athletics"].includes(args.data.skill);`,
                                    "activateScript": `return args.skillItem?.name == "Running" || args.skillItem?.name == "Dodge";`,
                                },
                            }
                        }
                    ]
                }
            }
        },
        lightlyObscured : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.LightlyObscured",
            id : "lightlyObscured",
            statuses : ["lightlyObscured"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Advantage on Stealth (Hide)",
                            string: "args.advCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !["stealth"].includes(args.data.skill);`,
                                    activateScript: `return args.skillItem?.name == "Hide"`
                                },
                            }
                        },
                        {
                            label: "Disadvantage on Awareness (Sight) and Ranged Tests",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !(["awareness"].includes(args.data.skill) || args.weapon?.system?.isRanged)`,
                                    activateScript: `return args.skillItem?.name == "Sight" || args.weapon?.system?.isRanged`
                                },
                            }
                        },
                        {
                            label: "Lightly Obscured",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !args.weapon?.system?.isRanged`,
                                    activateScript: `return args.weapon?.system?.isRanged`,
                                    targeter : true
                                },
                            }
                        }
                    ]
                }
            }
        },
        heavilyObscured : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.HeavilyObscured",
            id : "heavilyObscured",
            statuses : ["heavilyObscured"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Heavily Obscured",
                            string: `ui.notifications.notify("Cannot target Heavily Obscured target with Ranged Attacks");//setTimeout(dlg => dlg.close(), 250, args);`,
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !args.weapon?.system?.isRanged`,
                                    activateScript: `return args.weapon?.system?.isRanged`,
                                    targeter : true
                                },
                            }
                        },
                        {
                            label: "Blinded",
                            string: `await this.actor.addCondition("blinded").then(condition => if (condition) condition?.setFlag("impmal", "fromZone", this.effect.getFlag("impmal", "fromZone")))`,
                            trigger: "immediate",
                            options : {
                                immediate : {
                                    deleteEffect : false
                                }
                            }
                        },
                    ]
                }
            }
        },
        minorHazard : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.MinorHazard",
            id : "minorHazard",
            statuses : ["minorHazard"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Hazard Damage",
                            string: `this.actor.applyDamage(5).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));`,
                            trigger: "immediate",
                            options : {
                                immediate : {
                                    deleteEffect : false
                                }
                            }
                        },
                        {
                            label: "Hazard Damage",
                            string: `this.actor.applyDamage(5).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));`,
                            trigger: "startTurn"
                        }
                    ]
                }
            }
        },
        majorHazard : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.MajorHazard",
            id : "majorHazard",
            statuses : ["majorHazard"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Hazard Damage",
                            string: `this.actor.applyDamage(10).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));`,
                            trigger: "immediate",
                            options : {
                                immediate : {
                                    deleteEffect : false
                                }
                            }
                        },
                        {
                            label: "Hazard Damage",
                            string: `this.actor.applyDamage(10).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));`,
                            trigger: "startTurn"
                        }
                    ]
                }
            }
        },
        deadlyHazard : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.DeadlyHazard",
            id : "deadlyHazard",
            statuses : ["deadlyHazard"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Hazard Damage",
                            string: `this.actor.applyDamage(15).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));`,
                            trigger: "immediate",
                            options : {
                                immediate : {
                                    deleteEffect : false
                                }
                            }
                        },
                        {
                            label: "Hazard Damage",
                            string: `this.actor.applyDamage(15).then(data => ui.notifications.notify("Took " + data.woundsGained + " Damage from Hazard"));`,
                            trigger: "startTurn"
                        }
                    ]
                }
            }
        },
        poorlyLit : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.PoorlyLit",
            id : "poorlyLit",
            statuses : ["poorlyLit"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Disadvantage on Awareness (Sight) in the Poorly Lit Zone",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !(["awareness"].includes(args.data.skill))`,
                                    activateScript: `return args.skillItem?.name == "Sight"`
                                },
                            }
                        },
                        {
                            label: "Poorly Lit",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !args.weapon?.system?.isRanged`,
                                    activateScript: `return args.weapon?.system?.isRanged`,
                                    targeter : true
                                },
                            }
                        }
                    ]
                }
            }
        },
        dark : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.Dark",
            id : "dark",
            statuses : ["dark"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Advantage on Stealth (Hide)",
                            string: "args.advCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !["stealth"].includes(args.data.skill);`,
                                    activateScript: `return args.skillItem?.name == "Hide"`
                                },
                            }
                        },
                        {
                            label: "Only succeeds on a roll of 01-05",
                            string: "",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !(["awareness"].includes(args.data.skill) || args.weapon?.system?.isRanged)`,
                                    activateScript: `return args.skillItem?.name == "Sight" || args.weapon?.system?.isRanged`,
                                    submissionScript: `args.data.onlyAutomaticSuccess = true`,
                                    targeter : true
                                },
                            }
                        },
                        {
                            label: "Disadvantage on Tests affected by the absence of light",
                            string: "args.disCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: ``,
                                    activateScript: `return ["melee", "reflexes", "dexterity", "tech"].includes(args.data.skill)`,
                                },
                            }
                        }
                    ]
                }
            }
        },
        warpTouched : {
            icon: "icons/svg/aura.svg",
            name : "IMPMAL.WarpTouched",
            id : "warpTouched",
            statuses : ["warpTouched"],
            flags : {
                impmal: {
                    scriptData: [
                        {
                            label: "Advantage on Psychic Power Tests",
                            string: "args.advCount++;",
                            trigger: "dialog",
                            options: {
                                dialog: {
                                    hideScript: `return !args.power`,
                                    activateScript: `return args.power`
                                },
                            }
                        },
                        {
                            label: "Additional Warp Charge",
                            string: `
                            args.context.additionalWarp += args.result.SL;
                            args.context.tags.warpTouched = game.i18n.localize("IMPMAL.WarpTouched") + ": " + args.result.SL;
                            `,
                            trigger: "rollPowerTest",
                        },
                        {
                            label: "Minor Source of Corruption",
                            string: `
                                this.actor.setupSkillTest({key : "fortitude"}, {title : {append : " - Warp Touched"}, fields: {difficulty : "routine"}, context : {corruption : 1}})
                            `,
                            trigger: "endTurn",
                        }
                    ]
                }
            }
        },
    },

    effectScripts : {},

    transferTypes : {
        document : "WH.TransferType.Document",
        damage : "WH.TransferType.Damage",
        target : "WH.TransferType.Target",
        zone : "WH.TransferType.Zone",
        other : "WH.TransferType.Other"
    },
    
    // mergeObject(scriptTriggers, {
    
    //     equipToggle : "WH.Trigger.EquipToggle",
    
    //     takeDamageMod : "WH.Trigger.TakeDamageMod",
    //     applyDamageMod : "WH.Trigger.ApplyDamageMod",
    
    //     preRollTest : "WH.Trigger.PreRollTest",
    //     preRollCombatTest : "WH.Trigger.PreRollCombatTest",
    //     preRollSpellTest : "WH.Trigger.PreRollSpellTest",
    
    //     rollTest : "WH.Trigger.RollTest",
    //     rollCombatTest : "WH.Trigger.RollCombatTest",
    //     rollSpellTest : "WH.Trigger.RollSpellTest",
    // }),
    
    effectKeysTemplate : "systems/impmal/templates/apps/effect-key-options.hbs",
    avoidTestTemplate : "systems/impmal/templates/apps/effect-avoid-test.hbs",
    effectScripts : {},
    
    logFormat : [`%cIMPMAL` + `%c @MESSAGE`, "color: #DDD;background: #065c63;font-weight:bold", "color: unset"],
    
    rollClasses : {},
    
    premiumModules : {
        "impmal" : "Imperium Maledictum System",
        "impmal-core" : "Core Rulebook",
        "impmal-starter-set" : "Starter Set",
    }
    
};


// Lists conditions without major/minor
const IM_CONFIG = {
    statusEffects : [
        {
            icon: "systems/impmal/assets/icons/conditions/ablaze.svg",
            id: "ablaze",
            statuses : ["ablaze"],
            name: "IMPMAL.ConditionAblaze",
            title: "IMPMAL.ConditionAblaze"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/bleeding.svg",
            id: "bleeding",
            statuses : ["bleeding"],
            name: "IMPMAL.ConditionBleeding",
            title: "IMPMAL.ConditionBleeding"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/blinded.svg",
            id: "blinded",
            statuses : ["blinded"],
            name: "IMPMAL.ConditionBlinded",
            title: "IMPMAL.ConditionBlinded"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/deafened.svg",
            id: "deafened",
            statuses : ["deafened"],
            name: "IMPMAL.ConditionDeafened",
            title: "IMPMAL.ConditionDeafened"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/fatigued.svg",
            id: "fatigued",
            statuses : ["fatigued"],
            name: "IMPMAL.ConditionFatigued",
            title: "IMPMAL.ConditionFatigued"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/frightened.svg",
            id: "frightened",
            statuses : ["frightened"],
            name: "IMPMAL.ConditionFrightened",
            title: "IMPMAL.ConditionFrightened"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/incapacitated.svg",
            id: "incapacitated",
            statuses : ["incapacitated"],
            name: "IMPMAL.ConditionIncapacitated",
            title: "IMPMAL.ConditionIncapacitated"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/overburdened.svg",
            id: "overburdened",
            statuses : ["overburdened"],
            name: "IMPMAL.ConditionOverburdened",
            title: "IMPMAL.ConditionOverburdened"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/poisoned.svg",
            id: "poisoned",
            statuses : ["poisoned"],
            name: "IMPMAL.ConditionPoisoned",
            title: "IMPMAL.ConditionPoisoned"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/prone.svg",
            id: "prone",
            statuses : ["prone"],
            name: "IMPMAL.ConditionProne",
            title: "IMPMAL.ConditionProne"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/restrained.svg",
            id: "restrained",
            statuses : ["restrained"],
            name: "IMPMAL.ConditionRestrained",
            title: "IMPMAL.ConditionRestrained"
        },
        {
            icon: "systems/impmal/assets/icons/conditions/stunned.svg",
            id: "stunned",
            statuses : ["stunned"],
            name: "IMPMAL.ConditionStunned",
            title: "IMPMAL.ConditionStunned",
        },
        {
            icon: "systems/impmal/assets/icons/conditions/unconscious.svg",
            id: "unconscious",
            statuses : ["unconscious"],
            name: "IMPMAL.ConditionUnconscious",
            title: "IMPMAL.ConditionUnconscious",
        },
        {
            icon: "systems/impmal/assets/icons/conditions/dead.svg",
            id: "dead",
            statuses : ["dead"],
            name: "IMPMAL.Dead",
            title: "IMPMAL.Dead",
        },
    ]
};


CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
        pattern : /@TableHTML\[(.+?)\](?:{(.+?)})?/gm,
        enricher : async (match) => 
        {
            let table = await fromUuid(match[1]);
            let options = match[2].split(",").map(i => i.trim());
            let label = options[0];
            if (table)
            {
                return $(await ImpMalUtility.tableToHTML(table, label, options))[0];
            }
            else 
            {
                return `Error - Table ${match[0]} not Found`;
            }
        }
    },
    {
        pattern : /@ActorHTML\[(.+?)\](?:{(.+?)})?/gm,
        enricher : async (match) => 
        {
            let [uuid, ...options] = match[1].split(",")
            let actor = await fromUuid(uuid);
            let label = match[2];
            if (actor)
            {
                return $(await ImpMalUtility.actorToHTML(actor, label, options))[0];
            }
            else 
            {
                return `Error - Actor ${uuid} not Found`;
            }
        }
    },
    {
        pattern : /@TableRoll\[(.+?)\](?:{(.+?)})?/gm,
        enricher : async (match) => 
        {
            let values = match[1].split(",");
            let key = values[0];
            let formula = values[1];

            const a = document.createElement("a");
            a.classList.add("table-roll");
            a.dataset.table = key;
            if (formula)
            {
                a.dataset.formula = formula;
            }
            a.innerHTML = `<i class="fa-solid fa-list"></i> ${match[2]}`;
            return a;
        }
    },
    {
        pattern : /@Corruption\[(.+?)\](?:{(.+?)})?/gm,
        enricher : async (match) => 
        {
            let value = match[1];

            const a = document.createElement("a");
            a.classList.add("corruption-link");
            a.classList.add("custom-link");
            a.dataset.value = value;
            a.innerHTML = `<img src="systems/impmal/assets/icons/chsvg"><span>${match[2] || value}</span>`;
            return a;
        }
    }
]);

foundry.utils.mergeObject(IMPMAL, defaultWarhammerConfig)
export {IMPMAL, IM_CONFIG};