import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const getCommands = () => [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),
    new SlashCommandBuilder()
        .setName('create-test')
        .setDescription('create')
        .addStringOption((option) => option.setName('test').setDescription('create test')),
];

const registerCommands = async (clientID: string) => {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_API_KEY as string);
    try {
        console.log('registering commands');
        await rest.put(Routes.applicationCommands(clientID), {
            body: getCommands(),
        });
    } catch (e) {
        console.error(e);
    }
}

export { registerCommands };
