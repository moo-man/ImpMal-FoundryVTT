
    let weapons = [{
        "name": "Heavy Bolter",
        "type": "trait",
        "id": "CNsINQvyrV8iWNni",
        "img": "modules/impmal-core/assets/icons/weapons/boltgun.webp",
        "system": {
            "notes": {
                "player": "",
                "gm": ""
            },
            "attack": {
                "enabled": true,
                "type": "ranged",
                "characteristic": "",
                "skill": {
                    "key": "ranged",
                    "specialisation": "Ordnance"
                },
                "damage": {
                    "SL": true,
                    "base": "10",
                    "characteristic": "",
                    "ignoreAP": false
                },
                "range": "long",
                "traits": {
                    "list": [
                        {
                            "key": "heavy",
                            "value": "4"
                        },
                        {
                            "key": "loud"
                        },
                        {
                            "key": "penetrating",
                            "value": "5"
                        },
                        {
                            "key": "rapidFire",
                            "value": "3"
                        },
                        {
                            "key": "spread"
                        },
                        {
                            "key": "twohanded"
                        }
                    ]
                }
            },
            "test": {
                "enabled": false,
                "difficulty": "challenging",
                "characteristic": "",
                "skill": {
                    "key": "",
                    "specialisation": ""
                }
            },
            "roll": {
                "enabled": false,
                "formula": "",
                "label": ""
            }
        },
    }, 
    {
        "name": "Lascannon",
        "id": "ccGr4w9dRxGr1A5Z",
        "type": "trait",
        "img": "modules/impmal-core/assets/icons/weapons/lascannon.webp",
        "system": {
            "notes": {
                "player": "",
                "gm": ""
            },
            "attack": {
                "enabled": true,
                "type": "ranged",
                "characteristic": "",
                "skill": {
                    "key": "ranged",
                    "specialisation": "Ordnance"
                },
                "damage": {
                    "SL": true,
                    "base": "18",
                    "characteristic": "",
                    "ignoreAP": false
                },
                "range": "extreme",
                "traits": {
                    "list": [
                        {
                            "key": "heavy",
                            "value": "4"
                        },
                        {
                            "key": "loud"
                        },
                        {
                            "key": "penetrating",
                            "value": "10"
                        },
                        {
                            "key": "twohanded"
                        }
                    ]
                }
            },
            "test": {
                "enabled": false,
                "difficulty": "challenging",
                "characteristic": "",
                "skill": {
                    "key": "",
                    "specialisation": ""
                }
            },
            "roll": {
                "enabled": false,
                "formula": "",
                "label": ""
            }
        },
    }, 
    {
        "name": "Missile Launcher (Frag Missile)",
        "id": "Qpvdm09qz6PapboN",
        "type": "trait",
        "img": "modules/impmal-core/assets/icons/weapons/portable-missile-launcher.webp",
        "system": {
            "notes": {
                "player": "",
                "gm": ""
            },
            "attack": {
                "enabled": true,
                "type": "ranged",
                "characteristic": "",
                "skill": {
                    "key": "ranged",
                    "specialisation": "Ordnance"
                },
                "damage": {
                    "SL": true,
                    "base": "8",
                    "characteristic": "",
                    "ignoreAP": false
                },
                "range": "extreme",
                "traits": {
                    "list": [
                        {
                            "key": "blast"
                        },
                        {
                            "key": "heavy",
                            "value": "4"
                        },
                        {
                            "key": "loud"
                        },
                        {
                            "key": "spread"
                        },
                        {
                            "key": "twohanded"
                        }
                    ]
                }
            },
            "test": {
                "enabled": false,
                "difficulty": "challenging",
                "characteristic": "",
                "skill": {
                    "key": "",
                    "specialisation": ""
                }
            },
            "roll": {
                "enabled": false,
                "formula": "",
                "label": ""
            }
        },
    },
    {
        "id": "R6uf5zdRPdgWJNWm",
        "name": "Missile Launcher (Krak Missile)",
        "type": "trait",
        "img": "modules/impmal-core/assets/icons/weapons/portable-missile-launcher.webp",
        "system": {
            "notes": {
                "player": "",
                "gm": ""
            },
            "attack": {
                "enabled": true,
                "type": "ranged",
                "characteristic": "",
                "skill": {
                    "key": "ranged",
                    "specialisation": "Ordnance"
                },
                "damage": {
                    "SL": true,
                    "base": "16",
                    "characteristic": "",
                    "ignoreAP": false
                },
                "range": "extreme",
                "traits": {
                    "list": [
                        {
                            "key": "heavy",
                            "value": "4"
                        },
                        {
                            "key": "loud"
                        },
                        {
                            "key": "penetrating",
                            "value": "6"
                        },
                        {
                            "key": "spread"
                        },
                        {
                            "key": "twohanded"
                        }
                    ]
                }
            },
            "test": {
                "enabled": false,
                "difficulty": "challenging",
                "characteristic": "",
                "skill": {
                    "key": "",
                    "specialisation": ""
                }
            },
            "roll": {
                "enabled": false,
                "formula": "",
                "label": ""
            }
        }
    }
]

    let choice = (await ItemDialog.create(weapons, 1, {text : "Choose the weapon used by the Heavy Weapons Team"}))

    if (choice && choice.length)
    {
        await this.actor.createEmbeddedDocuments("Item", choice);
    }