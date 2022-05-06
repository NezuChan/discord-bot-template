/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, MessageCommandDeniedPayload } from "@sapphire/framework";
import { MessageEmbed } from "discord.js";

@ApplyOptions<Listener.Options>({
    event: Events.MessageCommandDenied
})

export class messageCommandDenied extends Listener {
    public async run(error: Error, context: MessageCommandDeniedPayload) {
        await context.message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor("RANDOM")
                    .setDescription(`❌ | ${error.message}`)
            ]
        });
    }
}
