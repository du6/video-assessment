import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { GapiService } from '../services/gapi.service';

@Component({
  selector: 'video-assessment-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent {
  showPolicy: boolean = false;

  constructor(
    private router_: Router, 
    private auth_: AuthService, 
    private gapi_: GapiService,
    private changeDetectorRef_: ChangeDetectorRef) {
  }

  signIn() {
    this.auth_.signIn().then(() => {
      this.gapi_.getUserEmail()
          .then(() => this.router_.navigate(['/home',]))
          .catch(() => {
            //TODO(du6): display policy when we have it.
            //this.showPolicy = true;
            //this.changeDetectorRef_.detectChanges();
            this.createUser();
          });
    });
  }

  createUser() {
    this.gapi_.createUser().then(() => this.router_.navigate(['/home']));
  }
}
