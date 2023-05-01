import ImpMalItemSheet from "./item-sheet";


export default class ImpMalItemDiffSheet extends ImpMalItemSheet
{
    get title() 
    {
        return super.title + " (diff)";
    }

    async getData() 
    {
        let data = await super.getData();
        mergeObject(data, this.options.diff);
        return data;
    }

    _updateObject(ev, formData)
    {
        this.options.diffUpdater(diffObject(flattenObject(this.object.toObject()), formData));
    }

    _onCreateArrayElement(ev)
    {
        ev.stopPropagation();
        ui.notifications.notify(game.i18n.localize("IMPMAL.CannotEditWithDiffSheet"));
    }

    _onEditArrayElement(ev)
    {
        ev.stopPropagation();
        ui.notifications.notify(game.i18n.localize("IMPMAL.CannotEditWithDiffSheet"));
    }

    _onDeleteArrayElement(ev)
    {
        ev.stopPropagation();
        ui.notifications.notify(game.i18n.localize("IMPMAL.CannotEditWithDiffSheet"));
    }

    _onEditTraits(ev) 
    {
        ev.stopPropagation();
        ui.notifications.notify(game.i18n.localize("IMPMAL.CannotEditWithDiffSheet"));
    }

    _onChoiceConfig(ev) 
    {
        ev.stopPropagation();
        ui.notifications.notify(game.i18n.localize("IMPMAL.CannotEditWithDiffSheet"));
    }
}