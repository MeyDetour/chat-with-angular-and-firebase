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
  selectedUsers: { [key: string]: boolean } = {};
  errorMessage: null | string = '';
  successMessage: string = '';
  currentDiscussion!: Discussion | null;
  usersNotInGroup: User[] = [];

  constructor(private discussionService: DiscussionService, private userService: UsersService) {
  }

  async ngOnInit() {
    this.discussionService.currentDiscussion$.subscribe(discussion => {
      this.currentDiscussion = discussion;
    })
    this.userService.usersNotParticipantsSource$.subscribe(users => {
      this.usersNotInGroup = users;
      console.log("suers not in group:",users)
    })
    this.discussionService.currentDiscussion$.subscribe(async discussion => {
      this.currentDiscussion = discussion;
      if (this.currentDiscussion) {
        await this.userService.getUsersNotParticipants(this.currentDiscussion)
      }
    })
    if (this.currentDiscussion) {
      await this.userService.getUsersNotParticipants(this.currentDiscussion)
    }
  }

  onSubmit() {
    const selectedUserIds = Object.keys(this.selectedUsers).filter(uid => this.selectedUsers[uid]);
    console.log("Utilisateurs sélectionnés :", selectedUserIds);

    return;
  }
  //   if (!this.currentDiscussion) {
  //     this.errorMessage = "You must add two people to create group"
  //     return
  //   }
  //   if (this.currentDiscussion.participants.length < 1) {
  //     this.errorMessage = "You must add two people to create group"
  //     return;
  //   }
  //   if (this.currentDiscussion.title == "") {
  //     this.errorMessage = "You must enter a title"
  //     return;
  //   }
  //   this.discussionService.editDiscussion(this.currentDiscussion)
  //     .then((response) => {
  //       console.log("sicessfully edited :", response)
  //       this.discussionService.setRoute("one-discussion")
  //     }).catch((error) => {
  //     console.log("error while editing discussion : ", error.message)
  //   })
  // }
}
