import { CLIENT_ID, DISCORD_KEY } from '../config.js';
import { Client, GatewayIntentBits, TextChannel, ChannelType } from 'discord.js';
import { registerCommands } from '../utility/commands.js';
import { commandLog, responseLog } from './logs.js';
import { testJob } from './jobs.js';

let client: Client<boolean>;

const initializeDiscord = async () => {
    if (client) return client;
    
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    });
    handleEvents(client);
    handleCommands(client);
    await client.login(DISCORD_KEY as string);
    return client;
}

const handleEvents = (client: Client<boolean>) => {
    client.on('ready', (c: any) => {
        console.log(`${c.user.tag} is ready`);
        registerCommands(CLIENT_ID as string);
        sendMessage("1195917008273952908", "I am ready");
    });
    client.on('guildCreate', (guild) => {
        console.log(`Joined ${guild.name}`);
    });
}

const sendMessage = async (channelID: string, message: string) => {
    console.log(`Sending message to ${channelID}`);
    const channel = client.channels.cache.get(channelID) as TextChannel;

    const messages = message.split('\n');

    for (const message of messages) {
        await channel.send(message);
    }
}

const handleCommands = (client: Client<boolean>) => {
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;

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

            if (interaction.commandName === 'create-link') {
                commandLog(interaction.commandName);
                await interaction.reply('created');
                responseLog('created');
                registerCommands(CLIENT_ID as string);
            }

            if (interaction.commandName === 'update-link') {
                commandLog(interaction.commandName);
                await interaction.reply('updated');
                responseLog('updated');
                registerCommands(CLIENT_ID as string);
            }

            if (interaction.commandName === 'delete-link') {
                commandLog(interaction.commandName);
                await interaction.reply('deleted');
                responseLog('deleted');
                registerCommands(CLIENT_ID as string);
            }
            
        } catch (e) {
            console.error(e);
        }
    });
}

export {
    initializeDiscord,
    sendMessage
};
