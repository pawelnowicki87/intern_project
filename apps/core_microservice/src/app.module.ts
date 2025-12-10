import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesPostsModule } from './likes-posts/likes-posts.module';
import { ChatParticipantsModule } from './chat-participants/chat-participants.module';
import { ChatsModule } from './chats/chats.module';
import { CommentsModule } from './comments/comments.module';
import { FilesModule } from './files/files.module';
import { FollowsModule } from './follows/follows.module';
import { LikesCommentsModule } from './likes-comments/likes-comments.module';
import { MessageAssetsModule } from './message-assets/message-assets.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsProducerModule } from './notifications-producer/notifications-producer.module';
import { PostAssetsModule } from './post-assets/post-assets.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { ProfileConfigModule } from './profile-config/profile-config.module';
import { dataSource } from './data-source';
import { CloudinaryModule } from './common/config/cloudinary.module';
import { WebsocketModule } from './websecket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
    }),

    CloudinaryModule,

    TypeOrmModule.forRoot({
      ...dataSource.options,
    }),

    UsersModule,
    PostsModule,
    CommentsModule,
    LikesPostsModule,
    LikesCommentsModule,
    FollowsModule,
    MessagesModule,
    NotificationsProducerModule,
    FilesModule,
    PostAssetsModule,
    MessageAssetsModule,
    ChatsModule,
    ChatParticipantsModule,
    ProfileConfigModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

