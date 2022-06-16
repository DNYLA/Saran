export function getArgsFromMsg(
  msg: string,
  prefixLn: number
): { commandName: string; args?: string[] } {
  // Args including the command name
  const args = msg.slice(prefixLn).split(/ +/);

  return {
    commandName: args[0],
    args: args.slice(1),
  };
}

export enum MessageType {
  Channel = '#',
  Mention = '@',
}

export function getIdFromTag(msg: string, messageType: MessageType) {
  console.log(messageType);
  console.log(msg);
  if (msg.includes(messageType)) {
    const index = msg.indexOf(messageType);
    console.log(index);
  }
}
