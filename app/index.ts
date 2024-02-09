import { createServer } from 'http';
import { PORT } from './config';
import { initializeDiscord, sendMessage } from "./services/discord.js";


const client = await initializeDiscord();

const server = createServer((req, res) => {
    res.write('ok');
    res.end();
});

const runServer = () => {
    server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}

runServer();
