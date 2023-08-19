let fields = foundry.data.fields;

export default EnabledMixin = (cls) => class extends cls 
{
    static defineSchema() 
    {
        let schema = super.defineSchema();
        schema.enabled = new fields.BooleanField({initial: false});
        return schema;
    }
};
