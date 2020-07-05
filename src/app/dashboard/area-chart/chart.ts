import * as d3 from 'd3';

export class Chart {
  chartData: any[];
  width;
  height;
  maxDataPoint;
  svg;
  id;
  name;
  margin;
  showBottomAxis;
  xScale;
  yScale;
  area;
  chartContainer;
  xAxisTop: any;
  xAxisBottom: any;
  yAxis: any;

  constructor(options) {
    this.chartData = options.data;
    this.width = options.width;
    this.height = options.height;
    this.maxDataPoint = options.maxDataPoint;
    this.svg = options.svg;
    this.id = options.id;
    this.name = options.name;
    this.margin = options.margin;
    this.showBottomAxis = options.showBottomAxis;
    /// XScale is time based
    this.xScale = d3.scaleTime()
      .range([0, this.width]) // minimum and maximum PIXELS mapped to domain values
      .domain(d3.extent(this.chartData.map(d => d.year))); // minimum and maximum input VALUES

    /// YScale is linear based on the maxDataPoint we found earlier
    this.yScale = d3.scaleLinear()
      .range([this.height,0])
      //.domain([0,this.maxDataPoint]);
      .domain([-2700, 350]);

    /// This is what creates the chart. There are a number of interpolation options.
    /// 'basis' smooths it the most, however, when working with a lot of data, this will slow it down
    this.area = d3.area()
      .curve(d3.curveBasis)
      .x((d: any) =>  this.xScale(d.year))
      .y1((d: any) => {
        // the highest point
        if (d[1] <= 0) {
          return this.yScale(0);
        } else {
          return this.yScale(d[this.name]);
        }
      })
      .y0((d: any) => {
        // the lowest point
        if (d[1] <= 0) {
          return this.yScale(d[this.name]);
        } else {
          return this.yScale(0);
        }
      });

    /// This isn't required - it simply creates a mask. If this wasn't here,
    /// when we zoom/panned, we'd see the chart go off to the left under the y-axis
    this.svg.append("defs").append("clipPath")
      .attr("id", "clip-" + this.id)
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);

    /// Assign it a class so we can assign a fill color and position it on the page
    this.chartContainer = this.svg.append("g")
      .attr('class',this.name.toLowerCase())
      .attr("transform", "translate(" + this.margin.left + "," +
        (this.margin.top + (this.height * this.id) + (10 * this.id)) + ")");

    /// We've created everything, let's actually add it to the page
    this.chartContainer.append("path")
      .data([this.chartData])
      .attr("class", "chart")
      .attr("clip-path", "url(#clip-" + this.id + ")")
      .attr("d", this.area);

    this.xAxisTop = d3.axisBottom(this.xScale);
    this.xAxisBottom = d3.axisTop(this.xScale);

    /// We only want a top axis if it's the first country
    if(this.id == 0){
      this.chartContainer.append("g")
        .attr("class", "x axis top")
        .attr("transform", "translate(0,0)")
        .call(this.xAxisTop);
    }

    /// Only want a bottom axis on the last country
    if(this.showBottomAxis){
      this.chartContainer.append("g")
        .attr("class", "x axis bottom")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxisBottom);
    }

    this.yAxis = d3.axisLeft(this.yScale).ticks(5);

    this.chartContainer.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(-15,0)")
      .call(this.yAxis);

    this.chartContainer.append("text")
      .attr("class","country-title")
      .attr("transform", "translate(15,40)")
      .text(this.name);
  }

  public showOnly(b) {
    this.xScale.domain(b);
    this.chartContainer.select("path").data([this.chartData]).attr("d", this.area);
    this.chartContainer.select(".x.axis.top").call(this.xAxisTop);
    this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
  }
}
