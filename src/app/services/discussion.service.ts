import {Injectable} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc, getDocs,
  query, updateDoc,
  where
} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {Discussion} from "../model/discussion.type"
import {UsersService} from './users.service';
import {User} from '../model/user.type';
import {DateService} from './date.service';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {

  private routeSource = new BehaviorSubject("");
  route$ = this.routeSource.asObservable();

  private currentDiscussionSource = new BehaviorSubject<Discussion | null>(null);
  currentDiscussion$ = this.currentDiscussionSource.asObservable();


  constructor(private firestore: Firestore,private dateService : DateService ,private userService: UsersService, private router: Router) {

  }

  setRoute(routeName: string) {
    return this.routeSource.next(routeName)
  }

  setCurrentDiscussion(discussion: any) {
    return this.currentDiscussionSource.next(discussion)
  }


  getDiscussions(): Observable<any> {
    const discussionCollection = collection(this.firestore, 'discussion');
    return collectionData(discussionCollection, {'idField': 'id'}) as Observable<Discussion[]>
  }

  async getDiscussion(id: string): Promise<null | User> {
    const discussionCollection = doc(this.firestore, 'discussion', id);
    const snapshot = await getDoc(discussionCollection);
    if (snapshot.exists()) {
      return snapshot.data() as User
    }
    return null;
  }

  createDiscussion(discussion: Discussion): any {
    let currentUserId = this.userService.getCurrentUser().uid
    discussion.participants.push(currentUserId)
    discussion.createdAt = this.dateService.getTodayDate()
    discussion.creatorId = currentUserId
    const discussionsRef = collection(this.firestore, 'discussion');
    console.log("discussion created")
    let docRef = addDoc(discussionsRef, discussion);
    return docRef;
  }

  async editDiscussion(discussion: Discussion): Promise<any> {

    const documentRef  = doc(this.firestore, 'discussion', discussion.id);
    try {
      await updateDoc(documentRef, discussion);
      const snapshot = await getDoc(documentRef);
      if (snapshot.exists()) {
        return snapshot.data() as Discussion
      } else return null;
    }
    catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      return null;
    }
  }

  deleteDiscussion(discussion: Discussion): Promise<void> {
    if (!discussion.id) {
      console.error("discussion.id is undefined");
      return Promise.reject(new Error("Invalid discussion ID"));
    }
    console.log(discussion)
    const discussionRef = doc(this.firestore, 'discussion', discussion.id);
    return deleteDoc(discussionRef);
  }

}
