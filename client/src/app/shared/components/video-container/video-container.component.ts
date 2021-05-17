import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
