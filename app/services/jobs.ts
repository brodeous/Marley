import { Job, Prisma } from '@prisma/client'
import { scrap } from './scraper.js'
import { sendMessage } from './discord.js'
import { outputMessage } from './messenger.js'
import { cleanQueryParams } from './cleanQueryParams.js'
import { error, info, okay, warn } from './logs.js'
import { getJob, getJobs, getLinks, saveJob, saveLinks, updateJob } from './db.js'

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

        if (newLinks.length !== 0) {
            await saveLinks(guildID, name, newLinks);
            
            // Add discord messaging
            const message = outputMessage(newLinks.join('\n'));

            await sendMessage(channelID, message);

            if (job.failuresInRow > 0) {
                await updateJob(guildID, name, { failuresInRow: 0 });
            }
        } else {
            info(`no new links`);
        }

    } catch (err) {
        error(err);

        const failuresInRow = job.failuresInRow + 1;

        if (failuresInRow >= 10) {
            warn(`Disabling '${name}' due to too many failures`);
            await updateJob(guildID, name, { active: false });
            okay(`JOB '${name}' DISABLED`);
        }

        await updateJob(guildID, name, { failuresInRow });
    }
}

const runJobs = async (jobs: Job[]) => {
    let i = 1;
    for (const job of jobs) {
        warn(`running job ${i}/${jobs.length}`);
        if (!job.active)
            continue;
        await runJob(job);

        if (i === jobs.length) 
            break;
        i++
    }
    okay(`completed ${i}/${jobs.length} jobs`);
}

const runInterval = async () => {
    let i = 0;
    const run = async () => {
        const jobs: Job[] = await getJobs();
        const activeJobs = jobs.filter(({ interval, active }) => i % interval === 0 && active);
        if (activeJobs.length !== 0) {
            info(`running interval\n\t\\___ active jobs: ${activeJobs.length}`);
            runJobs(activeJobs);
        }
        i++;
    }

    const intervalID = setInterval(run, 60000);

    return intervalID;
}

export {
    testJob,
    createJob,
    runJob,
    runInterval
}
