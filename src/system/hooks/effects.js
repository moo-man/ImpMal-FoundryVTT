import { ImpMalEffect } from "../../document/effect";

export default function() 
{
    Hooks.on("preCreateActiveEffect", ImpMalEffect._handleConditionCreation);
}