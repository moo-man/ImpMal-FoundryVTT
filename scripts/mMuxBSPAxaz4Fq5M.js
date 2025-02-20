let featuresTable = await fromUuid("RollTable.t5Da1EFHdmn5gFVv");
let quirksTable = await fromUuid("RollTable.Q9AKwGdeu8hJI0aX");

let feature = (await featuresTable.roll()).results[0];
let quirk = (await quirksTable.roll()).results[0];

let resultMap = {
    "7u0y9nk432uZZBuW":"UX3KEwi3vOW6bwt2",
    "MTSjYRTdF942Covs":"RpXeAKiPKI0JeF9t",
    "S8t18aUJtTz4H1TN":"HhRAKMtzmQ17khGs",
    "lvIRre1O6GgAOYn4":"LYswcjq9xY3Oj9Sc",
    "IpUdaLmpDohKHsrf":"C27lWg077J5VCiOj",
    "V1VbcJWCUIzhtS5I":"8M54wP8O7jNlWxea",
    "apzgLww0uiwUEHwy":"pZ2cz4SkWhLQA9HF",
    "CwX0bNWDdcmtQhMF":"VUWKoKksueKB6NrU",
    "xeEoeRMldgyfSA3P":"1qlC0qdmtwLWiYaL",
    "sJ98CVftgkYBLvo3":"SOQXm7qnxMjVvjES"
}

let description = feature.text + quirk.text;

this.item.update({"system.notes.gm" : this.item.system.notes.gm + description});

this.effect.update({"system.transferData.type" : "other"})
let resultEffect = this.item.effects.get(resultMap[feature.id]);
if (resultEffect)
{	

this.script.notification(resultEffect.name);
resultEffect.update({"system.transferData.type" : "document"})

}