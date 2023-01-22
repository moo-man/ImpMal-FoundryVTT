import { TestDialog } from "../../apps/test-dialog/test-dialog";

export default function() 
{
    Hooks.on("targetToken", () => 
    {
        TestDialog.updateActiveDialogTargets();
    });
}