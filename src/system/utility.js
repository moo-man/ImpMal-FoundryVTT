export default class ImpMalUtility
{
    /**
   * Given an ID, find an item within the world, and if necessary, search the compendium using the type argument
   * 
   * @param {String} id id of the item
   * @returns an Item object if the item is in the world, or a Promise of an Item if it was from the compendium
   */
    static findId(id) 
    {
        if (id.includes("."))
        {
            return fromUuid(id);
        }
    
        for(let collection of game.collections)
        {
            if (collection.has(id))
            {
                return collection.get(id);
            }
        }
    
        for (let pack of game.packs) 
        {
            if (pack.index.has(id)) 
            {
                return pack.getDocument(id);
            }
        }
    }
}