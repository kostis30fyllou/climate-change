import {Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-line-chart',
  template: `
    <svg></svg>`,
})
export class LineChartComponent implements OnInit, OnChanges {
  data: any[];
  margin = {top: 60, right: 40, bottom: 90, left: 90};
  @Input()
  parentWidth = 960;
  width: number = this.parentWidth;
  height: number = this.parentWidth * 500 / 960;
  innerWidth;
  innerHeight;
  contextHeight = 50;
  contextWidth = 0.8 * this.innerWidth;

  hostElement;
  svg;
  g;
  line;
  context;

  xAxisLabel = 'Year';
  xAxis;
  xAxisG;
  xScale;
  xValue = d => d.year;

  yAxisLabel = "GMSL";
  yAxis;
  yAxisG;
  yScale;
  yValue = d => d.mean_gmsl;

  constructor(private elementRef: ElementRef) {
    this.hostElement = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    d3.json("/assets/dataset/gmsl.json").then(data => {
      this.data = data;
      if (this.parentWidth > 0) {
        this.createChart();
      }
    });
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


  private createChart() {
    this.removeExistingChartFromParent();
    this.setChartDimensions();
    this.addAxes();
    this.addGraphicsElement();
    this.createBrush();
  }

  private removeExistingChartFromParent() {
    d3.select(this.hostElement).select('svg').remove();
  }


  private setChartDimensions() {
    this.width = this.parentWidth;
    this.height = this.parentWidth * 0.52;
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;
    this.contextHeight = 50;
    this.contextWidth = 0.8 * this.innerWidth;
    this.svg = d3.select(this.hostElement).append('svg').attr('width', this.width).attr('height', this.height)
  }


  private addAxes() {
    this.xScale = d3.scaleLinear().domain(d3.extent(this.data, this.xValue)).range([this.margin.left, this.width - this.margin.right]).nice();
    this.yScale = d3.scaleLinear().domain(d3.extent(this.data, this.yValue)).range([this.height - this.margin.bottom, this.margin.top]).nice();
    this.xAxis = d3.axisBottom(this.xScale).tickSize(-this.innerHeight).tickPadding(15).tickFormat(d => d.toString());
    this.yAxis = d3.axisLeft(this.yScale).tickSize(-this.innerWidth).tickPadding(10);
  }

  private addGraphicsElement() {
    this.g = this.svg.attr('class', 'chart small').append("g");

    this.yAxisG = this.g.append("g").call(this.yAxis).attr("transform", `translate(${this.margin.left},${- this.contextHeight})`);
    this.yAxisG.selectAll('.domain').remove();

    this.yAxisG.append("text")
      .attr("y", 70)
      .attr("x", this.innerHeight / 2 + this.margin.top)
      .attr("transform", "rotate(90)")
      .attr("text-anchor", "middle")
      .attr('class', 'uk-text-bold')
      .text(this.yAxisLabel);

    this.xAxisG = this.g.append("g").call(this.xAxis).attr("transform", `translate(0,${this.height - this.margin.bottom - this.contextHeight})`);

    this.xAxisG.select('.domain').remove();

    this.xAxisG.append("text")
      .attr("y", 40)
      .attr("x", this.innerWidth / 2 + this.margin.left)
      .attr('class', 'uk-text-bold')
      .text(this.xAxisLabel);

    this.svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.innerWidth)
      .attr("height", this.innerHeight)
      .attr('x', this.margin.left)
      .attr('y', this.margin.top);

    this.line = d3.line()
      .x(d => this.xScale(this.xValue(d)))
      .y(d => this.yScale(this.yValue(d)))
      .curve(d3.curveBundle);

    this.g.append("path").attr("class", "line-path").data([this.data]).attr("d", this.line)
                         .attr("clip-path", "url(#clip)")
                         .attr("transform", `translate(0,${- this.contextHeight})`);
  }

  private createBrush() {
    let contextXScale = d3.scaleLinear().range([0, this.contextWidth]).domain(this.xScale.domain());
    let axis = d3.axisBottom(contextXScale).tickSize(this.contextHeight).tickPadding(-10).tickFormat(d => d.toString());
    let brush = d3.brushX().extent([[0, 0], [this.contextWidth, this.contextHeight]]).on("brush end", () => {
      let s = d3.event.selection;
      let b = (s)?s.map(contextXScale.invert):contextXScale.domain();
      this.showOnly(b);
    });
    this.context = this.svg.append("g").attr("class", "context")
      .attr("transform", "translate(" + (this.margin.left + this.innerWidth * .1) + ","
        + (this.innerHeight + this.margin.top + 20) + ")");
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
      .text('Click and drag above to zoom / pan the data');
  }

  private showOnly(b) {
    this.xScale.domain(b);
    this.g.select("path").data([this.data]).attr("d", this.line);
    this.xAxisG.call(this.xAxis);
    this.xAxisG.select('.domain').remove();
  }
}
