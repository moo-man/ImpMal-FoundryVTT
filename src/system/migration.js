export default class Migration {
    static stats = {};
    static MIGRATION_VERSION = "2.0.0"
    static shouldMigrate()
    {
        let systemMigrationVersion = game.settings.get("impmal", "systemMigrationVersion")

        return foundry.utils.isNewerVersion(this.MIGRATION_VERSION, systemMigrationVersion);
    }

    static async migrateWorld(update=false, updateVersion=false) {
        this.stats = {
            actors : {
                updated : 0,
                skipped : 0,
                error : [],
                total : 0,
                items : 0,
                effects : 0,
                itemEffects : 0
            },
            items : {
                updated : 0,
                skipped : 0,
                error : [],
                total : 0,
                effects : 0
            }
        }
        ui.notifications.notify(`>>> Initiated <strong>Imperium Maledictum</strong> Version ${game.system.version} Migration <<<`);
        console.log(`%c+++++++++++++++++| Begin Migration of World Actors |+++++++++++++++++`, "color: #DDD;background: #065c63;font-weight:bold");
        for (let doc of game.actors.contents) 
        {
            this.stats.actors.total++;
            warhammer.utility.log(`+++| Actor: ${doc.name} |+++`, true, null, {groupCollapsed : true})
            try {
                let migration = this.migrateActor(doc);
                if (!isEmpty(migration)) 
                {
                    this.stats.actors.updated++;
                    if (update)
                    {
                        await doc.update(migration);
                    }
                    warhammer.utility.log(`+++| Migration Data: `, true, migration)
                }
                else 
                {
                    this.stats.actors.skipped++;
                    warhammer.utility.log(`+++| Nothing to migrate for ${doc.name} |+++`, true)
                }
            }
            catch (e) {
                this.stats.actors.error.push(doc.name);
                warhammer.utility.error("+++| MIGRATION FAILED |+++ Error: " + e, true, doc)
            }
            finally
            {
                console.groupEnd();
            }
        }

        console.log(`%c+++++++++++++++++| Begin Migration of World Items |+++++++++++++++++`, "color: #DDD;background: #065c63;font-weight:bold");
        for (let doc of game.items.contents) 
        {
            this.stats.items.total++;
            warhammer.utility.log(`+++| Item: ${doc.name} |+++`, true, null, {groupCollapsed : true})
            try {
                let migration = this.migrateItem(doc);
                if (!isEmpty(migration)) 
                {
                    this.stats.items.updated++;
                    if (update)
                    {
                        await doc.update(migration);
                    }
                    warhammer.utility.log(`+++| Migration Data: `, true, migration)
                }
                else 
                {
                    this.stats.items.skipped++;
                    warhammer.utility.log(`+++| Nothing to migrate for ${doc.name} |+++`, true)
                }
            }
            catch (e) {
                this.stats.actors.error.push(doc.name);
                warhammer.utility.error("+++| MIGRATION FAILED |+++ Error: " + e, true, doc)
            }
            finally
            {
                console.groupEnd();
            }
        }

        console.log(`%c+++++++++++++++++| ${game.system.version} Migration Complete |+++++++++++++++++`, "color: #DDD;background: #065c63;font-weight:bold");
        this._printStatistics(this.stats)
        ui.notifications.notify(`>>> Migration Complete — See Console for details <<<`)
        game.settings.set("impmal", "systemMigrationVersion", game.system.version)
    }

    static migrateActor(actor) {
        let migration = {
            items : actor.items.map(i => this.migrateItem(i, actor)).filter(i => !isEmpty(i)),
            effects: actor.effects.map(e => this.migrateEffect(e, actor)).filter(i => !isEmpty(i))
        };

        foundry.utils.mergeObject(migration, this._performActorDataMigration(actor))

        this.stats.actors.items += migration.items.length;
        this.stats.actors.effects += migration.effects.length;

        if (actor.effects.size)
        {
            warhammer.utility.log(`\t|--- Migrated ${migration.effects.length} / ${actor.effects.size} Embedded Effects`, true)
        }
        if (actor.items.size)
        {
            warhammer.utility.log(`\t|--- Migrated ${migration.items.length} / ${actor.items.size} Embedded Items`, true)
        }

        if (migration.items.length == 0)
        {
            delete migration.items;
        }
        if (migration.effects.length == 0)
        {
            delete migration.effects;
        }
        if (!isEmpty(migration))
        {
            migration._id = actor._id;
        }
        return migration;
    }

    static migrateItem(item, parent) {
        if (parent)
        {
            warhammer.utility.log(`\t|--- Embedded Item: ${item.name}`, true)
        }

        let migration = {
            effects: item.effects.map(e => this.migrateEffect(e, item)).filter(e => !isEmpty(e))
        };

        if (parent)
        {
            this.stats.actors.itemEffects += migration.effects.length;
        }
        else 
        {
            this.stats.items.effects += migration.effects.length;
        }

        if (migration.effects.size)
        {
            warhammer.utility.log(`${parent ? '\t' : ""}\t|--- Migrated ${migration.effects.length} / ${actor.effects.size} Embedded Effects`, true)
        }

        foundry.utils.mergeObject(migration, this._performItemDataMigration(item))

        if (migration.effects.length == 0)
        {
            delete migration.effects;
        }

        if (!isEmpty(migration))
        {
            migration._id = item._id;
        }
        return migration;
    }

    static migrateEffect(effect, parent) {
        warhammer.utility.log(`\t${parent.parent ? "\t" : ""}|--- Active Effect: ${effect.name}`, true)
        let migration = {};

        foundry.utils.mergeObject(migration, this._performEffectDataMigration(effect))

        if (!isEmpty(migration))
        {
            migration._id = effect._id;
        }
        return migration;
    }

    static _performActorDataMigration(actor)
    {
        let migrated = {}
        migrated.name = actor.name;
        return migrated;
    }
    static _performItemDataMigration(item)
    {
        let migrated = {}
        migrated.name = item.name;
        return migrated;
    }  
    static _performEffectDataMigration(effect)
    {
        let migrated = {}
        migrated.name = effect.name;
        return migrated;
    }  

    static _printStatistics(stats)
    {
        let errors = stats.actors.error.length + stats.items.error.length;
        warhammer.utility.log(`Migration Statistics ${errors > 0 ? "(" + errors + " Errors)" : ""}`, true, stats, {groupCollapsed : true})
        warhammer.utility.log(`Actors - Updated: ${stats.actors.updated}; Skipped: ${stats.actors.skipped}; Error: ${stats.actors.error.length} ${stats.actors.error.length ? "(" + stats.actors.error.join(", ") + ")" : ""}`, true)
        warhammer.utility.log(`Items - Updated: ${stats.items.updated}; Skipped: ${stats.items.skipped}; Error: ${stats.items.error.length} ${stats.items.error.length ? "(" + stats.items.error.join(", ") + ")" : ""}`, true)
        console.groupEnd();
    }
}