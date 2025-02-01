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
  signOut, updateProfile
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private userSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.userSource.asObservable()

  constructor(private firestore: Firestore, private auth: Auth) {

  }
  setCurrentUser(user: User|null) {
    return this.userSource.next(user);
  }

  getCurrentUser(): any {
    const firebaseUser: FirebaseUser | null = this.auth.currentUser;
    console.log("firebase user :",firebaseUser);
    if (!firebaseUser) {
      return null;
    }
    console.log("firebaseuser :", firebaseUser);
    this.setCurrentUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
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

  async getUserWithId(id: string): Promise<User | null> {
    try {
      const q = query(collection(this.firestore, "users"), where("uid", "==", id));
      const querySnapshot = await getDocs(q) ;

      if (!querySnapshot.empty) {
         const userDoc = querySnapshot.docs[0];
         const userData = userDoc.data() as User;
        return userData
      }else{
        return null;
      }

    } catch (err) {
      console.error(err)
      return null;
    }
  }


}
