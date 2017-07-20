import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private _router: Router, private _auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.isSignedIn()) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this._router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }

    isSignedIn(): boolean {
      return this._auth.isSignedIn();
    }
}