import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {AuthComponent} from './pages/auth/auth.component';
import {ProfileComponent} from './pages/profile/profile.component';
import {ErrorComponent} from './pages/error/error.component';
import {AuthGuard} from '@angular/fire/auth-guard';
import {NewDiscussionComponent} from './pages/discussion/new-discussion/new-discussion.component';
import {DiscussionsComponent} from './pages/discussion/discussions/discussions.component';
import {OneDiscussionComponent} from './pages/discussion/one-discussion/one-discussion.component';
import {EditDiscussionComponent} from './pages/discussion/edit-discussion/edit-discussion.component';

export const routes: Routes = [
  { path: '', component: HomeComponent ,pathMatch: 'full' },
  {path:"auth", component: AuthComponent},
   {path:"profile", component: ProfileComponent, canActivate:[AuthGuard]},
   {path:"discussions", component: DiscussionsComponent, canActivate:[AuthGuard]},
  { path: '**', component: ErrorComponent, pathMatch: 'full' },

];
