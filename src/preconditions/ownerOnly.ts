/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { ApplyOptions } from "@sapphire/decorators";
import { Precondition } from "@sapphire/framework";
import { CommandContext, ContextPrecondition } from "@zhycorporg/command-context";
import { Snowflake, Team } from "discord.js";

@ApplyOptions<Precondition.Options>({
    name: "ownerOnly"
})

export class ownerOnly extends ContextPrecondition {
    public owners: Snowflake[] = [];

    public async contextRun(ctx: CommandContext) {
        if (!this.owners.length) {
            const developerId = await this.container.client.application?.fetch();
            if (developerId && developerId.owner instanceof Team) {
                for (const [ownerId] of developerId.owner.members) {
                    if (!this.owners.includes(ownerId)) this.owners.push(ownerId);
                    continue;
                }
            } else if (!this.owners.includes(developerId?.owner?.id!)) { this.owners.push(developerId?.owner?.id!); }
        }

        if (this.owners.includes(ctx.author.id)) return this.ok();
        return this.error({ message: "You are not the owner of this bot." });
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        ownerOnly: never;
    }
}
