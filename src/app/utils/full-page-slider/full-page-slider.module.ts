import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FullPageSliderComponent} from "./full-page-slider.component";
import {SlideComponent} from "./slide.component";

@NgModule({
  imports: [CommonModule],
  declarations: [FullPageSliderComponent, SlideComponent],
  exports: [FullPageSliderComponent, SlideComponent],
})
export class FullPageSliderModule {

}
