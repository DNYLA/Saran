import StartTyping from '../../hooks/StartTyping';
import { CommandOptions } from '../types';
import SettingsCommand from '../../commands/Settings/Settings';

export default class WelcomeCommand extends SettingsCommand {
  constructor(subcommand: string, options?: CommandOptions) {
    super(
      'welcome ' + subcommand,
      options ?? {
        requirments: {
          permissions: {
            administrator: true,
          },
        },
        isSubcommand: true,
        invalidPermissions: 'You must be admin to use this!',
        hooks: {
          preCommand: StartTyping,
        },
      }
    );
  }
}
