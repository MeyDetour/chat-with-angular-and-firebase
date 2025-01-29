import {Component, signal} from '@angular/core';
import {Firestore} from '@angular/fire/firestore';
import {Router, RouterLink} from '@angular/router';
import {DiscussionService} from '../../../services/discussion.service';
import {catchError, of} from 'rxjs';
import {Discussion} from '../../../model/discussion.type';
import {UsersService} from '../../../services/users.service';
import {OneDiscussionComponent} from '../one-discussion/one-discussion.component';
import {EditDiscussionComponent} from '../edit-discussion/edit-discussion.component';
import {NewDiscussionComponent} from '../new-discussion/new-discussion.component';

@Component({
  selector: 'app-discussions',
  imports: [
    RouterLink,
    OneDiscussionComponent,
    EditDiscussionComponent,
    NewDiscussionComponent
  ],
  templateUrl: './discussions.component.html',
  styleUrl: './discussions.component.css',

})
export class DiscussionsComponent {
  discussions = signal<Discussion[]>([])
  currentDiscussion!: Discussion | null
  route!: string

  // one-discussion  new-discussion   edit-discussion

  constructor(private discussionService: DiscussionService, private userService: UsersService, private router: Router) {
  }

  ngOnInit() {
    this.getDiscussionsData()
    this.discussionService.currentDiscussion$.subscribe(discussion => {
      this.currentDiscussion = discussion
    })
    this.discussionService.route$.subscribe(route => {
      this.route = route
    })
  }


  openPanelNewDiscussion() {
    this.discussionService.setRoute("new-discussion")
  }

  async changeDiscussion(id: string | undefined) {
    console.log('get discussion', id);
    if (id) {
      const discussion = await this.discussionService.getDiscussion(id)
      console.log(discussion)
      this.discussionService.setCurrentDiscussion(discussion)
      this.discussionService.setRoute("one-discussion")
    }
  }

  getDiscussionsData() {
    this.discussionService.getDiscussions().pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des discussions :', error);
        return of([]); // Retourne un tableau vide en cas d'erreur pour éviter que l'application ne plante
      })
    )
      .subscribe(async discussions => {
        let discussionFinalData: Array<Discussion> = [];
        for (const [index, discussion] of discussions.entries()) {

          if (discussion.creatorId) {
            let author = await this.userService.getUserWithId(discussion.creatorId)
            discussion.creator = author;
          }
          discussionFinalData.push(discussion);
          if (index == 0) {
            this.discussionService.setCurrentDiscussion(discussion)
          }

        }
        this.discussions.set(discussionFinalData)
      });
  }


}
