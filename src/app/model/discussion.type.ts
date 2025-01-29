import {User} from './user.type';

export type Discussion={
  creatorId: string,
  title: string,
  participants: Array<string>,
  createdAt: string,
  id?: string,
  creator?: User,

}
