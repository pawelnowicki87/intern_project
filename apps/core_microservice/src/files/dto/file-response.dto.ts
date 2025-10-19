export class FileResponseDto {
  id: number;
  url: string;
  fileType?: string;
  ownerId: number;
  commentId?: number;
  createdAt: Date;

  owner?: {
    firstName: string;
    lastName: string;
    email: string;
  };

  commentBody?: string;
}
