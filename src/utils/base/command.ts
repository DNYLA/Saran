import { xml } from 'cheerio';
import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import DiscordClient from '../client';
import { ARGUMENT_DENOMENATOR } from '../constants';
import { CommandOptions } from '../types';

export enum RequirmentsType {
  Custom,
  Permissions,
  NotWhitelisted,
  InvalidArguments,
  // InvalidRole,
}

export enum ArgumentTypes {
  SINGLE,
  FULL_SENTANCE,
  DENOMENATED_WORD, //Denomenator is set internally as a constant |
}

export default abstract class Command {
  constructor(private name: string, private options?: CommandOptions) {}

  getName(): string {
    return this.name;
  }

  getOptions(): CommandOptions {
    return this.options;
  }

  getAliases(): string[] {
    if (!this.options || !this.options.aliases) return [];

    return this.options.aliases;
  }

  private async isValidRequirments(
    message: Message,
    args: string[]
  ): Promise<{
    valid: boolean;
    message?: string;
    type?: RequirmentsType;
    args: unknown;
  }> {
    if (!this.options?.requirments)
      return { valid: true, message: null, type: null, args };

    const isBotOwner = message.author.id === OwnerOnly(message)[0];

    const req = this.options.requirments;
    const validPermissions = this.checkPermissions(message);

    if (!validPermissions && !isBotOwner)
      return {
        valid: false,
        message: this.options?.invalidPermissions,
        type: RequirmentsType.Permissions,
        args,
      };

    if (req.userIDs) {
      let ids = [OwnerOnly(message)[0]];
      if (typeof req.userIDs === 'function') {
        ids = req.userIDs(message);
      } else if (Array.isArray(req.userIDs)) {
        ids = req.userIDs;
      } else ids.push(req.userIDs);

      if (!ids.includes(message.author.id))
        return {
          valid: false,
          message: this.options?.invalidPermissions,
          type: RequirmentsType.NotWhitelisted,
          args,
        };
    }

    //You want to display Permission Denied error messages before wrong
    //arguments paassed through.
    if (this.options?.arguments?.required) {
      if (this.options.arguments.minAmount > args.length) {
        return {
          valid: false,
          message: this.options.invalidUsage ?? 'Invalid Usage',
          type: RequirmentsType.InvalidArguments,
          args,
        };
      }
    }

    const { valid: validArgs, parsedArgs } = this.isValidArgs(args, message);
    if (!validArgs)
      return {
        valid: false,
        message: this.options.invalidUsage ?? 'Invalid Usage',
        type: RequirmentsType.InvalidArguments,
        args,
      };

    //Message is displayed in PostCheck if they chose to
    if (req.custom && !(await req.custom(message, args)))
      return {
        valid: false,
        message: null,
        type: RequirmentsType.Custom,
        args,
      };

    return { valid: true, message: null, type: null, args: parsedArgs };
  }

  private checkPermissions(message: Message) {
    if (!this.options?.requirments?.permissions) return true;
    const permsRequired = this.options.requirments.permissions;
    const authorId = message.author.id;
    if (authorId === message.guild.ownerId) return true;
    if (message.member.permissions.has('ADMINISTRATOR')) return true;

    if (permsRequired.administrator)
      if (!message.member.permissions.has('ADMINISTRATOR')) return false;
    if (permsRequired.manageMessage)
      if (!message.member.permissions.has('MANAGE_MESSAGES')) return false;

    return true;
  }

