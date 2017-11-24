import { Component, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'video-assessment-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class VideoAssessmentAppComponent {
  title: string = "Talk Me Up";
  isMcginnis = false;

  constructor(private router_: Router, 
    private auth_: AuthService, 
    private zone_: NgZone) {
      router_.events
          .filter(event => event instanceof NavigationEnd)
          .subscribe((event: any) => {
            this.isMcginnis = false;
            const url = event.url;
            if (url == '/home') {
              this.title = "My Vidoes"
            } else if (url == '/supported') {
              this.title = "For My Review";
            } else if (url == '/groups') {
              this.title = "My Groups";
            } else if (url == '/mcginnis') {
              this.isMcginnis = true;
            }
          });
  }
  
  isSignedIn(): boolean {
    return this.auth_.isSignedIn();
  }

  signOut() {
    this.auth_.signOut().then(() => this.zone_.run(() => this.router_.navigate(['/login'])));
  }
}
