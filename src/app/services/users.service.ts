import {Injectable} from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  Firestore, getDoc, getDocs,
  setDoc,
  updateDoc, where
} from '@angular/fire/firestore';
import {BehaviorSubject, catchError, EMPTY, Observable} from 'rxjs';
import {User} from '../model/user.type';
import {
  Auth,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut, updateProfile, deleteUser
} from '@angular/fire/auth';
import {Discussion} from '../model/discussion.type';
import {DiscussionService} from './discussion.service';
import {Message} from '../model/message.type';
import {MessageService} from './message.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private userSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.userSource.asObservable()

  private usersNotParticipantsSource = new BehaviorSubject<User[]>([]);
  usersNotParticipantsSource$ = this.usersNotParticipantsSource.asObservable()

  private usersInDiscussionSource = new BehaviorSubject<User[]>([]);
  usersInDiscussionSource$ = this.usersInDiscussionSource.asObservable()

  constructor(private firestore: Firestore, private auth: Auth  ) {

  }

  setCurrentUser(user: User | null) {
    return this.userSource.next(user);
  }

  setUsersNotParticipantsSource(users: User[]) {
    return this.usersNotParticipantsSource.next(users);
  }

  setUsersInDiscussionSource(users: User[]) {
    return this.usersInDiscussionSource.next(users);
  }


  async getUsersNotParticipants(discussion: Discussion) {
    let users = collection(this.firestore, 'users')
    let usersSnapshot = await getDocs(users)
    let usersToReturn: User[] = []
    let userUId = this.getCurrentUser().uid

    if (!usersSnapshot.empty) {
      usersSnapshot.forEach(doc => {
        const user = doc.data() as User

        if (user.uid && !discussion.participants.includes(user.uid) && user.uid != userUId) {
          usersToReturn.push(user)
        }
      })
    }
    this.setUsersNotParticipantsSource(usersToReturn);
    return usersToReturn

  }

  async getUsersinDiscussion(discussion: Discussion) {
    let usersToReturn: User[] = []
    let userUId = this.getCurrentUser().uid

    for (const userId of discussion.participants) {
      const user = await this.getUserWithId(userId)
      if (user && userUId != user.uid) usersToReturn.push(user)
    }
    this.setUsersInDiscussionSource(usersToReturn);
    return usersToReturn
  }

  getCurrentUser(): any {
    const firebaseUser: FirebaseUser | null = this.auth.currentUser;
    console.log("firebase user :", firebaseUser);
    if (!firebaseUser) {
      return null;
    }
    console.log("firebaseuser :", firebaseUser);
    this.setCurrentUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName ? firebaseUser.displayName : "defaultUsername",
      photoURL: firebaseUser.photoURL,
    });
    //  to return User object
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  // Méthode pour récupérer les utilisateurs
  getUsers(): Observable<User[]> {
    const userCollection = collection(this.firestore, 'user'); // Nom de la collection

    return collectionData(userCollection, {idField: 'id'}).pipe(
      // @ts-ignore
      catchError(err => {
        console.error('Error while fetching user data:', err);
        alert('Error while fetching user data'); // Affiche une alerte utilisateur
        return EMPTY; // Retourne un Observable vide pour éviter les erreurs
      })
    )
  }

  async register(email: string, password: string, displayName: string) {
    const userData = await createUserWithEmailAndPassword(this.auth, email, password);

    const user = userData.user;
    await updateProfile(user, {
      displayName: displayName,
    });
    const userDocRef = doc(this.firestore, 'users', user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      uid: user.uid,
      displayName: displayName,
      createdAt: new Date().toISOString(),
    });

  }

  // Connexion
  async login(email: string, password: string) {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format.');
    }
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    this.setCurrentUser(null);
    return signOut(this.auth);
  }

  async deleteProfile() {
    const firebaseUser: FirebaseUser | null = this.auth.currentUser;

    if (!firebaseUser) {
      console.error('No current user');
      return;
    }

    const uid = firebaseUser.uid;

    try {
      // Delete the user profile
      await this.deleteUserProfile(uid);
    } catch (error) {
      console.error('Error deleting user profile:', error);
    }

    try {
      // Remove user from discussions
      await this.removeUserFromDiscussions(uid);
    } catch (error) {
      console.error('Error deleting participants of discussion:', error);
    }

    try {
      // Remove all user messages
      await this.removeUserMessages(uid);
    } catch (error) {
      console.error('Error deleting messages of user:', error);
    }
  }

  private async deleteUserProfile(uid: string) {
    // Delete the user from Firebase Authentication
    const firebaseUser = this.auth.currentUser;
    if (firebaseUser) {
      await deleteUser(firebaseUser);
    }

    // Delete the user document from Firestore
    const userDoc = doc(this.firestore, 'users', uid);
    await deleteDoc(userDoc);
  }
  private async removeUserFromDiscussions(uid: string) {
    const discussionsCollection = collection(this.firestore, 'discussion');
    const discussionsSnapshot = await getDocs(discussionsCollection);

    const discussionUpdates = discussionsSnapshot.docs.map(async (discussionDoc) => {
      let discussion = discussionDoc.data() as Discussion;

      // Vérifier si l'utilisateur fait partie de la discussion et le supprimer
      if (discussion.participants.includes(uid)) {
        discussion.participants = discussion.participants.filter(userID => userID !== uid);

        // Mise à jour du document de la discussion dans Firestore
        const documentRef = doc(this.firestore, 'discussion', discussionDoc.id); // Utilisation de `discussionDoc.id` comme ID du document
        try {
          await updateDoc(documentRef, { participants: discussion.participants });
        } catch (error) {
          console.error('Error updating discussion:', error);
        }
      }
    });

    // Attendre que toutes les mises à jour soient terminées
    await Promise.all(discussionUpdates);
  }


  private async removeUserMessages(uid: string) {
    const messagesCollection = collection(this.firestore, 'messages');
    const messagesSnapshot = await getDocs(messagesCollection);

    const messageDeletions = messagesSnapshot.docs.map(async (doc) => {
      let message = doc.data() as Message;

      // Vérifier si le message a été créé par l'utilisateur et le supprimer
      if (message.creatorId === uid && message.id) {
        try {
          await deleteDoc(doc.ref); // Utilisation de `doc.ref` pour la suppression
        } catch (error) {
          console.error('Error deleting message:', error);
        }
      }
    });

    // Attendre que toutes les suppressions soient terminées
    await Promise.all(messageDeletions);
  }



  async getUserWithId(id: string): Promise<User | null> {
    try {
      const q = query(collection(this.firestore, "users"), where("uid", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return userDoc.data() as User;

      } else {
        return null;
      }

    } catch (err) {
      console.error(err)
      return null;
    }
  }


}
