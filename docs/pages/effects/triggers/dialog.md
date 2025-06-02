---
layout: default
title: Dialog
parent: Scripts
nav_order: 2
grand_parent: Active Effects
---

Dialog scripts show up within the **Dialog Modifiers** section in roll dialog windows, and are able to be toggled on or off, causing some sort of behavior. They are probably the most powerful type of script, especially when used in conjunction with other scripts. They are unique in that they have their main script, which is generally used to modify the dialog fields (adding to modifier, SL bonus, etc.), but they also have 3 subscripts, described below. 

- Hide Script: Returning true with this script hides the option from selection, taking precedent over Activate Script

- Activate Script: Returning true with this script results in this modifier being automatically activated in the dialog window (as opposed to manually clicking on the option)

- Submission Script: This script runs when this script is *activated* and the dialog is submitted. Usually this is for setting some special flag for another script to use. See the examples below. 


## Key

`dialog`

## Arguments 

The `args` parameter corresponds the dialog application itself. which has some useful properties. 

`args.actor` - Actor performing the test (important distinction to `this.actor` because of the targeter option (see **Special Features**))

`args.characteristic` - The characteristic being used for the roll

`args.skill` - If a skill is being used, it is available here

`args.skillItem` - Specialisation used, if available

`args.fields` - Specifically the editable properties (fields) in the dialog window

`args.advantage` - The number of "advantages"

`args.disadvantage` - The number of "disadvantages"

`args.fields` - Object of all the "fields" in the dialog

&emsp;`fields.modifier` - The modifier field

&emsp;`fields.SL` - The SL field

&emsp;`fields.difficulty` - The difficulty field

&emsp;`fields.fateAdvantage` - The Fate checkbox

&emsp;`fields.rapidFire` - The Rapid Fire checkbox

&emsp;`fields.burst` - The burst checkbox

&emsp;`fields.hitLocation` - The Hit Location field

`args.flags` - An object that is intended to freely be used by scripts, it is useful to prevent duplicate executions, such as for Talents that have been taken multiple times but should only execute once. 


There are a plethora of other properties available to look at, you can use the console command `ui.activeWindow` with a dialog in focus to see everything available.

{: .question}
Why isn't advantage/disadvantage in `fields`?

Advantage and Disadvantage are a bit complex in that they represent some "state" backed by some numerical values. 3 Advantage and 2 Disadvantage results in the Advantage state. You can alter these numerical values with `args.advantage` and `args.disadvantage`, and the resulting state will show in the dialog. 

## Special Features

With `Targeter` selected, a dialog effect is designated not to apply to yourself, but to anyone who targets you and opens a dialog. This is useful for effects that increase or decrease your defensive situation, such as "Disadvantage to anyone attacking you with a ranged weapon."

## Examples

### Intimidation Bonus

**Usage**: Add +10 to Intimidation Tests

#### Hide
```js
return args.skillItem?.name != "Intimidation"
```

#### Activate
```js
return args.skillItem?.name == "Intimidation"
```

#### Script
```js
args.fields.modifier += 10;
```

**Notes**: We hide the option if the skill isn't Intimidation, and we activate it if the skill is Intimidation. Once activated, it adds 10 to the modifier field

---
### Injured Eye

**Usage**: Now for something a little more complicated, where an eye injury causes disadvantage on any Ranged tests, as well as Awareness (Sight)

#### Hide
```js
return return !args.data.item?.system?.isRanged && args.data.skill != "awareness"
```

#### Activate
```js
return return args.data.item?.system?.isRanged || (args.data.skill == "awareness" && args.skillItem?.name == "Sight")

```

#### Script
```js
args.disadvantage++;

```

**Notes** We hide the test is the item used is not "ranged" AND the skill used isn't awareness. In other words, using a melee weapon or not the awareness skill hides the modifier. Then for activation, if the item used is ranged OR Awareness (Sight) is used, automatically activate.

Note that there is a case here where the modifier is shown, but not automatically activated. This is when just Awareness or any other specialisation of it is being rolled. When this occurse, it's up to the user to click on the modifier if the deemed appropriate. 

---
### Aim Talent

**Usage**: Add +10 when using Aim action, but Advantage if shooting at a specific location if the Talent has been taken more than once.

#### Hide
```js
return args.actor.system.combat.action != "aim" || !args.weapon?.system?.isRanged
```

#### Activate
```js
return args.weapon?.system?.isRanged && args.actor.system.combat.action == "aim"
```

#### Script
```js
args.fields.SL++;
if (args.fields.hitLocation != "roll" && this.item.system.taken >= 2)
{
    args.advantage++;
}
```

**Notes** Hide the modifier if the Actor isn't aiming, or isn't using ranged. Activate if they are aiming and using ranged. The script itself adds +1 SL, but also checks if the hit location field has been changed from "Roll" (meaning they are shooting a specific location), and the talent has been taken more than once. In this case, also add Advantage. 

---


### Submission Script Example

**Usage**: Disables an effect after it's been "used" in the dialog

#### Hide
```js
// No Hide script
```

#### Activate
```js
// No Activate script, this should be manually activated
```

#### Submission
```js
this.effect.update({disabled : true})
```

#### Script
```js
    args.advantage++;
```

**Notes** This disables the effect when the user clicks on the modifier in the dialog, granting them advantage. The effect can then be re-enabled manually whenever it can be used again.
