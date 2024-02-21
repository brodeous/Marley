import { Guild, Job, Prisma, PrismaClient } from '@prisma/client';
import { error, info, okay } from './logs.js';

const prisma = new PrismaClient();

const initializeDB = async () => {
    try {
        await prisma.guild.findMany();
        okay(`DATABASE CONNECTED`);
    } catch (err) {
        error(err);
    }
}

const saveGuild = async (guildID: string): Promise<Guild> => {
    info("creating new guild in database");
    return await prisma.guild.create({ data: { id: guildID } });
}

const getGuilds = async (): Promise<Guild[]> => {
    info("retrieving list of guilds from database");
    return await prisma.guild.findMany();
}

const saveJob = async (job: Prisma.JobCreateInput): Promise<Job> => {
    info("creating new job in database");
    return await prisma.job.create({ data: job });
}

const getJobs = async (guildID: string): Promise<Job[]> => {
    info("retrieving list of jobs from database");
    return await prisma.job.findMany({ 
        where: {
            ...(guildID && { guildID })
        },
    });
}

const getJob = async (guildID: string, name: string): Promise<Job | null> => {
    info(`retrieving single job from database\n\t\\___ job name => ${name}`);
    return await prisma.job.findUnique({
        where: {
            name_guildID: {
                guildID,
                name,
            },
        },
    });
}

const updateJob = async(guildID: string, name: string, job: Prisma.JobUpdateInput): Promise<Job> => {
    info(`updating job\n\t\\___ job name => ${name}`);
    return await prisma.job.update({
        data: job,
        where: {
            name_guildID: {
                guildID,
                name,
            },
        },
    });
}

const deleteJob = async (guildID: string, name: string) => {
    info(`deleting job\n\t\\___ job name => ${name}`);
    return await prisma.job.delete({
        where: {
            name_guildID: {
                guildID,
                name,
            },
        },
    });
}

const saveLinks = async (guildID: string, jobName: string, links: string[]) => {
    info(`finding job to add links to\n\t\\___ job name => ${jobName}`);
    const job = await prisma.job.findUniqueOrThrow({
        where: {
            name_guildID: {
                guildID: guildID,
                name: jobName,
            },
        },
    });
    info(`creating links in database`);
    return await prisma.link.createMany({
        data: links.map((link) => ({
            url: link,
            jobID: job.id,
        })),
    });
}

const getLinks = async (guildID: string, channelID: string): Promise<string[]> => {
    info(`retrieving links from database`);
    return await prisma.link.findMany({
        where: {
            job: {
                guildID,
                channelID,
            },
        },
    })
    .then((links: any) => links.map((link: any) => link.url));
}

export {
    initializeDB,
    saveGuild,
    getGuilds,
    saveJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob,
    saveLinks,
    getLinks
}
