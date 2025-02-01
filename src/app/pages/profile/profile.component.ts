import {Component} from '@angular/core';
import {UsersService} from '../../services/users.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(private userService: UsersService, private router: Router) {
  }

  logout() {
    this.userService.logout()
    this.router.navigate(['login'])
  }
}
