import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import { Routes, RouterModule }   from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CookieService } from 'angular2-cookie/services/cookies.service';

import { VideoAssessmentAppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UploadComponent } from './upload/upload.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { VideoListComponent } from './video-list/video-list.component';
import { VideoCommentComponent } from './video-comment/video-comment.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { UpdateSupportersDialog } from './supporters/update-supporters-dialog.component';
import { SupportedVideosComponent } from './supporters/supported-videos.component';
import { GroupListComponent } from './groups/group-list.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { GapiService } from './services/gapi.service';
import { UploadService } from './services/upload.service';

const routes: Routes = [
  { path: 'groups', component: GroupListComponent, canActivate: [AuthGuard] },
  { path: 'supported', component: SupportedVideosComponent, canActivate: [AuthGuard] },
  { path: 'video-comment/:blobkey', component: VideoCommentComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule.forRoot(routes, { useHash: true }),
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
  ],
  providers: [AuthService, AuthGuard, GapiService, UploadService, CookieService],
  declarations: [
    VideoAssessmentAppComponent, 
    LoginComponent,
    HomeComponent,
    UploadComponent,
    VideoDetailComponent,
    VideoListComponent,
    VideoCommentComponent,
    SidenavComponent, 
    UpdateSupportersDialog,
    SupportedVideosComponent,
    GroupListComponent,
  ],
  entryComponents: [UpdateSupportersDialog],
  bootstrap: [VideoAssessmentAppComponent],
})
export class VideoAssessmentAppModule { }
