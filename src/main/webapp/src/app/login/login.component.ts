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
  url: URL;

  constructor(
    private router_: Router, 
    private auth_: AuthService, 
    private gapi_: GapiService,
    private zone_: NgZone) {
  }

  ngOnInit() {
  }

  signIn() {
    this.auth_.signIn()
        .then(() => this.gapi_.createUser())
        .then(() => {
          const redirect = this.router_.parseUrl(this.router_.url).queryParams["redirect"];
          if (redirect) {
            window.location.href = redirect;
          } else {
            this.zone_.run(() => this.router_.navigate(['/home']));          
          }
        });
  }
}
