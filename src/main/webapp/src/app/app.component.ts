import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'video-assessment-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class VideoAssessmentAppComponent {
  constructor(private router_: Router, private auth_: AuthService, private zone_: NgZone) {
  }
  
  isSignedIn(): boolean {
    return this.auth_.isSignedIn();
  }

  signOut() {
    this.auth_.signOut().then(() => this.zone_.run(() => this.router_.navigate(['/login'])));
  }
}
