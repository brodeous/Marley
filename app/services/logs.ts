const commandLog = (command: string) => {
    console.log(`Recieved Command: ${command}`);
}

const responseLog = (response: string) => {
    console.log(`Response Message: ${response}`);
}

export {
    commandLog,
    responseLog
};
