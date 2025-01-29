import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {provideFirebaseApp,initializeApp} from '@angular/fire/app';
import {environment} from './environements/environement';
import {getAnalytics, provideAnalytics} from '@angular/fire/analytics';
import {provideHttpClient} from '@angular/common/http';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {AngularFireDatabaseModule} from '@angular/fire/compat/database';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => {
      console.log('Initializing Firebase'); // Log ici
      const app = initializeApp(environment.firebaseConfig);

      console.log('Firebase Initialized:', app.name); // Log l'initialisation
      return app;
    }),

    provideFirestore(() => {
      console.log('Initializing Firestore'); // Log ici
      return getFirestore();
    }),
    provideAnalytics(() => {
      console.log('Initializing Analytics'); // Log ici
      return getAnalytics();
    }),
    provideAuth(() => {
      console.log('Initializing Auth'); // Log pour Auth
      return getAuth();
    }),
  ]
};
