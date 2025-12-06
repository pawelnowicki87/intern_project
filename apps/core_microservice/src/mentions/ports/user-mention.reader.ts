import { User } from "src/users/entities/user.entity";

export const USER_MENTION_READER = Symbol('USER_MENTION_READER');

export interface IUserMentionReader{
    findUserByUserName(userName: string): Promise<User | null>
}