import {AfterContentInit, Component, ContentChildren, Input, OnInit, QueryList} from "@angular/core";
import {SlideComponent} from "./slide.component";

@Component({
  selector: 'fp-slider',
  template: `
    <div class="menu">
      <a *ngIf="state > 1" class="previous" (click)="onClick(state - 1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="17.155" height="17.155" viewBox="0 0 17.155 17.155">
          <g id="Group_3053" data-name="Group 3053" transform="translate(0)">
            <path id="arrow-down-left2"
                  d="M10.405,11.834,2.022,3.451V7.076A1.011,1.011,0,0,1,0,7.076V1.011A1.009,1.009,0,0,1,1.011,0H7.076a1.011,1.011,0,1,1,0,2.022H3.451l8.383,8.383a1.011,1.011,0,1,1-1.429,1.429h0Z"
                  transform="translate(8.578 0) rotate(45)" fill="#00783e"/>
          </g>
        </svg>
      </a>
      <nav>
        <ul>
          <li *ngFor="let slide of slides.toArray();let i=index" [class.uk-active]="i === (state - 1)">
            <a (click)="onClick(i + 1)"></a>
          </li>
        </ul>
      </nav>
      <a *ngIf="state < slides.length" class="next" (click)="onClick(state + 1)">
        <svg xmlns="http://www.w3.org/2000/svg" width="17.155" height="17.155" viewBox="0 0 17.155 17.155">
          <g id="Group_2442" data-name="Group 2442" transform="translate(-1221 -675)">
            <path id="arrow-down-left2"
                  d="M14.405,4.3,6.022,12.68V9.055A1.011,1.011,0,0,0,4,9.055V15.12a1.009,1.009,0,0,0,1.011,1.01h6.065a1.011,1.011,0,1,0,0-2.022H7.451l8.383-8.383A1.011,1.011,0,0,0,14.405,4.3h0Z"
                  transform="translate(1215.343 683.578) rotate(-45)" fill="#00783e"/>
          </g>
        </svg>
      </a>
    </div>
    <section (wheel)="onWheel($event)" class="uk-animation-slide-bottom">
      <ng-content></ng-content>
    </section>`,
  styleUrls: ['full-page-slider.component.scss']
})
export class FullPageSliderComponent implements AfterContentInit {

  @ContentChildren(SlideComponent) slides: QueryList<SlideComponent>;
  @Input()
  public initSlide = 1;
  public animate: boolean = false;
  public state = 0;

  ngAfterContentInit() {
    this.state = this.initSlide;
    this.setSlides(this.state);
  }

  setSlides(state = 1) {
    this.slides.forEach((slide, index) => {
      slide.state = state;
      slide.y = -50 + (index + 1) * 200 - state * 200;
    });
  }

  onWheel(event) {
    if (!this.animate) {
      this.animate = true;
      if (event.deltaY > 0 && (this.state < this.slides.length)) {
        this.state++;
        this.setSlides(this.state);
        setTimeout(() => {
          this.animate = false;
        }, 500);
      } else if (event.deltaY < 0 && (this.state !== 1)) {
        this.state--;
        this.setSlides(this.state);
        setTimeout(() => {
          this.animate = false;
        }, 500);
      } else {
        this.animate = false;
      }
    }
  }

  public onClick(index: number) {
    if (!this.animate) {
      this.animate = true;
      this.state = index;
      this.setSlides(this.state);
      setTimeout(() => {
        this.animate = false;
      }, 500);
    }
  }
}
