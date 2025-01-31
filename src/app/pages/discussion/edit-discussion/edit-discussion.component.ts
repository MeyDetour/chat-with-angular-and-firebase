import {Component, input, Input} from '@angular/core';
import {Discussion} from '../../../model/discussion.type';
import {DiscussionService} from '../../../services/discussion.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-discussion',
  imports: [
    FormsModule
  ],
  templateUrl: './edit-discussion.component.html',
  styleUrl: './edit-discussion.component.css'
})
export class EditDiscussionComponent {

  errorMessage: null | string = '';
  successMessage: string = '';
  currentDiscussion!: Discussion | null;

  constructor(private discussionService: DiscussionService) {
  }

  ngOnInit() {
    this.discussionService.currentDiscussion$.subscribe(discussion => {
      this.currentDiscussion = discussion;
    })
  }

  onSubmit() {
    console.log(this.currentDiscussion);
    if (!this.currentDiscussion) {
      this.errorMessage = "You must add two people to create group"
    return
    }
    if (this.currentDiscussion.participants.length < 1) {
      this.errorMessage = "You must add two people to create group"
    return;
    }
    if (this.currentDiscussion.title == "") {
      this.errorMessage = "You must enter a title"
    return;
    }
    this.discussionService.editDiscussion(this.currentDiscussion)
      .then((response) => {
        console.log("sicessfully edited :",response)
      }).catch((error)=>{
      console.log("error while editing discussion : ",error.message)
    })
  }
}
