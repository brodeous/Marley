import { createServer } from 'http';
import { PORT } from './config.js';
import { initializeDiscord } from "./services/discord.js";
import { initializeDB } from './services/db.js';
import { info, error, okay } from './services/logs.js';

const server = createServer((req, res) => {
    res.write('ok');
    res.end();
});

const runServer = async () => {
    try {
        info(`INITIALIZING DATABASE`);
        await initializeDB();
        info(`INITIALIZING DISCORD CLIENT`);
        await initializeDiscord();
        server.listen(PORT, () => info(`Listening on port ${PORT}`));
    } catch (err) {
        error(err);
    }
}

runServer();
