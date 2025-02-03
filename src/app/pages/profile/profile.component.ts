import {Component, signal} from '@angular/core';
import {UsersService} from '../../services/users.service';
import {Router} from '@angular/router';
import {User} from '../../model/user.type';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  currentUser = signal<User|null>(null)

  constructor(private userService: UsersService, private router: Router) {
  }

  async ngOnInit() {
    const user = await this.userService.getCurrentUser()

    if (user) {
      console.log("Fetched user for navbar:", user);
      this.userService.setCurrentUser(user);
    }
    this.userService.currentUser$.subscribe((user: User | null) => {

      this.currentUser.set(user);
      console.log("User updated in profile:", this.currentUser);

    });
  }


  logout() {
    this.userService.logout()
    this.router.navigate(['/auth'])
  }
  async delete() {
    await this.userService.deleteProfile()
    this.router.navigate(['/auth'])
  }
}
