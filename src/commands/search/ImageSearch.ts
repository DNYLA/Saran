import {
  Message,
  ButtonBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from 'discord.js';
import { GoogleCSESearch } from '../../api/WebSearch';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export type SearchQueryArgs = {
  query: string;
};

export default class ImageSearch extends Command {
  constructor() {
    super('image', {
      aliases: ['img'],
      hooks: {
        preCommand: StartTyping,
      },
      invalidUsage: 'Do ,img <Query>',
      arguments: [
        {
          name: 'query',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: SearchQueryArgs) {
    const client = message.client as DiscordClient;
    const { query } = args;
    let results = client.getImage(query);
    if (!results)
      try {
        const imageSearch = new GoogleCSESearch(
          process.env.GOOGLE_API_KEY,
          process.env.GOOGLE_CSE_ID
        );

        const data = await imageSearch.search(query);
        results = {
          images: data,
          query: query,
          currentPos: 0,
          requester: message.author.id,
        };
      } catch (err) {
        console.log(err);
        return message.channel.send('Daily free image search quota reached');
      }

    try {
      if (!results || results.images.length === 0)
        return message.reply({ content: 'Cant Find any images!' });
    } catch (err) {
      return message.reply({ content: 'Cant FInd image' });
    }
    client.setImage(results);
    const firstImage = results.images[0];
    const imageEmbed = new EmbedBuilder()
      .setImage(firstImage.link)
      // .setAuthor({ name: firstImage.title, url: firstImage.url })
      .setTitle(firstImage.snippet)
      .setURL(firstImage.link)
      .setFooter({
        text: `Page 1/${results.images.length} ∙ Requested by ${message.author.username}`,
      });

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId(`image-backward-${query}`)
        .setLabel('<')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`image-forward-${query}`)
        .setLabel('>')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`image-delete-${query}`)
        .setLabel('X')
        .setStyle(ButtonStyle.Danger)
    );
    if (!message.channel.isTextBased()) return;

    const imgMessage = await message.channel.send({
      embeds: [imageEmbed],
      components: [row],
    });

    setTimeout(() => {
      imgMessage.edit({ components: [] });
    }, 60000);
  }
}
