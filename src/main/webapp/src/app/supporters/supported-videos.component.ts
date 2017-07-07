import { Component, ChangeDetectorRef } from '@angular/core';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Video } from '../common/video';

@Component({
  selector: 'video-assessment-supported-videos',
  templateUrl: 'supported-videos.component.html',
  styleUrls: ['supported-videos.component.scss'],
})
export class SupportedVideosComponent {
  loading: boolean;
  videos: List<Video> = List<Video>();

  constructor(private changeDetectorRef_: ChangeDetectorRef, private gapi_: GapiService) {  
  }

  ngOnInit() {
    this.loadVideos();
  }

  private loadVideos() {
    this.loading = true;
    this.gapi_.loadMySupportedVideos()
        .then((items) => this.videos = List<Video>(items), () => this.loading = false)
        .then(() => this.loading = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }
}