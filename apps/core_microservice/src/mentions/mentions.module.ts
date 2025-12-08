import { Module, forwardRef } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { MentionsService } from "./mentions.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mention } from "./entity/mention.entity";
import { MentionCommentAdapter } from "./adapters/mention-comment.adapter";
import { MentionPostAdapter } from "./adapters/mention-post.adapter";
import { COMMENT_MENTIONS_READER } from "src/comments/ports/tokens";
import { POST_MENTIONS_READER } from "src/posts/ports/tokens";

@Module({
    imports: [
        TypeOrmModule.forFeature([Mention]),
        forwardRef(() => UsersModule)
    ],
    controllers: [

    ],
    providers: [
        MentionsService,
        {
          provide: COMMENT_MENTIONS_READER,
          useClass: MentionCommentAdapter
        },
        {
          provide: POST_MENTIONS_READER,
          useClass: MentionPostAdapter
        }
    ],
    exports: [
        MentionsService,
        COMMENT_MENTIONS_READER,
        POST_MENTIONS_READER
    ]
})
export class MentionsModule {}
