import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {UsersService} from '../../services/users.service';
import {User} from '../../model/user.type';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  currentUser = signal<User|null>(null)
  constructor(private userService: UsersService) {

  }

  async ngOnInit() {
    const user = await this.userService.getCurrentUser()

    if (user) {
      console.log("Fetched user for navbar:", user);
      this.userService.setCurrentUser(user);
    }
    this.userService.currentUser$.subscribe((user: User | null) => {

        this.currentUser.set(user);
        console.log("User updated in navbar:", this.currentUser);

    });
  }
}
