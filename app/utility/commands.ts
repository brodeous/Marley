import { DISCORD_KEY } from '../config.js';
import { REST, Routes, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { info, error, okay } from '../services/logs.js';
import { Job } from '@prisma/client';
import { getJobs } from '../services/db.js';


const existingJobOption = (jobs: Job[]) => (option: SlashCommandStringOption) => 
    option
        .setName('name')
        .setDescription('Name of Job')
        .setRequired(true)
        .addChoices(...jobs.map((job) => ({ name: job.name, value: job.name })));

const getCommands = (jobs: Job[]) => [
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
        .setName('delete-job')
        .setDescription('Delete Job')
        .addStringOption(existingJobOption(jobs)),
    new SlashCommandBuilder()
        .setName('disable-job')
        .setDescription('Disable a running job')
        .addStringOption(existingJobOption(jobs.filter((job) => job.active))),
    new SlashCommandBuilder()
        .setName('enable-job')
        .setDescription('Enable a inactive job')
        .addStringOption(existingJobOption(jobs.filter((job) => !job.active))),
    new SlashCommandBuilder()
        .setName('update-job')
        .setDescription('Update existing job')
        .addStringOption(existingJobOption(jobs))
        .addStringOption((option) => option.setName('url').setDescription('URL to scrape'))
        .addStringOption((option) => option.setName('selector').setDescription('Query selector to a link'))
        .addIntegerOption((option) => option.setName('interval').setDescription('Interval between jobs'))
        .addBooleanOption((option) => option.setName('active').setDescription('Is job active'))
        .addChannelOption((option) => option.setName('channel').setDescription('Channel to recieve links')),
    new SlashCommandBuilder()
        .setName('run-job')
        .setDescription('Run a specific job')
        .addStringOption(existingJobOption(jobs)),
    new SlashCommandBuilder()
        .setName('list-jobs')
        .setDescription('List all jobs for current server'),
    new SlashCommandBuilder()
        .setName('test-system')
        .setDescription('Test system'),
];

const registerCommands = async (clientID: string, guildID: string) => {
    const rest = new REST({ version: '10' }).setToken(DISCORD_KEY as string);
    try {
        info('registering commands');
        const jobs = await getJobs(guildID);
        okay(`JOBS RECIEVED`);
        await rest.put(Routes.applicationCommands(clientID), {
            body: getCommands(jobs),
        });
    } catch (e) {
        error(e);
    }
}

export { registerCommands };
