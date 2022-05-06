import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@zhycorporg/command-context";
import { MessageEmbed, Formatters } from "discord.js";
import { inspect } from "node:util";

@ApplyOptions<Command.Options>({
    name: "eval",
    description: "Evaluates a JavaScript Code",
    quotes: [],
    preconditions: ["ownerOnly"]
})

export class EvalCommand extends ContextCommand {
    public async contextRun(context: CommandContext) {
        const userArgument = await this.getArgument(context);

        if (!userArgument) {
            return context.send({
                embeds: [
                    new MessageEmbed()
                        .setColor("RANDOM")
                        .setDescription("❌ | You need input code that will evaluated.")
                ]
            });
        }

        const code = userArgument.replace(/`/g, `\`${String.fromCharCode(8203)}`)
            .replace(/@/g, `@${String.fromCharCode(8203)}`)
            .replace(this.container.client.token!, "[Censored]");

        try {
            // eslint-disable-next-line no-eval
            let { evaled } = await EvalCommand.parseEval(eval(code));
            if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 0 });
            await context.send({
                content: Formatters.codeBlock("js", evaled)
            });
        } catch (e: any) {
            await context.send({
                content: Formatters.codeBlock("js", (e as Error).message)
            });
        }
    }

    public async getArgument(context: CommandContext) {
        if (context.isCommandInteractionContext()) {
            return context.options.getString("code", true);
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
                    name: "code",
                    required: true,
                    type: "STRING",
                    description: "The code you want to evaluate."
                }
            ]
        });
    }

    public static parseType(input: any): string {
        if (input instanceof Buffer) {
            let length = Math.round(input.length / 1024 / 1024);
            let ic = "MB";
            if (!length) {
                length = Math.round(input.length / 1024);
                ic = "KB";
            }
            if (!length) {
                length = Math.round(input.length);
                ic = "Bytes";
            }
            return `Buffer (${length} ${ic})`;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return input === null || input === undefined ? "Void" : input.constructor.name;
    }

    public static async parseEval(input: any): Promise<{ evaled: string; type: string }> {
        const isPromise =
            input instanceof Promise &&
            typeof input.then === "function" &&
            typeof input.catch === "function";
        if (isPromise) {
            input = await input;
            return {
                evaled: input,
                type: `Promise<${EvalCommand.parseType(input)}>`
            };
        }
        return {
            evaled: input,
            type: EvalCommand.parseType(input)
        };
    }
}
