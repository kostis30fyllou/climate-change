import {NgModule} from '@angular/core';
import {MapChartComponent} from "./map-chart.component";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [MapChartComponent],
  imports: [
    CommonModule
  ],
  exports: [
    MapChartComponent
  ]
})
export class MapChartModule { }
