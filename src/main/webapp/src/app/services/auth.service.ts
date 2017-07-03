import { Injectable } from '@angular/core';

// Google's login API namespace
declare var gapi: any;

@Injectable()
export class AuthService {
  auth2: any;

  constructor() {
    this.auth2 = gapi.auth2.getAuthInstance();
  }

  isSignedIn(): boolean {
    return this.auth2.isSignedIn.get();
  }

  signIn(): Promise<any> {
    return this.auth2.signIn();
  }

  signOut(): Promise<any> {
    return this.auth2.signOut();
  }

  getUserEmail(): string {
    return this.auth2.currentUser.get().getBasicProfile().getEmail();
  }
}
