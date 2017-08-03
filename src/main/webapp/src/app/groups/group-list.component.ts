import {
  Component,
  EventEmitter,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { List } from 'immutable';
import { Router } from '@angular/router';

@Component({
  selector: 'video-assessment-group-list',
  templateUrl: 'group-list.component.html',
  styleUrls: ['group-list.component.scss'],
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
export class GroupListComponent {
  constructor(private _router: Router) {
  }

  deleteGroup(id: String) {
  }

  goToVideoComment(blobkey: string) {
    this._router.navigate(['/video-comment', blobkey]);
  }
}