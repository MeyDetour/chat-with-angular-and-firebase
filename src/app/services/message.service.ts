import {Injectable} from '@angular/core';
import {Message} from "../model/message.type"
import {UsersService} from './users.service';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  where,
  query,
  getDocs,
  orderBy,
  serverTimestamp, deleteDoc
} from '@angular/fire/firestore';
import {DateService} from './date.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private dateService: DateService, private userService: UsersService, private firestore: Firestore) {
  }

  async getAllMessageOfConversations(discussionId: string) {
    let messagesRef = collection(this.firestore, 'messages');
    const queryToGetMessages = query(messagesRef, where("discussionId", "==", discussionId));

    //get all docs use get docs not get doc
    let snap = await getDocs(queryToGetMessages);
    let messages: any[] = [];
    snap.forEach((doc) => {
      messages.push({id: doc.id, ...doc.data()});
    });
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return messages;
  }

  async deleteMessage(messageId: string) {
    try {
      const messageRef = doc(this.firestore, 'messages', messageId);

      await deleteDoc(messageRef);
      console.log(`Message ${messageId} supprimé avec succès.`);
      return messageId
    } catch (error) {
      console.error("Erreur lors de la suppression du message :", error);
    return null;
    }
  }

  async sendMessage(message: Message, discussionId: string) {
    try {
      message.createdAtString = this.dateService.getTodayDate()
      message.createdAt = new Date().getTime()
      message.creatorId = this.userService.getCurrentUser().uid;
      message.discussionId = discussionId
      console.log(message)
      const messagesRef = collection(this.firestore, "messages");

      const docRef = await addDoc(messagesRef, message);
      console.log("Discussion created with ID:", docRef.id);

      // Retourne l'objet Discussion avec l'ID assigné par Firebase
      return {...message, id: docRef.id};
    } catch (error) {
      console.error("Error creating discussion:", error);
      throw error;
    }
  }

}
