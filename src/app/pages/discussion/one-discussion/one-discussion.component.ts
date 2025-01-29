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

  constructor(private discussionService: DiscussionService,private router :Router) {
  }

  ngOnInit() {
    console.log(this.discussion);
  }


  async delete() {
    let res = await this.discussionService.deleteDiscussion(this.discussion)
    console.log("delete")
  }
  update(){
this.router.navigate(["/discussion/edit/"+this.discussion.id])
  }
}

