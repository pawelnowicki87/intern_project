import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mention, MentionType } from './entity/mention.entity';
import type { IUserMentionReader } from './ports/user-mention.reader';
import { USER_MENTION_READER } from './ports/user-mention.reader';
import { NOTIFICATIONS_SENDER } from 'src/notifications-producer/ports/tokens';
import type { INotificationSender } from 'src/notifications-producer/ports/notification-sender.port';
import { NotificationAction } from '../common/notifications/notification-action';

@Injectable()
export class MentionsService {
  private readonly logger = new Logger(MentionsService.name);

  constructor(
    @InjectRepository(Mention)
    private readonly repo: Repository<Mention>,

    @Inject(USER_MENTION_READER)
    private readonly userReader: IUserMentionReader,

    @Inject(NOTIFICATIONS_SENDER)
    private readonly notificationSender: INotificationSender,
  ) {}

  private extractUsernames(text: string): string[] {
    const regex = /@([a-zA-Z0-9_]+)/g;
    return [...text.matchAll(regex)].map(match => match[1]);
  }

  async processMentions(
    text: string,
    sourceId: number,
    sourceType: MentionType,
    createdByUserId: number,
  ) {
    const usernames = this.extractUsernames(text);

    for (const username of usernames) {
      const user = await this.userReader.findUserByUserName(username);

      if (!user) continue;
      if (user.id === createdByUserId) continue;

      const mention = this.repo.create({
        sourceId,
        sourceType,
        mentionedUserId: user.id,
        createdByUserId,
      });

      await this.repo.save(mention);

      const action = sourceType === MentionType.COMMENT
        ? NotificationAction.MENTION_COMMENT
        : NotificationAction.MENTION_POST;

      this.logger.log(`Sending ${action} notification to user ${user.id} from user ${createdByUserId} for source ${sourceId}`);
      await this.notificationSender.sendNotification(
        user.id,
        createdByUserId,
        action,
        sourceId,
      );
    }
  }
}
