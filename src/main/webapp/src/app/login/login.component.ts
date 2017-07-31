import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { GapiService } from '../services/gapi.service';

@Component({
  selector: 'video-assessment-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent {
  constructor(
    private router_: Router, 
    private auth_: AuthService, 
    private gapi_: GapiService,
    private zone_: NgZone) {
  }

  signIn() {
    this.auth_.signIn()
        .then(() => this.gapi_.createUser())
        .then(() => this.zone_.run(() => this.router_.navigate(['/home'])));
  }
}
