let fields = foundry.data.fields;

export class ImpMalAvoidTestModel extends AvoidTestModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.difficulty = new fields.StringField({});
        schema.characteristic = new fields.StringField({});
        schema.skill = new fields.SchemaField({
            key : new fields.StringField(),
            specialisation : new fields.StringField()
        });

        return schema;
    }
}

export class ImpMalActiveEffectModel extends WarhammerActiveEffectModel {
    static _avoidTestModel = ImpMalAvoidTestModel;

    static defineSchema()
    {
        let schema = super.defineSchema();
        schema.type = new fields.StringField({});
        schema.computed = new fields.BooleanField({initial: false})
        schema.zone.fields.traits = new fields.SchemaField({
            barrier : new fields.BooleanField(),
            cover : new fields.StringField({initial : ""}),
            hazard : new fields.StringField({initial : ""}),
            difficult : new fields.BooleanField({initial : false}),
            obscured : new fields.StringField({initial : ""}),
            light : new fields.StringField({initial : ""}), 
            warpTouched : new fields.BooleanField(), 
        })
        return schema
    }
}   