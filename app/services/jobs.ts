import { Job, Prisma } from '@prisma/client'
import { scrap } from './scraper.js'
import { sendMessage } from './discord.js'
import { outputMessage } from './messenger.js'
import { cleanQueryParams } from './cleanQueryParams.js'
import { error, info, okay } from './logs.js'
import { getJob, getLinks, saveJob, saveLinks, updateJob } from './db.js'

const testJob = async () => {
    const url = 'https://www.facebook.com/marketplace/109455995738828/search/?query=ford%20ranger%204x4';
    const selector = 'a[role="link"]';

    const linksRaw = await scrap(url, selector);
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
    const { name, url, selector, interval, active, channelID, guildID } = job;
    info(`job info\n\t\\___ name: ${name}\n\t\\___ url: ${url}\n\t\\___ selector: ${selector}\n\t\\___ interval: ${interval}\n\t\\___ active: ${active}\n\t\\___ channel: ${channelID}\n\t\\___ guild: ${guildID}`);

    try {
        const linksRaw = await scrap(url, selector);

        const links = linksRaw.map(cleanQueryParams);

        const existingLinks = await getLinks(guildID, channelID);

        const newLinks = [...new Set(links.filter((link) => !existingLinks.includes(link)))];

        if (newLinks) {
            await saveLinks(guildID, name, newLinks);
            
            // Add discord messaging
            const message = outputMessage(newLinks.join('\n'));

            sendMessage(channelID, message);

            if (job.failuresInRow > 0) {
                await updateJob(guildID, name, { failuresInRow: 0 });
            }
        }

    } catch (err) {
        error(err);

        const failuresInRow = job.failuresInRow + 1;

        if (failuresInRow >= 10) {
            info(`Disabling '${name}' due to too many failures`);
            await updateJob(guildID, name, { active: false });
            okay(`JOB '${name}' DISABLED`);
        }

        await updateJob(guildID, name, { failuresInRow });
    }
}

const runJobs = async (jobs: Job[]) => {
    for (const job of jobs) {
        if (!job.active)
            continue;
        await runJob(job);
    }
}

export {
    testJob,
    createJob,
    runJob
}
