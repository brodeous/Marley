import { createServer } from 'http';
import { PORT } from './config.js';
import { initializeDiscord, sendMessage } from "./services/discord.js";
import { prisma } from './services/db.js';



const server = createServer((req, res) => {
    res.write('ok');
    res.end();
});

const runServer = async () => {
    try {
        const guilds = await prisma.guild.findMany();
        const client = await initializeDiscord();
        if (!guilds) {
            throw new Error("Database not connected!");
        }
        if (!client) {
            throw new Error("Discord Client not instantiated!");
        }
        server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    } catch (e) {
        console.error('ERROR:', e);
    }
}

runServer();
