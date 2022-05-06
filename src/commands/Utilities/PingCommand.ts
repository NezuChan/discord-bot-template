import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@zhycorporg/command-context";

@ApplyOptions<Command.Options>({
    name: "ping",
    description: "Ping Pong with the bot !"
})

export class PingCommand extends ContextCommand {
    public async contextRun(context: CommandContext) {
        const message = await context.send({ content: "Pong !" }, true);
        return message.edit({ content: `Pong ! (Took ${message.createdTimestamp - context.createdTimestamp}ms)` });
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        });
    }
}
