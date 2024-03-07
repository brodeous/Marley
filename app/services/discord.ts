import { CLIENT_ID, DISCORD_KEY } from '../config.js';
import { Client, GatewayIntentBits, TextChannel, ChannelType } from 'discord.js';
import { registerCommands } from '../utility/commands.js';
import { commandLog, error, info, okay, responseLog, warn } from './logs.js';
import { deleteJob, getJob, getJobs, saveGuild, updateJob } from './db.js';
import { testJob, createJob, runJob } from './jobs.js';

let client: Client<boolean>;

const initializeDiscord = async ():Promise<Client<boolean>> => {
    if (client) return client;
    
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    });
    await client.login(DISCORD_KEY as string);
    handleEvents(client);
    handleCommands(client);
    return client;
}

const handleEvents = async (client: Client<boolean>) => {
    client.on('ready', (c: any) => {
        okay(`${c.user.tag} IS READY`);
    });
    client.on('guildCreate', async (guild) => {
        await saveGuild(guild.id);
        okay(`GUILD SAVED`);
        await registerCommands(CLIENT_ID as string, guild.id);
        info(`joined ${guild.name}`);
    });
}

const sendMessage = async (channelID: string, message: string) => {
    info(`sending message to ${channelID}`);
    const channel = client.channels.cache.get(channelID) as TextChannel;

    const messages = message.split('\n');

    for (const message of messages) {
        await channel.send(message);
    }
    okay(`message sent`);
}

const handleCommands = async (client: Client<boolean>) => {
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;

            const guildID = interaction.guild?.id;
            if (!guildID) {
                await interaction.reply('Guild not found');
                return;
            }

            if (interaction.commandName === 'ping') {
                commandLog(interaction.commandName);
                await interaction.reply('Pong!');
                responseLog('Pong!');
                await registerCommands(CLIENT_ID as string, guildID);
            }

            if (interaction.commandName === 'test-system') {
                commandLog(interaction.commandName);
                testJob();
                await interaction.reply('Running test');
                responseLog('Running test');
                await registerCommands(CLIENT_ID as string, guildID);
            }

            if (interaction.commandName === 'create-job') {
                info(`${interaction.commandName}`);

                // Grab options
                const name = interaction.options.getString('name');
                const url = interaction.options.getString('url');
                const selector = interaction.options.getString('selector');
                const interval = interaction.options.getInteger('interval');
                const active = interaction.options.getBoolean('active') ?? true;
                const channel = interaction.options.getChannel('channel') || interaction.channel;
                
                if (!name || !url || !selector || !interval) {
                    await interaction.reply('Missing required options');
                    return;
                }

                if (channel?.type !== ChannelType.GuildText) {
                    await interaction.reply('Channel must be a text channel');
                    return;
                }

                await createJob({
                    name,
                    url,
                    selector,
                    active,
                    interval,
                    channelID: channel.id,
                    Guild: {
                        connect: {
                            id: interaction.guild?.id,
                        },
                    },
                });
                
                //console.log(`${interaction.guildId}`);

                await interaction.reply(`job ${name} created`);
                await registerCommands(CLIENT_ID as string, guildID);
            }

            if (interaction.commandName === 'delete-job') {
                info(`${interaction.commandName}`);

                const name = interaction.options.getString('name');

                if (!name) {
                    await interaction.reply('Missing required options');
                    return
                }

                await deleteJob(guildID, name);
                
                await interaction.reply('deleted');
                okay('DELETED');
                await registerCommands(CLIENT_ID as string, guildID);
            }

            if (interaction.commandName === 'disable-job') {
                info(`${interaction.commandName}`);

                const name = interaction.options.getString('name');

                if (!name) {
                    await interaction.reply('Missing required options');
                    return
                }
                
                await updateJob(guildID, name, { active: false });
                okay(`JOB '${name}' DISABLED`);
                await interaction.reply(`Job '${name}' disabled`);
                await registerCommands(CLIENT_ID as string, guildID);
            }

            if (interaction.commandName === 'enable-job') {
                info(`${interaction.commandName}`);

                const name = interaction.options.getString('name');

                if (!name) {
                    await interaction.reply('Missing required options');
                    return
                }

                await updateJob(guildID, name, { active: true });
                okay(`JOB '${name}' ENABLED`);
                await interaction.reply(`Job '${name}' enabled`);
                await registerCommands(CLIENT_ID as string, guildID);
            }

            if (interaction.commandName === 'update-job') {
                info(`${interaction.commandName}`);

                const name = interaction.options.getString('name');
                const url = interaction.options.getString('url');
                const selector = interaction.options.getString('selector');
                const interval = interaction.options.getInteger('interval');
                const active = interaction.options.getBoolean('active') ?? true;
                const channel = interaction.options.getChannel('channel') || interaction.channel;

                if (!name) {
                    await interaction.reply(`Missing required options`);
                    return
                }

                if (channel?.type !== ChannelType.GuildText) {
                    await interaction.reply(`Channel must be a text channel`);
                    return
                }

                const jobExists = await getJob(guildID, name);

                if (!jobExists) {
                    await interaction.reply(`Job '${name}' does not exist`);
                    warn(`A non-existent job requested from database`);
                }

                await updateJob(guildID, name, {
                    ...(name && { name }),
                    ...(url && { url }),
                    ...(selector && { selector }),
                    ...(interval && { interval }),
                    ...(active && { active }),
                    ...(channel && { channelID: channel.id }),
                });

                okay(`JOB '${name}' UPDATED`);
                await interaction.reply(`Job '${name}' updated`);
                await registerCommands(CLIENT_ID as string, guildID);
            }
            
            if (interaction.commandName === 'run-job') {
                info(`${interaction.commandName}`);

                const name = interaction.options.getString('name');

                if (!name) {
                    await interaction.reply(`Missing required options`);
                    return
                }

                const job = await getJob(guildID, name);

                if (!job) {
                    await interaction.reply(`Job '${name}' not found`);
                    warn(`A non-existent job requested from database`);
                    return
                }

                await interaction.reply(`Job '${name}' running`);
                runJob(job);
                await registerCommands(CLIENT_ID as string, guildID);
            }

            if (interaction.commandName === 'list-jobs') {
                info(`${interaction.commandName}`);
                
                const jobs = await getJobs(guildID);
                okay(`JOBS RECIEVED`);

                await interaction.reply(`${jobs.length} job${jobs.length > 1 ? 's' : ''} found: \n
                                        ${jobs.map(({name, url, selector, interval, active}) =>
                                                   `**${name}** \n url: ${url} \n selector: ${selector} \n interval: ${interval} \n active: ${active}`)
                                                   .join(`\n\n`)}`
                                        );
                await registerCommands(CLIENT_ID as string, guildID);
            }

        } catch (err) {
            error(err);
            if (interaction.isChatInputCommand())
                await interaction.reply(`Error with processing command`);
        }
    });
}

export {
    initializeDiscord,
    sendMessage
};
