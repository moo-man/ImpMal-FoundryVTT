export class SocketHandlers
{
    static addTargetFlags(id)
    {
        if (game.user.isGM)
        {
            game.messages.get(id)?.test?.context.addTargetFlags();
        }
    }
}