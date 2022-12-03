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
        psychic : "IMPMAL.Psychic",
        ranged : "IMPMAL.Ranged",
        rapport : "IMPMAL.Rapport",
        reflexes : "IMPMAL.Reflexes",
        stealth : "IMPMAL.Stealth",
        tech : "IMPMAL.Tech"
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

    hitLocations : {
        head : "IMPMAL.Head",
        leftArm : "IMPMAL.LeftArm",
        rightArm : "IMPMAL.RightArm",
        leftLeg : "IMPMAL.LeftLeg",
        rightLeg : "IMPMAL.RightLeg",
        body : "IMPMAL.Body"
    },

    availability : {
        "" : "-",
        common : "IMPMAL.Common",
        scarce : "IMPMAL.Scarce",
        rare : "IMPMAL.Rare",
        exotic : "IMPMAL.Exotic",
    },

    ranges : {
        short : "IMPMAL.Short",
        medium : "IMPMAL.Medium",
        long : "IMPMAL.Long",
        extreme : "IMPMAL.Extreme",
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

    traits : {
        blast : "IMPMAL.Blast",
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
        unstable : "IMPMAL.Unstable",
        bulky : "IMPMAL.Bulky",
        shoddy : "IMPMAL.Shoddy",
        ugly : "IMPMAL.Ugly",
        unreliable : "IMPMAL.Unreliable",
        lightweight : "IMPMAL.Lightweight",
        mastercrafted : "IMPMAL.Mastercrafted",
        ornamental : "IMPMAL.Ornamental",
        durable : "IMPMAL.Durable",
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
        self : "IMPMAL.Self",
        immediate : "IMPMAL.Immediate",
        short : "IMPMAL.Short",
        medium : "IMPMAL.Medium",
        long : "IMPMAL.Long"
    },

    powerDuration : {
        instant : "IMPMAL.Instant",
        sustained : "IMPMAL.Sustained",
        special : "IMPMAL.Special",
        permanent : "IMPMAL.Permanent"
    }
};

export default IMPMAL;