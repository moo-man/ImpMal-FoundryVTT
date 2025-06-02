export default SheetMixin = (cls) => class extends cls 
{
    static DEFAULT_OPTIONS = {
        actions : {
            createFaction : this._onFactionCreate,
            deleteFaction : this._onFactionDelete,
            toggleConditionPip : this._onPipToggle
        },
      }
      
      formatConditions()
      {
          let conditions = foundry.utils.deepClone(CONFIG.statusEffects);
          conditions.forEach(c =>
          {
              c.boolean = !game.impmal.config.tieredCondition[c.id];
              c.existing = this.document.hasCondition(c.id);
              c.opacity = 30;
  
              // Conditions have 1 or 2 pips, two for minor/major
              // If condition existis on actor, it must have at least one filled pip
              c.pips = [{filled : c.existing, type : "minor"}]; 
  
              // If not boolean (minor/major), add another pip, filled if major
              if (!c.boolean) 
              {
                  c.pips.push({filled : c.existing?.isMajor, type : "major"});
              }
  
              if ((c.boolean && c.existing) || c.existing?.isMajor)
              {
                  c.opacity = 100;
              }
              else if (c.existing?.isMinor)
              {
                  c.opacity = 60;
              }
          });
          return conditions;
      }

      static _onPipToggle(ev, target)
      {
          let key = target.dataset.key;
          let type = target.dataset.type;
          let existing = this.document.hasCondition(key);
  
          if (!existing || (existing?.isMinor && type == "major"))
          {
              this.document.addCondition(key, type);
          }
          else 
          {
              this.document.removeCondition(key);
          }
      }
  
      static _onFactionDelete(ev)
      {
          ev.stopPropagation();
          let path = this._getPath(ev);
          let faction = this._getType(ev);
  
          foundry.applications.api.Dialog.confirm({
              window : {title: game.i18n.localize(`IMPMAL.DeleteFaction`)},
              content: `<p>${game.i18n.localize(`IMPMAL.DeleteFactionConfirmation`)}</p>`,
              yes: {
                default: true, 
                callback : () => {this.document.update(foundry.utils.deepClone(foundry.utils.getProperty(this.document, path).deleteFaction(faction)));
              }},
          });
      }
  
      
      static _onFactionCreate(ev)
      {
          let path = this._getPath(ev);
          new foundry.applications.api.Dialog({
              window : {title : game.i18n.localize("IMPMAL.AddInfluence")},
              content : `
                  <div class="form-group">
                      <label>${game.i18n.localize("IMPMAL.Faction")}</label>
                      <input type="text" name="faction" list="factions">
                      <datalist id="factions">
                      ${Object.keys(game.impmal.config.factions).map(f => `<option>${game.impmal.config.factions[f]}</option>`)}
                      </datalist>
                  </div>`,
              buttons : [
                  {
                      type : "submit",
                      label : game.i18n.localize("Submit"),
                      callback: (event, button, dialog) =>
                      {
                          let faction = button.form.elements.faction.value
                          this.document.update(foundry.utils.deepClone(foundry.utils.getProperty(this.document, path).createFaction(faction)));
                      }
                  }
                ],
              default : "submit"
          }).render(true);
      }
  
      static _onScriptConfig(ev)
      {
          new WarhammerScriptEditor(this.document, {path : this._getPath(ev)}).render(true);
      }
  
      
      // Normal actors can update patron actors from their sheet
      // This helper checks whether the document was a patron (or its embedded documents)
      _isPatronDocument(document)
      {
          return this.document.id != document.id &&
              ((document.documentName == "Actor" && document.type == "patron") || 
              (document.actor?.type == "patron"));
      }
      
}