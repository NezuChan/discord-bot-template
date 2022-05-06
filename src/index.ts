import { ShardingManager } from "discord.js";

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ShardingClient = new ShardingManager(resolve(dirname(fileURLToPath(import.meta.url)), "structures", "BotClient.js"), {
    totalShards: "auto",
    token: process.env.DISCORD_TOKEN
});

await ShardingClient.spawn();
