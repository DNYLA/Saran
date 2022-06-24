import { Message } from 'discord.js';
import DiscordClient from '../client';
import { CommandOptions } from '../types';

export enum RequirmentsType {
  Custom,
  Permissions,
  NotWhitelisted,
  InvalidArguments,
  // InvalidRole,
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
  }> {
    if (!this.options?.requirments)
      return { valid: true, message: null, type: null };

    const req = this.options.requirments;
    const validPermissions = this.checkPermissions(message);

    if (!validPermissions)
      return {
        valid: false,
        message: this.options?.invalidPermissions,
        type: RequirmentsType.Permissions,
      };

    if (req.userIDs) {
      let ids = [];
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
        };
    }

    if (this.options?.arguments?.required) {
      if (this.options.arguments.minAmount > args.length) {
        return {
          valid: false,
          message: this.options.invalidUsage ?? 'Invalid Usage',
          type: RequirmentsType.InvalidArguments,
        };
      }
    }

    //Message is displayed in PostCheck if they chose to
    if (req.custom && !(await req.custom(message, args)))
      return { valid: false, message: null, type: RequirmentsType.Custom };

    return { valid: true, message: null, type: null };
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

  async execute(client: DiscordClient, message: Message, args: string[]) {
    const hooks = this.options?.hooks;

    // Runn PreCommand()
    hooks?.preCommand && hooks.preCommand(message, args);

    /* Run Checks permissions, guildOnly, etc
       Invalid Permissions? -> Display Message
       Invalid Usage? reply with invalid Usage + Examples?
       Any Errors? Display Message 
    */
    const {
      valid: passedChecks,
      type,
      message: invalidMessage,
    } = await this.isValidRequirments(message, args);
    if (!passedChecks && invalidMessage) message.reply(invalidMessage);

    //Run PostCheck()?
    hooks?.postCheck && hooks.postCheck(message, args, passedChecks, type);

    //Run Command if checks passed
    let success = true;
    try {
      if (passedChecks) await this.run(message, args);
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
    args: string[]
  ): Promise<Message> | Promise<void>;
}
