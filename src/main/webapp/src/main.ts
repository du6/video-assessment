import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

declare var gapi: any;

if (environment.production) {
  enableProdMode();
}

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { VideoAssessmentAppModule } from './app/app.module';

gapi.load('auth2', () => {
  gapi.auth2.init({
    client_id: '444747905558-ob3ds8e779plm0269d5sgvl4te5an5ch.apps.googleusercontent.com',
    cookiepolicy: 'single_host_origin',
    scope: 'email profile'
  }).then(() => {
    gapi.client.load('videoAssessmentApi', 'v1', 
    () => platformBrowserDynamic().bootstrapModule(VideoAssessmentAppModule), 
    'https://video-assessment.appspot.com/_ah/api');
  });
});
