import { Injectable } from "@nestjs/common";
import { IVisibilityReader } from "src/users/ports/visibility-reader.port";
import { VisibilityService } from "../visibility.service";

@Injectable()
export class VisibilityAdapter implements IVisibilityReader{
  constructor(private readonly visibilityService: VisibilityService) {}

  canViewProfile(viewerId: number, ownerId: number): Promise<boolean> {
    return this.visibilityService.canViewProfile(viewerId, ownerId);
  }

}