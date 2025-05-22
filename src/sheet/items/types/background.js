import IMItemSheet from "../item-sheet-v2.js";

export default class BackgroundSheet extends IMItemSheet
{

    static DEFAULT_OPTIONS = {
      classes: ["background"],
    }
  

    _onChangeCheckbox(ev, target)
    {
      let path = this._getPath(ev);
      let value = ev.target.dataset.value;
      let array = foundry.utils.deepClone(foundry.utils.getProperty(this.document, path));
      if (ev.currentTarget.checked)
      {
          array.push(value);
      }
      else 
      {
          array = array.filter(v => v != value);
      }
      this.document.update({[path] : array});
    }

    async _onRender(options)
    {
      await super._onRender(options)
      this.element.querySelectorAll(".characteristics input[type='checkbox']").forEach(e => e.addEventListener("change", this._onChangeCheckbox.bind(this)))
      this.element.querySelectorAll(".skills input[type='checkbox']").forEach(e => e.addEventListener("change", this._onChangeCheckbox.bind(this)))

    }
}