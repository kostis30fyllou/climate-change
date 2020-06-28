import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {WelcomeComponent} from "./welcome.component";
import {CommonModule} from "@angular/common";
import {FullPageSliderModule} from "../utils/full-page-slider/full-page-slider.module";

const routes: Routes = [
  { path: '', component: WelcomeComponent },
];


@NgModule({
  declarations: [ WelcomeComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FullPageSliderModule
  ],
})
export class WelcomeModule { }
