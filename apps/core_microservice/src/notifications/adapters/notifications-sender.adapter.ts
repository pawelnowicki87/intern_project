import { INotificationSender } from "src/follows/ports/notification-sender.port";
import { NotificationsRepository } from "../notifications.repository";
import { NotificationResponseDto } from "../dto/notification-response.dto";
import { NotificationAction } from "../entities/notification-acion.enum";
import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationsSenderAdapter implements INotificationSender{
  constructor( private readonly notificationRepo: NotificationsRepository) {}
  
  sendNotification(recipientId: number, senderId: number, action: NotificationAction, targetId: number): Promise<NotificationResponseDto | null> {
    return this.notificationRepo.create({
      recipientId,
      senderId,
      action,
      targetId
    })
  }
}