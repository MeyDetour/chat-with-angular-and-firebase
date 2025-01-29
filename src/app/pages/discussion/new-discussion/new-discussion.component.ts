import {Component, input, Input, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {IconComponent} from '../../../components/icon/icon.component';
import {Discussion} from '../../../model/discussion.type';
import {DiscussionService} from '../../../services/discussion.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-discussion',
  imports: [
    FormsModule,
    IconComponent
  ],
  templateUrl: './new-discussion.component.html',
  styleUrl: './new-discussion.component.css'
})
export class NewDiscussionComponent {
  newDiscussion: Discussion = {
    title: "",
    creatorId: "",
    participants: ["jsp"],
    createdAt: "",
  }

  constructor(private discussionService: DiscussionService, private router: Router) {

  }

  errorMessage: null | string = '';
  successMessage: string = '';


  async onSubmit() {
    if (this.newDiscussion.participants.length < 1) {
      this.errorMessage = "You must add two people to create group"
    }
    if (this.newDiscussion.title == "") {
      this.errorMessage = "You must enter a title"
    }
    const createdDiscussion = await this.discussionService.createDiscussion(this.newDiscussion);
    console.log('Discussion créée avec succès :', createdDiscussion);

    this.discussionService.setRoute("one-discussion");

  }
}
