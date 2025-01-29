import {Component, inject, NgZone, OnInit, signal} from '@angular/core';
import {Firestore, collection, collectionData, getFirestore} from '@angular/fire/firestore';
import {AsyncPipe, CommonModule} from '@angular/common';
import {UsersService} from '../../services/users.service';
import {catchError, EMPTY} from 'rxjs';
import {User} from "../../model/user.type"

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
  ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  users = signal<Array<any>>([])

  editUser: User | null = null;

  constructor(private usersService: UsersService) {

  }

  ngOnInit(): void {
    this.getALlUser();

  }

  getALlUser() {
    this.usersService.getUsers()
      .pipe(
        catchError(err => {
          console.error('Error while fetching user data:', err);
          alert('Error while fetching user data'); // Affiche une alerte utilisateur
          return EMPTY;
        }))
      .subscribe(res => {
        this.users.set(res)
      })
  }



  getTextInput(e: KeyboardEvent) {
    console.log(e.key)
    console.log((e.target as HTMLInputElement).value)
  }


}
