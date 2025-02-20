let messageOuput
let rollSL = args.result.SL

if (rollSL >= 1){
    messageOutput = "<ul><li>You know when someone speaks an outright lie.</li>"
}
if (rollSL >= 3){
    messageOutput += "<li>You know when someone speaks something technically true, or with deceptive intent.</li>"
} 
if (rollSL > 4){
    messageOutput += "<li>You know a general idea of the speaker’s motivation for speaking a falsehood (greed, duress, malice, etc.).</li>"
}

args.result.text.discernFalsehood = (messageOutput += "</ul>")