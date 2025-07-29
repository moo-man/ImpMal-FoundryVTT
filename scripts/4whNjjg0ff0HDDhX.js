if (args.equipped) {
    let arm = await foundry.applications.api.Dialog.wait({
        window: { title: this.item.name },
        content: "<p class='centered'>Choose Arm</p>",
        buttons: [
            {
                action: "leftArm",
                label: "Left Arm",
            },
            {
                action: "rightArm",
                label: "Right Arm",
            }
        ]
    });

    if (arm)
    {
        this.item.setFlag("impmal", "arm", arm)
    }
}
else 
{
    this.item.unsetFlag("impmal", "arm");
}