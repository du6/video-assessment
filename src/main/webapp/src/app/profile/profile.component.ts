import { Component, ChangeDetectorRef } from '@angular/core';
import { MdSnackBar } from '@angular/material';

import { GapiService } from '../services/gapi.service';
import { Profile } from '../common/profile';

@Component({
  selector: 'video-assessment-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss'],
})
export class ProfileComponent {
  loadingProfile: boolean = true;
  email: string;
  name: string;

  constructor(private gapi_: GapiService, 
    private changeDetectorRef_: ChangeDetectorRef,
    private snackBar_: MdSnackBar,) {
  }

  ngOnInit() {
    this.gapi_.getProfile().then(profile => {
      this.email = profile.email;
      this.name = profile.name;
    }, () => this.loadingProfile = false)
    .then(() => this.loadingProfile = false)
    .then(() => this.changeDetectorRef_.detectChanges());
  }

  setName(name: string) {
    this.gapi_.setName(name).then(profile => {
      this.name = profile.name;
      this.snackBar_.open('Profile name updated!', 'Dismiss', {duration: 2000})
    });
  }
}
