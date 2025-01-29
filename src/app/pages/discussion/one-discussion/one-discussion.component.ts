import {Component, Input, input} from '@angular/core';
import {Discussion} from '../../../model/discussion.type';
import {DiscussionService} from '../../../services/discussion.service';
import {Router, Routes} from '@angular/router';

@Component({
  selector: 'app-one-discussion',
  imports: [],
  templateUrl: './one-discussion.component.html',
  styleUrl: './one-discussion.component.css'
})
export class OneDiscussionComponent {
  @Input() discussion: any;
  route = input()

  constructor(private discussionService: DiscussionService, private router: Router) {
  }

  ngOnInit() {
    console.log(this.discussion);
    console.log(this.route);
  }

  edit() {
    this.discussionService.setRoute("edit-discussion")
  }

  async delete() {

    let res = await this.discussionService.deleteDiscussion(this.discussion)
    this.discussion.set(null)
  }

  update() {
    this.router.navigate(["/discussion/edit/" + this.discussion.id])
  }
}

