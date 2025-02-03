import {Component, input, Input, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {IconComponent} from '../../../components/icon/icon.component';
import {Discussion} from '../../../model/discussion.type';
import {DiscussionService} from '../../../services/discussion.service';
import {Router} from '@angular/router';
import {UsersService} from '../../../services/users.service';
import {User} from '../../../model/user.type';

@Component({
  selector: 'app-new-discussion',
  imports: [
    FormsModule,
    IconComponent
  ],
  templateUrl: './new-discussion.component.html',
  styleUrls: ['./new-discussion.component.css']
})
export class NewDiscussionComponent {
  newDiscussion: Discussion = {
    title: "",
    creatorId: "",
    participants: [],
    createdAt: "",
  }

  selectedUsers: string[] = [];
  usersNotInGroup: User[] = [];
  errorMessage: null | string = '';
  successMessage: string = '';

  constructor(private discussionService: DiscussionService, private router: Router, private userService :UsersService) {

  }
  async ngOnInit() {
    let user = this.userService.getCurrentUser()
    this.newDiscussion.participants.push(user.uid);

    this.userService.usersNotParticipantsSource$.subscribe(users => {
      this.usersNotInGroup = users;
      console.log("suers not in group:", users)
      console.log("user in selection :", this.selectedUsers);

    })

    if (this.newDiscussion) {
      await this.userService.getUsersNotParticipants(this.newDiscussion)
      await this.userService.getUsersinDiscussion(this.newDiscussion)
    }
  }

  toggleUserSelection(userId: string) {
    console.log(userId ," ? in selected suer");
    console.log("selected user :",this.selectedUsers)
    if (this.selectedUsers.includes(userId)) {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userId); // Supprime si déjà sélectionné
      console.log("remove user ")
      console.log("selected user :",this.selectedUsers)
    } else {
      this.selectedUsers.push(userId);
      console.log("add user ")
      console.log("selected user :",this.selectedUsers)
    }
    console.log("Selected Users:", this.selectedUsers);
  }





  async onSubmit() {
    this.newDiscussion.participants = this.selectedUsers
    console.log("selecte user :",this.selectedUsers);

    if (this.newDiscussion.participants.length < 2) {
      this.errorMessage = "You must add two people to create group"
    }
    if (this.newDiscussion.title == "") {
      this.errorMessage = "You must enter a title"
    }
    const createdDiscussion = await this.discussionService.createDiscussion(this.newDiscussion);
    console.log('Discussion créée avec succès :', createdDiscussion);
    this.selectedUsers = []
    this.discussionService.setRoute("one-discussion");
    this.discussionService.setCurrentDiscussion(createdDiscussion);
    this.discussionService.addToDiscussion(createdDiscussion);

  }
}
