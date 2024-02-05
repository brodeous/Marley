import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

const getCommands = () => [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),
    new SlashCommandBuilder()
        .setName('create-link')
        .setDescription('Create link to scrap'),
    new SlashCommandBuilder()
        .setName('update-link')
        .setDescription('Update Link'),
    new SlashCommandBuilder()
        .setName('delete-link')
        .setDescription('Delete Link'),
    new SlashCommandBuilder()
        .setName('test-system')
        .setDescription('Test system'),
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
