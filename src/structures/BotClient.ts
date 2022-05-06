import { LogLevel, SapphireClient } from "@sapphire/framework";
import { Intents } from "discord.js";
import { BackTracker } from "backtracker";
import { cyan, gray, magenta, white } from "colorette";

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import "@sapphire/plugin-logger/register";

class BotClient extends SapphireClient {
    public constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES
            ],
            fetchPrefix: () => process.env.PREFIX ?? "b!",
            baseUserDirectory: resolve(dirname(fileURLToPath(import.meta.url)), ".."),
            caseInsensitiveCommands: true,
            caseInsensitivePrefixes: true,
            loadDefaultErrorListeners: process.env.NODE_ENV === "development",
            loadMessageCommandListeners: true,
            failIfNotExists: false,
            defaultCooldown: { limit: 3, delay: 3000 },
            logger: {
                defaultFormat: {
                    timestamp: {
                        formatter: (timestamp: string) => `${gray(timestamp)} `
                    },
                    message: (text: number | string) => `- ${magenta(process.pid)} --- [${" ".repeat(10 - (this.user?.username.length ?? 7) < 1 ? 1 : 10 - (this.user?.username.length ?? 7))}${this.user?.username ?? "Process"}] ${cyan(`${this.scope()}${" ".repeat((15 - this.scope().length) < 1 ? 1 : 15 - this.scope().length)}${white(`: ${text}`)}`)}`
                },
                level: process.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info
            }
        });
    }

    public scope() {
        const first = BackTracker.stack[BackTracker.stack.length - 1];
        return `${first.filename.replace(/\.js$/, "")}:${first.line}:${first.column}`;
    }
}

const ClientUser = new BotClient();
await ClientUser.login();
