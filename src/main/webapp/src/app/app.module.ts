import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import { Routes, RouterModule }   from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { WebCamComponent } from 'ack-angular-webcam';

import { VideoAssessmentAppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { UploadComponent } from './upload/upload.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { VideoListComponent } from './video-list/video-list.component';
import { VideoCommentComponent } from './video-comment/video-comment.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { UpdateSupportersDialog } from './supporters/update-supporters-dialog.component';
import { CreateGroupDialog } from './groups/create-group-dialog.component';
import { ConfirmationDialog } from './confirmation/confirmation-dialog.component';
import { SupportedVideosComponent } from './supporters/supported-videos.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupListComponent } from './groups/group-list.component';
import { GroupItemComponent } from './groups/group-item.component';
import { GroupDetailComponent } from './groups/group-detail.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { ProfileComponent } from './profile/profile.component';
import { PerformanceComponent } from './performance/performance.component';
import { DemoComponent } from './demo/demo.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { GapiService } from './services/gapi.service';
import { UploadService } from './services/upload.service';
import { ReportComponent } from
'./report/report.component'

const routes: Routes = [
  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
  { path: 'groups', component: GroupsComponent, canActivate: [AuthGuard] },
  { path: 'supported', component: SupportedVideosComponent, canActivate: [AuthGuard] },
  { path: 'group/:groupId', component: GroupDetailComponent, canActivate: [AuthGuard] },
  { path: 'video-comment/:blobkey', component: VideoCommentComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'demo', component: DemoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'performance', component: PerformanceComponent },
  { path: '', component: LoginComponent },
  { path: 'report', component: ReportComponent}
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
    WebCamComponent,
    VideoAssessmentAppComponent, 
    LoginComponent,
    HomeComponent,
    UploadComponent,
    VideoDetailComponent,
    VideoListComponent,
    VideoCommentComponent,
    SidenavComponent, 
    UpdateSupportersDialog,
    CreateGroupDialog,
    ConfirmationDialog,
    SupportedVideosComponent,
    GroupsComponent,
    GroupListComponent,
    GroupItemComponent,
    GroupDetailComponent,
    FeedbackComponent,
    ProfileComponent,
    PerformanceComponent,
    DemoComponent,
    ReportComponent
  ],
  entryComponents: [UpdateSupportersDialog, CreateGroupDialog, ConfirmationDialog],
  bootstrap: [VideoAssessmentAppComponent],
})
export class VideoAssessmentAppModule { }
