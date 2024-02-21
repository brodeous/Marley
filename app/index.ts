import { createServer } from 'http';
import { PORT } from './config.js';
import { initializeDiscord } from "./services/discord.js";
import { getGuilds } from './services/db.js';
import { info, error, okay } from './services/logs.js';

const server = createServer((req, res) => {
    res.write('ok');
    res.end();
});

const runServer = async () => {
    try {
        await getGuilds();
        okay(`DATABASE CONNECTED`);
        await initializeDiscord();
        okay(`DISCORD CLIENT INITIALIZED`);
        server.listen(PORT, () => info(`Listening on port ${PORT}`));
    } catch (err) {
        error(err);
    }
}

runServer();
