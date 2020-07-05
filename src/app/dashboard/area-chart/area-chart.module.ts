import {NgModule} from '@angular/core';
import {AreaChartComponent} from "./area-chart.component";
import {CommonModule} from "@angular/common";


@NgModule({
  declarations: [AreaChartComponent],
  imports: [
    CommonModule
  ],
  exports: [
    AreaChartComponent
  ]
})
export class AreaChartModule { }
