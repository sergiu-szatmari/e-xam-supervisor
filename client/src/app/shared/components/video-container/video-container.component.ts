import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-video-container',
  templateUrl: './video-container.component.html',
  styleUrls: ['./video-container.component.scss']
})
export class VideoContainerComponent implements OnInit {

  @Input()
  stream: MediaStream;

  @Input()
  displayLabel = true;

  @Input()
  label = '';

  @Output()
  videoClicked = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

}
