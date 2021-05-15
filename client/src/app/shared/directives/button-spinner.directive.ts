import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[buttonSpinner]',
})
export class ButtonSpinnerDirective {
  hostNativeElement;

  constructor(private renderer: Renderer2, hostElement: ElementRef) {
    this.hostNativeElement = hostElement.nativeElement;
  }

  @Input() set buttonSpinner(display: boolean) {
    const fn = display === true ?
      this.renderer.addClass :
      this.renderer.removeClass;

    fn(this.hostNativeElement, 'is-button-loading');
  }
}
