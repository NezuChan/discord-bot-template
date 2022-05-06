/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@zhycorporg/command-context";
import { MessageEmbed } from "discord.js";

@ApplyOptions<Command.Options>({
    name: "help",
    description: "Get a list of all commands or get help for a specific command."
})

export class HelpCommand extends ContextCommand {
    public async contextRun(context: CommandContext) {
        const userArgument = await this.getArgument(context);

        if (userArgument) {
            const command = this.container.stores.get("commands").get(userArgument);
            if (!command) {
                return context.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor("RANDOM")
                            .setDescription(`❌ | Could not find command with name ${userArgument}.`)
                    ]
                });
            }

            return context.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("RANDOM")
                        .addField("Command description", command.description ?? "No description available.")
                        .addField("Command aliases", command.aliases.length ? command.aliases.join(", ") : "No aliases available.")
                ]
            });
        }

        const categories = [...new Set(this.container.stores.get("commands").filter(x => x.chatInputRun !== undefined).map(x => x.fullCategory[x.fullCategory.length - 1]))];

        const embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle("Available commands");

        for (const category of categories) {
            const commands = this.container.stores.get("commands").filter(x => x.fullCategory[x.fullCategory.length - 1] === category && x.chatInputRun !== undefined);
            embed.fields.push({
                name: category,
                value: commands.map(x => `\`/${x.name}\``).join(", "),
                inline: false
            });
        }

        return context.send({ embeds: [embed] });
    }

    public async getArgument(context: CommandContext) {
        if (context.isCommandInteractionContext()) {
            return context.options.getString("command", false);
        }

        if (context.isMessageContext()) {
            const { value } = await context.args!.restResult("string");
            return value ?? null;
        }

        return null;
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "command",
                    required: false,
                    type: "STRING",
                    description: "The name of the command you want to get help for."
                }
            ]
        });
    }
}