  private isValidArgs(args: string[], message: Message) {
    let validArgs = true;
    const _args = [...args];
    const parsedArgs = {};
    if (this.options?.args) {
      let argIndex = 0; //It is possible that an arg is not required so using th index inside the loop may be invalid
      const parseDefault = (
        argDefault: string | ((message: Message) => string),
        msg: Message
      ) => {
        if (!argDefault) return null;
        if (typeof argDefault === 'string') return argDefault;

        return argDefault(msg);
      };

      // console.log(this.options.args);
      this.options.args.map((arg, i) => {
        console.log(_args);
        if (_args.length === 0) {
          if (!arg.default && arg.optional)
            return (parsedArgs[arg.name] = null);
          else if (!arg.default && !arg.optional) return (validArgs = false);
          const isDefault = parseDefault(arg.default, message);
          if (isDefault) parsedArgs[arg.name] = isDefault;
          else if (!arg.optional) validArgs = false;

          return;
        }

        if (!arg.parse) {
          const curArgs = [..._args];
          console.log(curArgs);
          console.log('Here?');
          if (arg.type === ArgumentTypes.SINGLE) {
            parsedArgs[arg.name] = _args[0];
            // argIndex++;
            _args.shift();
          } else if (arg.type === ArgumentTypes.FULL_SENTANCE) {
            //Join remainder of arg into one string
            parsedArgs[arg.name] = curArgs.join(' ');
            _args.splice(curArgs.length - 1);
            argIndex += curArgs.length;
          } else if (arg.type === ArgumentTypes.DENOMENATED_WORD) {
            //Parse String Denomanted Via Denomentatror
            const joined = curArgs.join(' ');
            const split = joined.split(ARGUMENT_DENOMENATOR);
            parsedArgs[arg.name] = split[0];
            console.log('Splity');
            console.log(split[0].split(' ').length + 1);
            // argIndex += split[0].split(' ').length;
            _args.splice(0, split[0].split(' ').length + 1); //+1 because we also want to remove the Denomenator

            // parsedArgs[arg.name] = curArgs.join(' ');
          }
          return;
        }

        const parsedArg = arg.parse(message, _args, 0);

        if (!parsedArg) {
          const defaultArg = parseDefault(arg.default, message);
          if (defaultArg) parsedArgs[arg.name] = defaultArg;
          else if (!arg.optional) validArgs = false;
        } else {
          parsedArgs[arg.name] = parsedArg;
          _args.shift();
          argIndex++;
        }
      });
    }

    return { valid: validArgs, parsedArgs };
  }

  async execute(client: DiscordClient, message: Message, args: string[]) {
    const hooks = this.options?.hooks;

    // Runn PreCommand()
    hooks?.preCommand && hooks.preCommand(message, args);

    /* Run Checks permissions, guildOnly, etc
       Invalid Permissions? -> Display Message
       Invalid Usage? reply with invalid Usage + Examples?
       Any Errors? Display Message 
    */

    // if (this.options?.args) {
    //   const argIndex = 0; //It is possible that an arg is not required so using th index inside the loop may be invalid
    //   const newArgs = this.options.args.map((arg) => {
    //     if (!validArgs) return;
    //     if (argIndex > args.length - 1 && arg.required) validArgs = false;
    //     if (!arg.parse && arg.default) return arg.default;
    //     if (!arg.parse && arg.required) {
    //       validArgs = false;
    //       return;
    //     }

    //     const parsedArg = arg.parse(message, args);
    //     console.log(parsedArg);
    //     if (!parsedArg && arg.required) {
    //       validArgs = null;
    //       return;
    //     }

    //     return parsedArg;
    //   });
    // }

    const {
      valid: passedChecks,
      type,
      message: invalidMessage,
      args: parsedArgs,
    } = await this.isValidRequirments(message, args);
    if (!passedChecks && invalidMessage) message.reply(invalidMessage);

    //Run PostCheck()?
    hooks?.postCheck && hooks.postCheck(message, args, passedChecks, type);

    //Run Command if checks passed
    let success = true;
    try {
      if (passedChecks) await this.run(message, args, parsedArgs);
    } catch (err) {
      message.reply(
        this.options.errorMessage ??
          'An error occured whilst trying to execute!'
      );
      console.log(err);
    }

    //Run Post Execution()
    hooks?.postExecution && hooks.postExecution(success);

    //Run PostCommand()
    hooks?.postCommand && hooks.postCommand();

    //Delete command request After Executed?
    try {
      if (this.options?.deleteCommand) await message.delete();
    } catch (err) {} //Message Probably already deleted
  }

  abstract run(
    message: Message,
    args: string[],
    argums?: unknown
  ): Promise<Message> | Promise<void>;
}
