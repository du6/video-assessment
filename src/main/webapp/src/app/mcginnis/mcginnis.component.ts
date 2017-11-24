import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MdSnackBar, MdDialog, MdDialogRef } from '@angular/material';
import { List } from 'immutable';

import { Template } from '../common/template';
import { GapiService } from '../services/gapi.service'; 
import { Video } from '../common/video';
import { UpdateSupportersDialog } from '../supporters/update-supporters-dialog.component';

@Component({
  selector: 'app-mcginnis',
  templateUrl: './mcginnis.component.html',
  styleUrls: ['./mcginnis.component.scss']
})
export class McginnisComponent implements OnInit {
  loading: boolean;
  loadingReview: boolean;
  videos: List<Video> = List<Video>();
  reviewVideos: List<Video> = List<Video>();
  uploadTemplate: Template;
  private _dialogRef: MdDialogRef<any>;

  constructor(private changeDetectorRef_: ChangeDetectorRef, 
    private gapi_: GapiService,
    private snackBar_: MdSnackBar,
    private _dialog: MdDialog) {
  }

  ngOnInit() {
    this.loadVideos();
    this.loadReviewVideos();
    this.gapi_.loadTemplates().then(templates => {
      this.uploadTemplate = templates[1];
    });
  }

  private loadVideos() {
    this.loading = true;
    this.gapi_.loadMyVideos()
        .then((items) => this.videos = List<Video>(items), () => this.loading = false)
        .then(() => this.loading = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  onVideoUploaded(video: Video) {
    this.addVideo_(video);
    this._dialogRef = this._dialog.open(UpdateSupportersDialog);
    this._dialogRef.componentInstance.videoKey = video.id;
  }

  onVideoDeleted(videoKey: string) {
    this.deleteVideo_(videoKey);
  }

  private addVideo_(video: Video) {
    this.videos = this.videos.unshift(video);
    //TODO(du6): update view automatically
    this.changeDetectorRef_.detectChanges();
  }

  private deleteVideo_(videoKey: string) {
    const index = this.videos.findIndex((video) => video.id === videoKey);
    if (index >= 0) {
      this.videos = this.videos.delete(index);
      this.changeDetectorRef_.detectChanges();
    }
  }

  private loadReviewVideos() {
    this.loadingReview = true;
    this.gapi_.loadMySupportedVideos()
        .then((items) => this.reviewVideos = List<Video>(items), () => this.loadingReview = false)
        .then(() => this.loadingReview = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }
}
