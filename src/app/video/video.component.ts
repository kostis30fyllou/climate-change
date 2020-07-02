import {Component} from '@angular/core';


@Component({
  selector: 'app-video',
  template: `
    <div class="uk-section uk-light">
      <div class="uk-container uk-animation-fade" [class.uk-hidden]="!show">
        <iframe
          src="https://www.youtube.com/embed/k5E2AVpwsko?autoplay=0&amp;showinfo=0&amp;rel=0&amp;modestbranding=1&amp;playsinline=1"
          (load)="onLoad()"
          width="1920" height="1080" frameborder="0" allowfullscreen uk-responsive
          uk-video="automute: true; autoplay: false"></iframe>
      </div>
    </div>`,
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent {
  public show: boolean = false;

  public onLoad() {
    this.show = true;
  }
}
