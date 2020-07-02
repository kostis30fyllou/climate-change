import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {VideoComponent} from "./video.component";
import {CommonModule} from "@angular/common";

const routes: Routes = [
  { path: '', component: VideoComponent },
];


@NgModule({
  declarations: [ VideoComponent ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
})
export class VideoModule { }
