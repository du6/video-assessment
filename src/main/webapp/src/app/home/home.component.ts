import { Component, ChangeDetectorRef } from '@angular/core';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Video } from '../common/video';

@Component({
  selector: 'video-assessment-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss'],
})
export class HomeComponent {
  loading: boolean;
  videos: List<Video> = List<Video>();

  constructor(private changeDetectorRef_: ChangeDetectorRef, private gapi_: GapiService) {
  }

  ngOnInit() {
    this.loadVideos();
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
  }

  private addVideo_(video: Video) {
    this.videos = this.videos.unshift(video);
    //TODO(du6): update view automatically
    this.changeDetectorRef_.detectChanges();
  }
}
