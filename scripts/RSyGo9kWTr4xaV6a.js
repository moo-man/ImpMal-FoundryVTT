let testSL = this.effect.sourceTest.result.SL

let weapon = {name: this.effect.name,img: this.effect.img, type: "weapon",
system: {attackType: "melee", spec: "oneHanded", damage: {base: "3", characteristic: "wil"}, "traits.list": [{key: "penetrating", value: testSL}]}}

this.actor.createEmbeddedDocuments("Item", [weapon], {fromEffect : this.effect.id})