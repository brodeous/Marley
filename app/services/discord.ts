import { CLIENT_ID, DISCORD_KEY } from '../config.js';
import { Client, GatewayIntentBits, TextChannel, ChannelType } from 'discord.js';
import { registerCommands } from '../utility/commands.js';
import { commandLog, error, info, okay, responseLog } from './logs.js';
import { deleteJob, saveGuild } from './db.js';
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
        registerCommands(CLIENT_ID as string);
        okay(`${c.user.tag} IS READY`);
        //sendMessage("1195917008273952908", "I am ready");
    });
    client.on('guildCreate', async (guild) => {
        await saveGuild(guild.id);
        okay(`GUILD SAVED`);
        registerCommands(CLIENT_ID as string);
        info(`joined ${guild.name}`);
    });
}

const sendMessage = async (channelID: string, message: string) => {
    info(`sending message to ${channelID}`);
    const channel = client.channels.cache.get(channelID) as TextChannel;

    const messages = message.split('\n');

    for (const message of messages) {
        await channel.send(message);
        okay(`message sent`);
    }
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
                registerCommands(CLIENT_ID as string);
            }

            if (interaction.commandName === 'test-system') {
                commandLog(interaction.commandName);
                testJob();
                await interaction.reply('Running test');
                responseLog('Running test');
                registerCommands(CLIENT_ID as string);
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
                registerCommands(CLIENT_ID as string);
            }

            if (interaction.commandName === 'update-link') {
                commandLog(interaction.commandName);
                await interaction.reply('updated');
                responseLog('updated');
                registerCommands(CLIENT_ID as string);
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
                registerCommands(CLIENT_ID as string);
            }
            
        } catch (e) {
            error(e);
        }
    });
}

export {
    initializeDiscord,
    sendMessage
};
