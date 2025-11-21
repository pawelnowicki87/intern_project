import { IVisibilityPostsReader } from "src/posts/ports/visibility-post.reader";
import { VisibilityService } from "../visibility.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class VisibilityPostAdapter implements IVisibilityPostsReader {
  constructor(private readonly visibilityService: VisibilityService) {}

  canViewPosts(viewerId: number, ownerId: number): Promise<boolean> {
    return this.visibilityService.canViewPosts(viewerId, ownerId);
  }

}