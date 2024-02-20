import { Guild, Job, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const saveGuild = async (guildID: string): Promise<Guild> => {
    return await prisma.guild.create({ data: { id: guildID } });
}



export {
    prisma,
    saveGuild
}
