/**
 * Easily handle and compute tooltips for dialog fields
 * 
 * Call #start to mark the initial values of the dialog
 * Call #finish to compare the initial with the current values
 */
export class DialogTooltips 
{
    _modifier = [];
    _SL = [];
    _difficulty = [];
    _advantage = [];
    _disadvantage = [];

    _modifier1 = null;
    _SL1 = null;
    _difficulty1 = null;
    _advantage1 = null;
    _disadvantage1 = null;

    _modifier2 = null;
    _SL2 = null;
    _difficulty2 = null;
    _advantage2 = null;
    _disadvantage2 = null;

    constructor()
    {

    }

    get modifier() 
    {
        return this._formatTooltip("modifier");
    }
    get SL() 
    {
        return this._formatTooltip("SL");
    }
    get difficulty() 
    {
        return this._formatTooltip("difficulty");
    }
    get advantage() 
    {
        return this._formatTooltip("advantage");
    }
    get disadvantage() 
    {
        return this._formatTooltip("disadvantage");
    }


    clear() 
    {
        this.reset();
        this._modifier = [];
        this._SL = [];
        this._difficulty = [];
        this._advantage = [];
        this._disadvantage = []; 
    }

    reset()
    {
        this._modifier1 = null;
        this._SL1= null;
        this._difficulty1 = null;
        this._advantage1 = null;
        this._disadvantage1 = null;

        this._modifier2 = null;
        this._SL2= null;
        this._difficulty2 = null;
        this._advantage2 = null;
        this._disadvantage2 = null;
    }

    start(dialog)
    {
        this.reset();
        this._modifier1 = dialog.fields.modifier;
        this._SL1 = dialog.fields.SL;
        this._difficulty1 = dialog.fields.difficulty;
        this._advantage1 = dialog.advCount;
        this._disadvantage1 = dialog.disCount; 
    }

    finish(dialog, label)
    {
        this._modifier2 = dialog.fields.modifier;
        this._SL1 = dialog.fields.SL;
        this._difficulty2 = dialog.fields.difficulty;
        this._advantage2 = dialog.advCount;
        this._disadvantage2 = dialog.disCount; 

        this._computeDiff(label);
    }

    addModifier(value, label)
    {
        this._addTooltip("modifier", value, label);
    }

    addSL(value, label)
    {
        this._addTooltip("SL", value, label);
    }

    addAdvantage(value, label)
    {
        this._addTooltip("advantage", value, label);
    }

    addDisadvantage(value, label)
    {
        this._addTooltip("disadvantage", value, label);
    }

    _addTooltip(type, value, label)
    {
        this[`_${type}`].push({value, label});
    }

    _computeDiff(label)
    {

        let modifierDiff =  this._modifier2 - this._modifier1;
        let SLDiff =    this._SL2 - this._SL1;
        let difficultyDiff = this._difficulty2 != this._difficulty1;
        let advantageDiff = this._advantage2 - this._advantage1;
        let disadvantageDiff =  this._disadvantage2 - this._disadvantage1;

        if (modifierDiff)
        {
            this._modifier.push({value : modifierDiff, label});
        }

        if (SLDiff)
        {
            this._SL.push({value : SLDiff, label});
        }

        if (difficultyDiff)
        {
            this._difficulty.push({label});
        }

        if (advantageDiff)
        {
            this._advantage.push({value : advantageDiff, label});
        }

        if (disadvantageDiff)
        {
            this._disadvantage.push({value : disadvantageDiff, label});
        }
    }

    _formatTooltip(type)
    {
        if (this[`_${type}`].length == 0)
        {
            return "";
        }
        else 
        {
            return `<p>${this[`_${type}`].map(i => 
            {
                if (i.value)
                {
                    // Add sign to positive numbers
                    return `&#8226; ${i.label} (${i.value > 0 ? "+" + i.value : i.value})`;
                }
                else 
                { 
                    return `&#8226; ${i.label}`; 
                }

            }).join("</p><p>")}</p>`;
        }   
    }
}