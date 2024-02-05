import { scrap } from './puppeteer.js'
import { sendMessage } from './discord.js'
import { outputMessage } from './messenger.js'

const testJob = async () => {
    const url = 'https://www.facebook.com/marketplace/109455995738828/search/?query=ford%20ranger%204x4';
    const selector = '.x1i10hfl';

    const links = await scrap(url, selector);

    const message = outputMessage(links.join('\n'));

    sendMessage("1195917008273952908", message);
}

export {
    testJob
}
