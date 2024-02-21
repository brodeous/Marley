import { Job, Prisma } from '@prisma/client'
import { scrap } from './scraper.js'
import { sendMessage } from './discord.js'
import { outputMessage } from './messenger.js'
import { cleanQueryParams } from './cleanQueryParams.js'
import { info, okay } from './logs.js'
import { getJob, saveJob } from './db.js'

const testJob = async () => {
    const url = 'https://www.facebook.com/marketplace/109455995738828/search/?query=ford%20ranger%204x4';
    const selector = 'a[role="link"]';

    const linksRaw = await scrap(url, selector);
    //console.log(linksRaw);
    const links = linksRaw.map(cleanQueryParams);

    const message = outputMessage(links.join('\n'));

    sendMessage("1195917008273952908", message);
}

const createJob = async (job: Prisma.JobCreateInput) => {
    const { name, url, selector, interval, active, channelID, Guild } = job;
    info(`job info\n\t\\___ name: ${name}\n\t\\___ url: ${url}\n\t\\___ selector: ${selector}\n\t\\___ interval: ${interval}\n\t\\___ active: ${active}\n\t\\___ channel: ${channelID}\n\t\\___ guild: ${Guild.connect?.id}`);
    await saveJob(job);
    okay(`JOB '${name}' SAVED`);
}

const runJob = async (job: Job) => {
    const { name, url, selector, channelID, guildID } = job;
    info(`job info\n\t\\___ name: ${name}\n\t\\___ url: ${url}\n\t\\___ selector: ${selector}\n\t\\___ channel: ${channelID}\n\t\\___ guild: ${guildID}`);
    const hello = await getJob(guildID, name);
}


export {
    testJob,
    createJob,
    runJob
}
