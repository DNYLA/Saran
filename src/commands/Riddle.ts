import axios from 'axios';
import { EmbedBuilder, Message } from 'discord.js';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import Command, { ArgumentTypes } from '../utils/base/command';
import DiscordClient, { Riddle } from '../utils/client';
import { CONSTANTS } from '../utils/constants';
import { getRiddle } from '../api/riddle';
export default class RiddleCommand extends Command {
  constructor() {
    super('riddle', {
      aliases: ['r'],
      requirments: {
        permissions: {
          administrator: false,
          manageMessage: false,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
        postCommand: () => console.log('Finished Executing'),
      },
      arguments: [
        {
          name: 'answer',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: { answer: string }) {
    const client = message.client as DiscordClient;
    const prevRiddle = client.getRiddle(message.guildId);
    args.answer = args.answer.toLowerCase();
    if (args.answer === 'play') {
      const riddle = await getRiddle();
      if (!riddle) return message.reply('Unable to find a riddle dog!');
      client.setRiddle(message.guildId, {
        ...riddle,
        owner: message.author.id,
      });
      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.INFO)
        .setDescription(
          `**${riddle.riddle}**\nType **,riddle <answer>** to guess the answer. **,riddle giveup** to stop playing.`
        );
      await message.channel.send({ embeds: [embed] });
      console.log(`Riddle Generated. ${riddle.riddle}: ${riddle.answer}`);
      return;
    } else if (args.answer === 'giveup') {
      let col = CONSTANTS.COLORS.INFO;
      let description =
        'No previous Riddle found use !riddle play to start a game.';

      if (prevRiddle && message.author.id !== prevRiddle.owner) {
        description = `<@${prevRiddle.owner}> can only end this riddle!`;
        col = CONSTANTS.COLORS.WARNING;
      } else if (prevRiddle)
        description = `You failed to guess! The answer was ${prevRiddle.answer}`;
      const embed = new EmbedBuilder()
        .setColor(col)
        .setDescription(description);
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (!prevRiddle) {
      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.WARNING)
        .setDescription(
          'No previous Riddle found use !riddle play to start a game.'
        );
      await message.channel.send({ embeds: [embed] });
      return;
    }

    let description = 'This answer is incorrect';
    console.log(args.answer);
    console.log(prevRiddle.answer);

    console.log();
    if (
      args.answer === prevRiddle.answer.toLowerCase() ||
      prevRiddle.answer.toLowerCase().includes(args.answer)
    ) {
      console.log('here');
      description = `Welldone <@${message.author.id}> you are correct!`;
    }

    const embed = new EmbedBuilder()
      .setColor(CONSTANTS.COLORS.INFO)
      .setDescription(description);
    await message.channel.send({ embeds: [embed] });
  }
}
