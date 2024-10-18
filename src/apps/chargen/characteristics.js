import { ChargenStage } from "./stage";

const Step = {NOT_STARTED : 0, FIRST_ROLL : 1, SWAPPING : 2, REROLL : 3, ALLOCATING : 4}

export class CharacteristicsStage extends ChargenStage {

  journalId = "Compendium.impmal-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.GaZa9sU4KjKDswMr"
  static get defaultOptions() {
  const options = super.defaultOptions;
    options.resizable = true;
    options.width = 400;
    options.height = 785;
    options.classes.push("characteristics");
    options.minimizable = true;
    options.title = game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Characteristics");
    return options;
  }

  static get title() { return game.i18n.localize("IMPMAL.CHARGEN.StageTitle.Characteristics"); }
  get template() { return "systems/impmal/templates/apps/chargen/characteristics.hbs"; }



  constructor(...args) {
    super(...args);

    // Step 1: First roll, Step 2: Swapping, Step 3: Reroll, Step 4: Allocating 
    this.context.step = Step.NOT_STARTED;
    this.context.characteristics = {
      ws: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      bs: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      str: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      tgh: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      ag: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      int: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      per: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      wil: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
      fel: { formula: "2d10 + 20", roll: 0, add: 0, total: 0, allocated: 0, advances: 0 },
    }

    this.context.allocation = {
      total : 90,
      spent : 0
    }
  }

  async getData() {
    let data = await super.getData();
    this.calculateTotals();

    if (this.context.step <= Step.FIRST_ROLL) {
      this.context.exp = 50;
    }
    else if (this.context.step == Step.SWAPPING && !this.context.hasRerolled) {
      this.context.exp = 25;
    }

    else
      this.context.exp = 0;

    return data;
  }

  async rollCharacteristics(ev, step) {
    if (step)
      this.context.step = step;
    else
      this.context.step++;

    if (this.context.step == Step.FIRST_ROLL)
    {
      await this.updateMessage("RolledCharacteristics")
    }
    else if (this.context.step == Step.REROLL)
    {
      await this.updateMessage("ReRolledCharacteristics")
    }

    for (let ch in this.context.characteristics) {
      let [roll, bonus] = this.context.characteristics[ch].formula.split("+").map(i => i.trim());
      roll = roll || "2d10";
      bonus = Number(bonus) || 0;
      this.context.characteristics[ch].roll = (await new Roll(roll).roll({async : true})).total;
      this.context.characteristics[ch].add = bonus;
      this.context.characteristics[ch].allocated = 0;
    }

    this.context.rolledCharacteristics = duplicate(this.context.characteristics) // Used to restore roll if user goes back a step

    this.calculateTotals();

    this.updateMessage(undefined, undefined, `
    <div class="flexcol" style="text-align: center">
      <div class="flexrow">
        <div>
          ${Object.keys(this.context.characteristics)
            .map(i => game.impmal.config.characteristicAbbrev[i])
            .join("</div><div>")
          }
        </div>
      </div>
      <div class="flexrow">
        <div>
        ${Object.values(this.context.characteristics)
          .map(i => i.total)
          .join("</div><div>")
        }
        </div>
      </div>
    </div>
    `)

    this.render();
  }

  calculateTotals() {
    this.context.allocation.spent = 0;
    this.context.advances = 0
    for (let ch in this.context.characteristics) {
      let characteristic = this.context.characteristics[ch];
      let base = this.context.step == Step.ALLOCATING ? characteristic.allocated : characteristic.roll
      characteristic.starting = base + Number(characteristic.add);
      characteristic.total = characteristic.starting +  Number(characteristic.advances);
      this.context.allocation.spent += characteristic.allocated;
      this.context.advances += Number(characteristic.advances) // Used for validation, cannot be above 5
    }
  }

