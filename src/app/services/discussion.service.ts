import {Injectable} from '@angular/core';
import {addDoc, collection, collectionData, deleteDoc, doc, Firestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {Discussion} from "../model/discussion.type"
import {UsersService} from './users.service';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {

  constructor(private firestore: Firestore, private userService:UsersService,private router: Router) {

  }

  getDiscussions(): Observable<any> {
    const discussionCollection = collection(this.firestore, 'discussion');
    return collectionData(discussionCollection, {'idField': 'id'})  as Observable<Discussion[]>
  }

  createDiscussion(discussion: Discussion): any {
    let currentUserId = this.userService.getCurrentUser().uid
    discussion.participants.push(currentUserId)
    discussion.createdAt = new Date().toISOString()
    discussion.creatorId = currentUserId
    const discussionsRef = collection(this.firestore, 'discussion');
    console.log("discussion created")
    let  docRef =  addDoc(discussionsRef, discussion);
    return docRef;
  }
  deleteDiscussion(discussion: Discussion): Promise<void> {
    if (!discussion.id) {
      console.error("discussion.id is undefined");
      return Promise.reject(new Error("Invalid discussion ID"));
    }

    const discussionRef = doc(this.firestore, 'discussion', discussion.id);
    return deleteDoc(discussionRef);
  }

}
