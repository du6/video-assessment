import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'video-assessment-sidenav',
  templateUrl: 'sidenav.component.html',
  styleUrls: ['sidenav.component.scss'],
})
export class SidenavComponent {
  constructor(private _router: Router) {
  }

  gotoHome() {
    this._router.navigate(['/home']);
  }

  gotoSupported() {
    this._router.navigate(['/supported']);
  }

  gotoGroups() {
    this._router.navigate(['/groups']);
  }

  gotoFeedback() {
    this._router.navigate(['/feedback']);
  }

  gotoProfile() {
    this._router.navigate(['/profile']);
  }
}