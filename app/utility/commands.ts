import { DISCORD_KEY } from '../config.js';
import { REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { info, error } from '../services/logs.js';

const getCommands = () => [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong'),
    new SlashCommandBuilder()
        .setName('create-job')
        .setDescription('Create job to be performed')
        .addStringOption((option) => option.setName('name').setDescription('Name of Job').setRequired(true))
        .addStringOption((option) => option.setName('url').setDescription('URL to scrape').setRequired(true))
        .addStringOption((option) => option.setName('selector').setDescription('Query selector to a link').setRequired(true))
        .addIntegerOption((option) => option.setName('interval').setDescription('Interval between jobs').setRequired(true))
        .addBooleanOption((option) => option.setName('active').setDescription('Is job active'))
        .addChannelOption((option) => option.setName('channel').setDescription('Channel to recieve links')),
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
    const rest = new REST({ version: '10' }).setToken(DISCORD_KEY as string);
    try {
        info('registering commands');
        await rest.put(Routes.applicationCommands(clientID), {
            body: getCommands(),
        });
    } catch (e) {
        error(e);
    }
}

export { registerCommands };
