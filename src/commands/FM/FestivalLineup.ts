import { AttachmentBuilder, Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import { ArgumentTypes } from '../../utils/base/command';
import LastFMCommand from './LastFM';
import {
  createCanvas,
  loadImage,
  Canvas,
  CanvasRenderingContext2D,
} from 'canvas';
// import * as cover from 'canvas-image-cover';
// import {cove} from 'canvas-image-cover';
import cover from 'canvas-image-cover';
import prisma from '../../services/prisma';
import { fetchDatabaseUser } from '../../services/database/user';

export default class Plays extends LastFMCommand {
  constructor() {
    super('festivallineup', {
      aliases: ['flineup', 'lineup', 'fl'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf festivallineup',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { targetUserId: string }) {
    const user = await fetchDatabaseUser(args.targetUserId);

    const artists = await prisma.userArtists.findMany({
      where: { userId: args.targetUserId },
      orderBy: [{ plays: 'desc' }],
      take: 39,
    });

    if (artists.length < 39) {
      return message.reply(
        "You haven't listened to enough artists to generate a fesitval list."
      );
    }

    const list1 = [];
    const list2 = [];
    const list3 = [];

    for (let i = 0; i < artists.length; i++) {
      const artistName = artists[i].name.toUpperCase();

      if (i % 3 === 0) {
        list1.push(artistName);
      } else if (i % 3 === 1) {
        list2.push(artistName);
      } else if (i % 3 === 2) {
        list3.push(artistName);
      }
    }

    const width = 1500;
    const height = 1700;

    const festival = new CanvasGenerator(width, height, {
      day1: list1,
      day2: list2,
      day3: list3,
    });
    const img = await festival.generate(user.lastFMName);

    const attachment = new AttachmentBuilder(img, {
      name: 'collage.jpg',
    });
    message.channel.send({ files: [attachment] });
  }
}

type TextOptions = {
  weight?: string;
  font?: string;
  fontSize?: string;
  col?: string;
  align?: CanvasTextAlign;
  maxWidth?: number;
};

interface ICanvasGenerator {
  width: number;
  height: number;
  lineup: { day1: string[]; day2: string[]; day3: string[] };
  // hWidth: number;
  // canvas: Canvas;
  // context: CanvasRenderingContext2D;
  // createText(value: string, x: number, y: number, options: TextOptions): void;
  // daySection(
  //   location: { x: number; y: number },
  //   title: { value: string; day: string; date: string },
  //   artist_1: string,
  //   artist_2: string,
  //   artist_3: string
  // ): void;
  // doWork(): void;
  generate(username: string): Promise<Buffer>;
}

class CanvasGenerator implements ICanvasGenerator {
  private canvas: Canvas;
  private context: CanvasRenderingContext2D;
  private hWidth: number;

  constructor(
    public width: number,
    public height: number,
    public lineup: { day1: string[]; day2: string[]; day3: string[] }
  ) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    this.canvas = canvas;
    this.context = context;
    this.hWidth = width / 2;
  }

  private createText(
    value: string | string[],
    x: number,
    y: number,
    options: TextOptions
  ) {
    if (!options)
      options = {
        weight: 'bold',
        font: 'Anton',
        fontSize: '25pt',
        col: '#FFF',
        align: 'center',
      };
    if (!options.weight) options.weight = 'bold';
    if (!options.font) options.font = 'Anton';
    if (!options.fontSize) options.fontSize = '15pt';
    if (!options.col) options.col = '#FFF';
    if (!options.align) options.align = 'center';

    let text = '';
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const element = value[i];

        if (i !== value.length - 1) text += `${element} • `;
        else text += element;
      }
    } else text = value;

    const { weight, font, fontSize, col, align } = options;
    // const maxWidth = options.maxWidth ? options.maxWidth : null;
    this.context.font = `${weight} ${fontSize} ${font}`;
    this.context.textAlign = align;
    this.context.fillStyle = col;

    if (options.maxWidth) this.context.fillText(text, x, y, options.maxWidth);
    else this.context.fillText(text, x, y);
  }

  private seperateLineup(artists: string[]): {
    headliner: string;
    artist_1: string[];
    artist_2: string[];
    artist_3: string[];
  } {
    const headliner = artists[0];
    const mains = [];
    const middle = [];
    const finale = [];

    let mainsCount = 0;
    let middleCount = 0;
    let finaleCount = 0;
    for (let i = 1; i <= 12; i++) {
      const artist = artists[i];

      if (mainsCount + artist.length <= 30 && mains.length < 3) {
        mains.push(artist);
        mainsCount += artist.length;
      } else if (middleCount + artist.length <= 30 && middle.length < 5) {
        middle.push(artist);
        middleCount += artist.length;
      } else if (finaleCount + artist.length <= 105 && finale.length < 4) {
        finale.push(artist);
        finaleCount += artist.length;
      }
    }

    return {
      headliner,
      artist_1: mains,
      artist_2: middle,
      artist_3: finale,
    };
  }

  private daySection(
    location: { x: number; y: number },
    date: Date,
    artists: string[]
  ) {
    const { x } = location;
    let { y } = location;
    const titleGap = 600;

    const { headliner, artist_1, artist_2, artist_3 } =
      this.seperateLineup(artists);

    // const artist_1 = '';
    // const artist_2 = '';
    // const artist_3 = '';
    const [day, month] = date
      .toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      .split(', ');

    this.createText(day.toUpperCase(), x - titleGap, y, {
      fontSize: '35pt',
      col: '#ec745c',
    });
    this.createText(headliner, x, y, { fontSize: '75pt', maxWidth: 700 });
    this.createText(month.toUpperCase(), x + titleGap, y, {
      fontSize: '35pt',
      col: '#ec745c',
    });

    y += 70;
    this.createText(artist_1, x, y, {
      fontSize: '43pt',
    });

    const altCol = '#ffffff8c';

    y += 60;
    this.createText(artist_2, this.hWidth, y, {
      fontSize: '35pt',
      col: altCol,
    });

    y += 60;
    this.createText(artist_3, this.hWidth, y, {
      fontSize: '35pt',
      col: altCol,
    });
  }

  private doWork(title: string) {
    const hWidth = this.width / 2;
    let y = 150;
    // context.fillStyle = '#000';
    // context.fillRect(0, 0, width, height);

    this.createText(title, hWidth, y, {
      weight: 'bold',
      fontSize: '100pt',
      font: 'Bernadette',
    });

    //+50
    y += 125;
    this.createText('PRESENTED BY SARAN BOT', hWidth, y, {
      fontSize: '40pt',
      col: '#ec745c',
    });

    y += 150;
    const sectionGap = 350;
    const date = new Date();

    this.daySection({ x: hWidth, y }, date, this.lineup.day1);

    y += sectionGap;
    date.setDate(date.getDate() + 1);
    this.daySection({ x: hWidth, y }, date, this.lineup.day2);

    y += sectionGap;
    date.setDate(date.getDate() + 1);
    this.daySection({ x: hWidth, y }, date, this.lineup.day3);
  }

  async generate(username: string) {
    const image = await loadImage('https://www.instafest.app/img/Desert.svg');
    cover(image, 0, 0, this.width, this.height).render(this.context);

    this.doWork(`${username}fest`);
    const buffer = this.canvas.toBuffer('image/png');
    return buffer;
  }
}
