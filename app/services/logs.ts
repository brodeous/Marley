const commandLog = (command: string) => {
    console.log(`Recieved Command: ${command}`);
}

const responseLog = (response: string) => {
    console.log(`Response Message: ${response}`);
}

const okay = (msg: string) => {
    console.log(`[+] ${msg}`);
}

const info = (msg: string) => {
    console.info(`[i] ${msg}`);
}

const warn = (msg: string) => {
    console.warn(`[-] ${msg}`);
}

const error = (msg: string) => {
    console.error('[!]', msg);
}

export {
    commandLog,
    responseLog,
    okay,
    info,
    warn,
    error
};
