import {firestore} from 'firebase-admin';
import FieldValue = firestore.FieldValue;

export type Message ={
 content: string,
  createdAtString: string,
  createdAt: number,
  discussionId?: string,
  creatorId : string
  id?:string,
}
