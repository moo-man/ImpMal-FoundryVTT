export default function log(message, { force = false, args = undefined } = {}) 
{
    if (CONFIG.debug.impmal || force) 
    {
        console.log(`%cIMPMAL` + `%c | ${message}`, "color: #DDD;background: #065c63;font-weight:bold", "color: unset", args || "");
    }
}