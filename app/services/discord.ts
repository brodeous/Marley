import 'dotenv/config';
import { Client, GatewayIntentBits, TextChannel, ChannelType } from 'discord.js';
import { registerCommands } from '../utility/commands.js';
import { commandLog } from './logs.js';

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
    await client.login(process.env.DISCORD_API_KEY);
    return client;
}

const handleEvents = (client: Client<boolean>) => {
    client.on('ready', (c: any) => {
        console.log(`${c.user.tag} is ready`);
        registerCommands(process.env.CLIENT_ID as string);
        sendMessage("1195917008273952908", "I am ready");
    });
    client.on('guildCreate', (guild) => {
        console.log(`Joined ${guild.name}`);
    });
}

const sendMessage = async (channelID: string, message: string) => {
    console.log(`Sending message to ${channelID}`);
    const channel = client.channels.cache.get(channelID) as TextChannel;
    await channel.send(message);
}

const handleCommands = (client: Client<boolean>) => {
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) return;

            if (interaction.commandName === 'ping') {
                commandLog(interaction.commandName);
                await interaction.reply('Pong!');
                registerCommands(process.env.CLIENT_ID as string);
            }

            if (interaction.commandName === 'create') {
                commandLog(interaction.commandName);
                await interaction.reply('created');
                registerCommands(process.env.CLIENT_ID as string);
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
