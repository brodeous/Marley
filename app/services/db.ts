import { Guild, Job, Link, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const saveGuild = async (guildID: string): Promise<Guild> => {
    return await prisma.guild.create({ data: { id: guildID } });
}

const getGuilds = async (): Promise<Guild[]> => {
    return await prisma.guild.findMany();
}

const saveJob = async (job: Prisma.JobCreateInput): Promise<Job> => {
    return await prisma.job.create({ data: job });
}

const getJobs = async (guildID: string): Promise<Job[]> => {
    return await prisma.job.findMany({ 
        where: {
            ...(guildID && { guildID })
        },
    });
}

const getJob = async (guildID: string, name: string): Promise<Job | null> => {
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
    const job = await prisma.job.findUniqueOrThrow({
        where: {
            name_guildID: {
                guildID: guildID,
                name: jobName,
            },
        },
    });
    return await prisma.link.createMany({
        data: links.map((link) => ({
            url: link,
            jobID: job.id,
        })),
    });
}

const getLinks = async (guildID: string, channelID: string): Promise<string[]> => {
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
