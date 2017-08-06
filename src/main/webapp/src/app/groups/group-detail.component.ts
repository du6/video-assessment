import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectorRef,  
  ViewEncapsulation,
  ChangeDetectionStrategy, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { List } from 'immutable';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

import { GapiService } from '../services/gapi.service';
import { Group } from '../common/group';
import { Topic } from '../common/topic';

@Component({
  selector: 'video-assessment-group-detail',
  templateUrl: 'group-detail.component.html',
  styleUrls: ['group-detail.component.scss'],
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
export class GroupDetailComponent implements OnInit, OnDestroy {
  sub: any;
  isValidGroup: boolean = true;
  loadGroupError: string;
  isOwner: boolean = false;
  group: Group;
  groupId: number;
  members: List<string> = List<string>();
  topics: List<Topic> = List<Topic>();
  loadingMembers: boolean = false;
  loadingTopics: boolean = false;

  constructor(
      private _route: ActivatedRoute, 
      private gapi_: GapiService, 
      private changeDetectorRef_: ChangeDetectorRef,) {}

  ngOnInit() {
    this.sub = this._route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.gapi_.loadGroup(this.groupId).then((group: Group) => {
        this.group = group;
        this.loadTopics(this.groupId);
        this.gapi_.checkGroupOwnership(this.groupId).then((isOwner: boolean) => {
          this.isOwner = isOwner;
          if (isOwner) {
            this.loadMembers(this.groupId);
          }
        });
      }).catch((error) => {
        this.isValidGroup = false;
        this.loadGroupError = error;
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goToTopic(id: number) {

  }
  
  private loadTopics(groupId: number) {
    this.loadingTopics = true;
    this.gapi_.loadTopics(groupId)
        .then((topics: Topic[]) => {
          this.topics = List<Topic>(topics);
        }, () => this.loadingTopics = false)
        .then(() => this.loadingTopics = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }

  private loadMembers(groupId: number) {
    this.loadingMembers = true;
    this.gapi_.loadMembers(groupId)
        .then((members: string[]) => {
          this.members = List<string>(members);
        }, () => this.loadingMembers = false)
        .then(() => this.loadingMembers = false)
        .then(() => this.changeDetectorRef_.detectChanges());
  }
}
