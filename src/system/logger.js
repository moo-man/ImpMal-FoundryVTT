export default function log(message, { force = false, args = undefined } = {}) 
{
    if (CONFIG.debug.impmal || force) 
    {
        console.log(`%IMPMAL` + `%c | ${message}`, "color: #1c3132", "color: unset", args || "");
    }
}