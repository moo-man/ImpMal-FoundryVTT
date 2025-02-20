let positiveMutation = (await fromUuidSync("RollTable.Bb2dndjJKEPg7ubr").draw()).results[0]
let negativeMutation = (await fromUuidSync("RollTable.Uq5u8FnAQDaoVtBt").draw()).results[0]

let positiveMutationID = `Compendium.${positiveMutation.documentCollection}.${positiveMutation.documentId}`
let negativeMutationID = `Compendium.${negativeMutation.documentCollection}.${negativeMutation.documentId}`

this.actor.addEffectItems([positiveMutationID, negativeMutationID], this.effect)