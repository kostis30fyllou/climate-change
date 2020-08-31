import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {Chart} from "./chart";

@Component({
  selector: 'app-area-chart',
  template: `
    <svg></svg>`,
})
export class AreaChartComponent implements OnInit, OnChanges {

  data: any[] = [];
  continents: any[] = [];
  charts: Chart[];
  maxDataPoint = 0;

  hostElement;
  svg;
  g;
  context;

  @Input()
  parentWidth = 940;
  margin = {top: 10, right: 40, bottom: 175, left: 60};
  width = this.parentWidth;
  height = this.parentWidth * 500 / 940;
  innerWidth = this.width - this.margin.left - this.margin.right;
  innerHeight = this.height - this.margin.top - this.margin.bottom;
  contextHeight = 50;
  contextWidth = 0.5 * this.innerWidth;

  constructor(private elementRef: ElementRef) {
    this.hostElement = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    if(typeof fetch !== 'undefined') {
      d3.csv('assets/dataset/ice.csv').then(data => {
        this.data = data;
        /// Loop through first row and get each country and push it into an array to use later
        for (let prop in data[0]) {
          if (data[0].hasOwnProperty(prop)) {
            if (prop != 'year') {
              this.continents.push(prop);
            }
          }
        }
        data.forEach((d: any) => {
          for (let prop in d) {
            if (d.hasOwnProperty(prop)) {
              d[prop] = parseFloat(d[prop]);
              if (d[prop] > this.maxDataPoint) {
                this.maxDataPoint = d[prop];
              }
            }
          }
          /// D3 needs a date object, let's convert it just one time
          d.year = new Date(d.year, 0, 1);
        });
        if (this.parentWidth > 0) {
          this.createChart();
        }
      })
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.data) {
      if (changes.parentWidth) {
        if (this.parentWidth > 0) {
          this.createChart();
        }
      }
    }
  }

  private removeExistingChartFromParent() {
    d3.select(this.hostElement).select('svg').remove();
  }

  private setSize() {
    this.width = this.parentWidth;
    this.height = this.parentWidth * 500 / 940;
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;
    this.contextHeight = 50;
    this.contextWidth = 0.5 * this.innerWidth;
  }

  private addGraphicsElement() {
    this.svg = d3.select(this.hostElement).append("svg")
      .attr('class', 'chart small')
      .attr("width", this.width)
      .attr("height", this.height);
    this.charts = [];
    for (let i = 0; i < this.continents.length; i++) {
      this.charts.push(new Chart({
        data: this.data,
        id: i,
        name: this.continents[i],
        width: this.innerWidth,
        height: this.innerHeight * (1 / this.continents.length),
        maxDataPoint: this.maxDataPoint,
        svg: this.svg,
        margin: this.margin,
        showBottomAxis: (i == this.continents.length - 1)
      }));
    }
  }

  private createBrush() {
    let contextXScale = d3.scaleTime().range([0, this.contextWidth]).domain(this.charts[0].xScale.domain());
    let axis = d3.axisBottom(contextXScale).tickSize(this.contextHeight).tickPadding(-10);
    let brush = d3.brushX().extent([[0, 0], [this.contextWidth, this.contextHeight]]).on("brush end", () => {
      let s = d3.event.selection;
      let b = (s)?s.map(contextXScale.invert):contextXScale.domain();
      for (let i = 0; i < this.continents.length; i++) {
        this.charts[i].showOnly(b);
      }
    });
    this.context = this.svg.append("g").attr("class", "context")
      .attr("transform", "translate(" + (this.margin.left + this.innerWidth * .25) + ","
        + (this.innerHeight + this.margin.top + this.contextHeight + 50) + ")");
    this.context.append("g")
      .attr("class", "x axis top")
      .attr("transform", "translate(8,0)")
      .call(axis);
    this.context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", 0)
      .attr("height", this.contextHeight);
    this.context.append("text")
      .attr("class","instructions")
      .attr("x", this.contextWidth / 2)
      .attr("text-anchor", "middle")
      .text('Click and drag below to zoom / pan the data');
  }

  private createChart() {
    this.removeExistingChartFromParent();
    this.setSize();
    this.addGraphicsElement();
    this.createBrush();
  }
}
