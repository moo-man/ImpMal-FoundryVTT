export default function log(message, { force = false, args = undefined } = {}) 
{
    if (CONFIG.debug.impmal || force) 
    {
        console.log(`%cIMPMAL` + `%c | ${message}`, "color: #1c3132;background: #CCC;", "color: unset", args || "");
    }
}