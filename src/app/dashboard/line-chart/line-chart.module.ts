import {NgModule} from '@angular/core';
import {LineChartComponent} from "./line-chart.component";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [LineChartComponent],
  imports: [
    CommonModule
  ],
  exports: [
    LineChartComponent
  ]
})
export class LineChartModule { }
