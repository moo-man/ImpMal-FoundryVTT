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
        schema.computed = new fields.BooleanField()
        schema.zone.fields.traits = new fields.EmbeddedDataField(ImpMalZoneTraitsModel)
        return schema
    }
}   

export class ImpMalZoneTraitsModel extends foundry.abstract.DataModel {
    static defineSchema()
    {
        let schema = {};
        schema.barrier = new fields.BooleanField({label : "IMPMAL.Barrier"});
        schema.cover = new fields.StringField({label : "IMPMAL.Cover", choices : game.impmal.config.coverTypes});
        schema.hazard = new fields.StringField({label : "IMPMAL.Hazard", choices : game.impmal.config.hazardtypes});
        schema.difficult = new fields.BooleanField({label : "IMPMAL.DifficultTerrain"});
        schema.obscured = new fields.StringField({label : "IMPMAL.Obscured", choices : game.impmal.config.obscuredTypes});
        schema.light = new fields.StringField({label : "IMPMAL.Light", choices : game.impmal.config.lightTypes});
        schema.warpTouched = new fields.BooleanField({label : "IMPMAL.WarpTouched"});
        return schema;
    }
}