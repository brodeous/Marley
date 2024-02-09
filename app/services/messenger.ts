const outputMessage = (message: string): string => {
    return message.split('\n')
    .map((message) => `> ${message}`)
    .join('\n');
}

export {
    outputMessage
}
