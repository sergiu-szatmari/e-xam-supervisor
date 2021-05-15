import { Directive, HostBinding, Input, OnChanges } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[imgPreloader]'
})
export class ImagePreloaderDirective implements OnChanges {
  @HostBinding('attr.src') finalImage;

  @Input('imgPreloader') targetSource: string;
  @Input() defaultImage = 'assets/images/preloader.gif';
  noImage = 'assets/images/error.png';

  downloadingImage: any;

  ngOnChanges() {
    if (!this.targetSource) {
      this.finalImage = this.noImage;
      return;
    }

    this.finalImage = this.defaultImage;
    this.downloadingImage = new Image();
    this.downloadingImage.onload = () => {
      this.finalImage = this.targetSource;
    };
    this.downloadingImage.onerror = () => {
      this.finalImage = this.noImage;
    };
    this.downloadingImage.src = this.targetSource;
  }
}