  validateTotals() {
    this.calculateTotals()
    let valid = true
    if (this.context.allocation.spent > this.context.allocation.total)
    {
      this.showError("CharacteristicAllocation")
      valid = false
    }

    if (this.context.step == Step.ALLOCATING)
    {
      let inBounds = true
      for (let ch in this.context.characteristics) {
        let characteristic = this.context.characteristics[ch];
        if (characteristic.allocated < 4 || characteristic.allocated > 18)
          inBounds = false
      }

      if(!inBounds)
      {
        this.showError("CharacteristicAllocationBounds")
        valid = false;
      }
    }


    return valid
  }

  validate() {
    return super.validate() && this.validateTotals();
  }

  swap(ch1, ch2) {
    if (this.context.step < Step.SWAPPING)
      this.context.step = Step.SWAPPING;

    let ch1Roll = duplicate(this.context.characteristics[ch1].roll);
    let ch2Roll = duplicate(this.context.characteristics[ch2].roll);

    this.context.characteristics[ch1].roll = ch2Roll;
    this.context.characteristics[ch2].roll = ch1Roll;

    this.updateMessage("SwappedCharacteristics", {ch1 : game.impmal.config.characteristics[ch1], ch2: game.impmal.config.characteristics[ch2]})

    this.render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);
    const dragDrop = new DragDrop({
      dragSelector: '.ch-drag',
      dropSelector: '.ch-drag',
      permissions: { dragstart: () => true, drop: () => true },
      callbacks: { drop: this.onDropCharacteristic.bind(this), dragstart: this.onDragCharacteristic.bind(this) },
    });

    dragDrop.bind(html[0]);


    html.find(".meta input").on("change", (ev) => {
      // Bind value to be nonnegative
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      this.context.meta[ev.currentTarget.dataset.meta].allotted = Number(ev.currentTarget.value);
      this.render(true);
    });

    html.find(".ch-allocate").on("change", (ev) => {
      // Bind value to be nonnegative
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      if (ev.currentTarget.value > 18 || ev.currentTarget.value < 4)
      {
        this.showError("CharacteristicAllocationBounds")
        ev.currentTarget.value = 0
        return 
      }
      this.context.characteristics[ev.currentTarget.dataset.ch].allocated = Number(ev.currentTarget.value);
      this.render(true);
    });

    html.find(".ch-advance").on("change", ev => {
      // Bind value to be nonnegative
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      this.context.characteristics[ev.currentTarget.dataset.ch].advances = Number(ev.currentTarget.value);
      this.render(true);
    });
  }

  reroll(ev) {
    this.context.hasRerolled = true
    // Set to step 3
    this.rollCharacteristics(ev, 3);
  }

  allocate(ev) {
    this.context.step = Step.ALLOCATING;
    this.updateMessage("AllocateCharacteristics")

    this.render(true);
  }

  rearrange(ev)
  {
    this.context.step = Step.SWAPPING
    this.render(true);
  }

  // Cancel allocation or swapping, restore to the last rolled characteristic
  cancel(ev)
  {
    if (this.context.hasRerolled)
    this.context.step = Step.REROLL
    else 
      this.context.step = Step.FIRST_ROLL
    this.context.characteristics = duplicate(this.context.rolledCharacteristics)
    this.render(true)
  }

  _updateObject(ev, formData) {
    for (let ch in this.context.characteristics) {
      this.data.characteristics[ch] = { starting: this.context.characteristics[ch].starting, advances: this.context.characteristics[ch].advances };
    }
    this.data.exp.characteristics = this.context.exp;
    super._updateObject(ev, formData)
  }

  onDragCharacteristic(ev) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ ch: ev.currentTarget.dataset.ch }));
  }

  onDropCharacteristic(ev) {
    if (ev.currentTarget.dataset.ch) {
      let ch = JSON.parse(ev.dataTransfer.getData("text/plain")).ch;
      this.swap(ev.currentTarget.dataset.ch, ch);
    }
  }
}
