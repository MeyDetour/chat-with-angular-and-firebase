import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {environment} from './app/environements/environement';

console.log('Bootstrapping Application');
bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('Application Bootstrapped')
  })
  .catch((err) => console.error('Error bootstrapping application:', err));
