import {Component, Input, input, signal} from '@angular/core';
import {Discussion} from '../../../model/discussion.type';
import {DiscussionService} from '../../../services/discussion.service';
import {Router, Routes} from '@angular/router';
import {Message} from '../../../model/message.type';
import {User} from '../../../model/user.type';
import {FormsModule} from '@angular/forms';
import {MessageService} from '../../../services/message.service';
import {UsersService} from '../../../services/users.service';

@Component({
  selector: 'app-one-discussion',
  imports: [
    FormsModule
  ],
  templateUrl: './one-discussion.component.html',
  styleUrl: './one-discussion.component.css'
})
export class OneDiscussionComponent {
  @Input() discussion: any;
  route = input()
  messages = signal<Message[]>([])
  newMessage: Message = {
    content: "",
    createdAt: "",
    creatorId: "",
    discussionId: "",
    id: ""

  }
  currentUserId = signal<string|null>(null)

  constructor(private discussionService: DiscussionService, private userService: UsersService, private router: Router, private messageService: MessageService) {
  }

  ngOnInit() {
    console.log(this.discussion);

    console.log(this.route);
    this.newMessage.discussionId = this.discussion.id
    this.currentUserId.set(this.userService.getCurrentUser().uid)
    this.getMessages()

    console.log("current user id ",this.currentUserId);
  }

  async getMessages() {
    if (!this.discussion || !this.discussion.id) {
      console.error("Erreur : discussionId non défini !");
      return;
    }
    console.log("lets get messages")
    let messages = await this.messageService.getAllMessageOfConversations(this.discussion.id)
    console.log("Messages récupérés :", messages);
    this.messages.set(messages)

  }

  edit() {
    this.discussionService.setRoute("edit-discussion")
  }

  async delete() {

    let res = await this.discussionService.deleteDiscussion(this.discussion)
    this.discussion = null
  }

  async onSubmitCreateMessage() {
    console.log("send message")
    console.log(this.newMessage.content.replace(/\s/g, ''))
    if (this.newMessage.content.replace(/\s/g, '') !== "") {
      let createdMessage = await this.messageService.sendMessage(this.newMessage, this.discussion.id)
      console.log(createdMessage)
    }
  }

}

