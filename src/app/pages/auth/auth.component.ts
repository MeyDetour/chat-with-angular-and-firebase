import {Component, inject, signal} from '@angular/core';
import {FormsModule, NgForm, ReactiveFormsModule} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {User} from '../../model/user.type';
import {UsersService} from '../../services/users.service';
import {IconComponent} from '../../components/icon/icon.component';
import {GoogleAuthProvider} from '@firebase/auth';
import {Auth, signInWithPopup} from '@angular/fire/auth';
import {environment} from '../../environements/environement';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IconComponent
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {



  newUser: User = {
    displayName: "",
    email: "",
    password: "",
    photoURL: "",
  }
  type = signal<'signup' | 'login'>('signup')

  errorMessage: null | string = '';
  successMessage: string = '';

  auth = inject(Auth)

  constructor(private userService: UsersService, private router: Router) {
  }


  setType(type: 'signup' | 'login') {
    this.type.set(type)
  }

  async onSubmit() {
    if (!this.newUser.email || !this.newUser.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    try {
      if (this.type() == "signup") {
        if (this.newUser.displayName ==""){
          this.newUser.displayName = "defaultUsername"
        }
        await this.userService.register(this.newUser.email, this.newUser.password,this.newUser.displayName);
        this.successMessage = 'Signup successfully.';
        this.router.navigate(['/profile']);
      } else {
        await this.userService.login(this.newUser.email, this.newUser.password);
        this.successMessage = 'Login successfully.';
      }
      this.router.navigate(['/discussions']); // Redirige vers une autre page après connexion
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
      this.successMessage = '';
    }
  }


  getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Email incorrect.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/email-already-in-use':
        return 'An user already exists with this email.';
      default:
        return 'Something went wrong. Please try again later.';
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    try {
      // Authentification via Google
      const result = await signInWithPopup(this.auth, provider);

      // Récupération des informations utilisateur
      const user = result.user;

      console.log('User successfully logged in with Google:', user);

      this.router.navigate(['/discussions']);

    } catch (error: any) {

      console.error('Google login failed:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        this.errorMessage = 'The login popup was closed before completion.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        this.errorMessage = 'Login popup was canceled.';
      } else {
        this.errorMessage = `Login failed: ${error.message}`;
      }
    }
  }




}
