import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar.component';
import {UsersService} from './services/users.service';
import {User} from "./model/user.type"

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  currentUser : User|null = null
  constructor(private userService : UsersService) {
  }
  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();

    // follow change of user

  }

  title = 'chat';
}
