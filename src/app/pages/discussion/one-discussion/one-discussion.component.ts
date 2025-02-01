import {Component, Input, input, signal} from '@angular/core';
import {Discussion} from '../../../model/discussion.type';
import {DiscussionService} from '../../../services/discussion.service';
import {Router, Routes} from '@angular/router';
import {Message} from '../../../model/message.type';
import {User} from '../../../model/user.type';
import {FormsModule} from '@angular/forms';
import {MessageService} from '../../../services/message.service';
import {UsersService} from '../../../services/users.service';
import {serverTimestamp} from '@angular/fire/firestore';

@Component({
  selector: 'app-one-discussion',
  imports: [
    FormsModule
  ],
  templateUrl: './one-discussion.component.html',
  styleUrl: './one-discussion.component.css'
})
export class OneDiscussionComponent {

  discussion: Discussion  = {
    title:"",
    creatorId:"",
    participants:[],
    createdAt:"",
    id:""
  };
  messages = <Message[]>[]
  newMessage: Message = {
    content: "",
    createdAt: new Date().getTime(),
    createdAtString: "",
    creatorId: "",
    discussionId: "",

  }
  currentUserId = signal<string | null>(null)

  constructor(private discussionService: DiscussionService, private userService: UsersService, private router: Router, private messageService: MessageService) {
  }

  ngOnInit() {
    this.discussionService.currentDiscussion$.subscribe(async discussion => {
      this.discussion = discussion
      console.log("discussion:", this.discussion)
      if (!this.discussion || !this.discussion.id) {
        return;
      }
      console.log("discussion:", this.discussion)
      this.newMessage.discussionId = this.discussion.id
      this.currentUserId.set(this.userService.getCurrentUser().uid)
      await this.getMessages()


    })

  }

  async getMessages() {
    if (!this.discussion || !this.discussion.id) {
      console.error("Erreur : discussionId non défini !");
      return;
    }
    console.log("recuperation des messages pour :",this.discussion.id)
    let messages = await this.messageService.getAllMessageOfConversations(this.discussion.id)
    console.log("Messages récupérés :", messages);
    this.messages = messages

  }

  edit() {
    this.discussionService.setRoute("edit-discussion")
  }

  async delete() {

    if (!this.discussion) {
      console.log("no discussion")
      return;
    }
    let res = await this.discussionService.deleteDiscussion(this.discussion)

    this.discussion = {
      title:"",
      creatorId:"",
      participants:[],
      createdAt:"",
      id:""
    }
  }

  async deleteMessage(messageId: string) {
    let messageIdDeleted = await this.messageService.deleteMessage(messageId)
    this.messages = this.messages.filter(message => message.id !== messageIdDeleted);
  }

  async onSubmitCreateMessage() {
    if (!this.discussion || !this.discussion.id) {
      console.log("no discussion")
      return;
    }
    console.log("send message")
    if (this.newMessage.content.replace(/\s/g, '') !== "") {
      let createdMessage = await this.messageService.sendMessage(this.newMessage, this.discussion.id)
      console.log(createdMessage)
      this.newMessage.content = ""
      this.messages.push(createdMessage)
    }
  }

}

