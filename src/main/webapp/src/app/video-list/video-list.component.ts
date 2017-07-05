import {
  Input,
  Output,
  Component,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/core';
import { List } from 'immutable';
import { Router } from '@angular/router';

import { Video } from '../common/video';

@Component({
  selector: 'video-assessment-video-list',
  templateUrl: 'video-list.component.html',
  styleUrls: ['video-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      state('in', style({
        height: '100%',
        opacity: 1,
      })),
      transition('void => *', [
        style({
          height: 0,
          opacity: 0
        }),
        animate(250, style({
          height: '100%',
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          height: '100%',
          opacity: 1
        }),
        animate(250, style({
          height: 0,
          opacity: 0
        }))
      ])
    ])
  ]
})
export class VideoListComponent {
  @Input() videos: List<Video>;
  @Output() videoDeleted: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _router: Router) {
  }

  deleteVideo(video: Video) {
    this.videoDeleted.emit(video.id);
  }

  goToVideoComment(blobkey: string) {
    this._router.navigate(['/video-comment', blobkey]);
  }
}