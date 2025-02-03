import {Component, input, Input} from '@angular/core';
import {Discussion} from '../../../model/discussion.type';
import {User} from '../../../model/user.type';
import {DiscussionService} from '../../../services/discussion.service';
import {FormsModule} from '@angular/forms';
import {UsersService} from '../../../services/users.service';

@Component({
  selector: 'app-edit-discussion',
  imports: [
    FormsModule
  ],
  templateUrl: './edit-discussion.component.html',
  styleUrl: './edit-discussion.component.css'
})
export class EditDiscussionComponent {
  selectedUsers: string[] = [];
  errorMessage: null | string = '';
  successMessage: string = '';
  currentDiscussion!: Discussion | null;
  usersNotInGroup: User[] = [];
  usersInGroup: User[] = [];
  constructor(private discussionService: DiscussionService, private userService: UsersService) {
  }

  async ngOnInit() {
    this.discussionService.currentDiscussion$.subscribe(discussion => {
      this.currentDiscussion = discussion;
    })
    this.userService.usersNotParticipantsSource$.subscribe(users => {
      this.usersNotInGroup = users;
      console.log("suers not in group:", users)
      console.log("user in selection :",this.selectedUsers);

    })
    this.userService.usersInDiscussionSource$.subscribe(users => {
      this.usersInGroup = users;
      console.log("uers in group:", users);

      this.selectedUsers= []

      users.forEach(user => {
        if (user.uid && !this.selectedUsers.includes(user.uid)) {
          this.selectedUsers.push(user.uid)
        }
      });

      console.log("user in selection :",this.selectedUsers);
    })
    this.discussionService.currentDiscussion$.subscribe(async discussion => {
      this.currentDiscussion = discussion;
      if (this.currentDiscussion) {
        await this.userService.getUsersNotParticipants(this.currentDiscussion)
      }
    })
    if (this.currentDiscussion) {
      await this.userService.getUsersNotParticipants(this.currentDiscussion)
      await this.userService.getUsersinDiscussion(this.currentDiscussion)
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

  onSubmit() {
    console.log("selected user :",this.selectedUsers);

    if (!this.currentDiscussion) {
      this.errorMessage = "You must add two people to create group"
      return
    }


     this.currentDiscussion.participants = this.selectedUsers
    console.log("selecte user :",this.selectedUsers);

    if (this.currentDiscussion.participants.length < 2) {
      this.errorMessage = "You must add two people to create group"
      return;
    }

    if (this.currentDiscussion.title == "") {
      this.errorMessage = "You must enter a title"
      return;
    }
    this.discussionService.editDiscussion(this.currentDiscussion)
      .then((response) => {
        console.log("sicessfully edited :", response)
        this.discussionService.setRoute("one-discussion")
     this.selectedUsers = []
      }).catch((error) => {
      console.log("error while editing discussion : ", error.message)
    })
  }


}
