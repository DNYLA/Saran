import { Message } from 'discord.js';
import { RequirmentsType } from '../utils/base/Command2';

export default (
  message: Message,
  args: string[],
  valid: boolean,
  type: RequirmentsType
): void => {
  if (!valid) {
    if (type === RequirmentsType.NotWhitelisted) {
      message.reply('You arent Whitelisted');
    } else if (type === RequirmentsType.Custom) {
      message.reply('You dont have a username set');
    }
  }
};
