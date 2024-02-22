const commandLog = (command: string) => {
    console.log(`Recieved Command: ${command}`);
}

const responseLog = (response: string) => {
    console.log(`Response Message: ${response}`);
}

const okay = (msg: string) => {
    console.log('\x1b[32m%s\x1b[0m', `[+] ${msg}`);
}

const info = (msg: string) => {
    console.info(`[i] ${msg}`);
}

const warn = (msg: string) => {
    console.warn('\x1b[33m%s\x1b[0m', `[W] ${msg}`);
}

const error = (msg: any) => {
    console.error('\x1b[31m%s\x1b[0m', '[!]', msg);
}

export {
    commandLog,
    responseLog,
    okay,
    info,
    warn,
    error
};
