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

  private currentDiscussionSource = new BehaviorSubject<Discussion>({
    title: "",
    creatorId: "",
    participants: [],
    createdAt: "",
    id: ""
  });
  currentDiscussion$ = this.currentDiscussionSource.asObservable();

  private discussionsSource = new BehaviorSubject<Discussion[]>([]);
  discussions$ = this.discussionsSource.asObservable();

  constructor(private firestore: Firestore, private dateService: DateService, private userService: UsersService, private router: Router) {

  }

  setRoute(routeName: string) {
    return this.routeSource.next(routeName)
  }

  setCurrentDiscussion(discussion: any) {
    return this.currentDiscussionSource.next(discussion)
  }

  setDiscussions(discussions: any) {
    return this.discussionsSource.next(discussions)
  }

  removeFromDiscussion(discussion: Discussion) {
    const discussions = this.discussionsSource.getValue().filter(d => d.id !== discussion.id)
    return this.discussionsSource.next(discussions)
  }

  addToDiscussion(discussion: Discussion) {
    const discussions: Discussion[] = this.discussionsSource.getValue()
    this.discussionsSource.next([...discussions, discussion])
  }

  async getDiscussions(): Promise<Discussion[]> {
    const discussionCollection = collection(this.firestore, 'discussion');
    let userId = this.userService.getCurrentUser().uid

    const creatorQuery = query(discussionCollection, where('creatorId', '==', userId));
    const creatorDocs = await getDocs(creatorQuery);
    const creatorDiscussions = creatorDocs.docs.map(doc => ({id: doc.id, ...doc.data()} as Discussion));

    // Récupérer les discussions où il est participant
    const participantQuery = query(discussionCollection, where('participants', 'array-contains', userId));
    const participantDocs = await getDocs(participantQuery);
    const participantDiscussions = participantDocs.docs.map(doc => ({id: doc.id, ...doc.data()} as Discussion));

    // Fusionner les résultats en évitant les doublons
    const discussions = [...creatorDiscussions, ...participantDiscussions];
    const uniqueDiscussions = Array.from(new Map(discussions.map(d => [d.id, d])).values());

    // Ajouter les valeurs suplémentaires
    const discussionsWithCreators = [];

    for (const d of uniqueDiscussions) {
      if (d.creatorId) {
        let author = await this.userService.getUserWithId(d.creatorId);
        discussionsWithCreators.push({ ...d, creator: author });
      } else {
        discussionsWithCreators.push(d);
      }
    }

    this.setDiscussions(discussionsWithCreators);
    return discussionsWithCreators
  }

  async getDiscussion(id: string): Promise<null | Discussion> {
    const discussionCollection = doc(this.firestore, 'discussion', id);
    const snapshot = await getDoc(discussionCollection);
    if (snapshot.exists()) {
      return {...snapshot.data(), id: id} as Discussion
    }
    return null;
  }

  async createDiscussion(discussion: Discussion) {
    let currentUser = this.userService.getCurrentUser()
    discussion.participants.push(currentUser.uid)
    discussion.createdAt = this.dateService.getTodayDate()
    discussion.creatorId = currentUser.uid
    const discussionsRef = collection(this.firestore, 'discussion');

    let docRef = await addDoc(discussionsRef, discussion);
    console.log("discussion created")
      this.addToDiscussion({...discussion, id: docRef.id,creator: currentUser})
    return {...discussion, id: docRef.id};
  }

  async editDiscussion(discussion: Discussion): Promise<any> {
    if (!discussion || !discussion.id) {
      console.log("Discussion can't be edited");
      return;
    }
    const documentRef = doc(this.firestore, 'discussion', discussion.id);
    try {
      await updateDoc(documentRef, discussion);
      const snapshot = await getDoc(documentRef);
      if (snapshot.exists()) {
        return snapshot.data() as Discussion
      } else return null;
    } catch (error) {
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
    this.removeFromDiscussion(discussion)
    let messagesRef = collection(this.firestore, 'messages');

    return getDocs(messagesRef)
      .then((querySnapshot) => {
        const deletePromises = querySnapshot.docs
          .filter(doc => doc.data()['discussionId'] === discussion.id) // Filtrer les messages de la discussion
          .map(doc => deleteDoc(doc.ref));

        return Promise.all(deletePromises);
      })
      .then(() => deleteDoc(discussionRef));
  }

}
