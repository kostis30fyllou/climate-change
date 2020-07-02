import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as d3 from 'd3';
import * as t from 'topojson';

@Component({
  selector: 'app-map-chart',
  template: `
    <svg></svg>`,
})
export class MapChartComponent implements OnInit, OnChanges, AfterViewInit {

  @Input()
  year: number = 1743;
  colors: any[] = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'].reverse();
  domains: number[] = [-40, -32, -24, -16, -8, 0, 8, 16, 24, 32, 40];
  data: any;
  countries: any;
  @Input()
  parentWidth = 1000;
  width: number = 900;
  height: number = 600;
  hostElement;
  svg;
  g;
  paths;
  colorScale;
  legend;
  tooltip;

  constructor(private elementRef: ElementRef) {
    this.hostElement = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.width = this.parentWidth;
    this.height = this.parentWidth * 0.6;
    d3.json("/assets/temperatures.json").then(data => {
      this.data = data;
      d3.json("/assets/countries.json").then(countries => {
        this.countries = countries;
        /*console.log(this.countries.objects.countries.geometries.filter(object => !this.data[object.properties.name]).map(object => object.properties.name).sort((one, two) => (one > two ? 1 : -1)));
        let temp = this.countries.objects.countries.geometries.map(object => object.properties.name);
        console.log(Object.entries(this.data).filter(([key, value]) => !temp.includes(key)));*/
        this.createMap();
      });
    });
  }

  ngAfterViewInit(): void {
    this.setZoom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.parentWidth) {
      this.width = this.parentWidth;
      this.height = this.parentWidth * 0.6;
      this.setChartDimensions();
      this.setZoom();
    } else if (changes.year) {
      this.updateData();
    }
  }

  private createMap() {
    this.removeExistingChartFromParent();
    this.createTooltip();
    this.setChartDimensions();
    this.setColorScale();
    this.addGraphicsElement();
    this.addLegend();
  }

  private removeExistingChartFromParent() {
    d3.select(this.hostElement).select('svg').remove();
    d3.select(this.hostElement).select('div').remove();
  }

  private createTooltip() {
    this.tooltip = d3.select(this.hostElement).append('div').attr('class', 'uk-tooltip');
  }

  private setChartDimensions() {
    let tooltip = this.tooltip;
    if (this.svg) {
      this.svg.attr('width', this.width).attr('height', this.height).on('click', function () {
        tooltip.style('display', 'none');
      });
      if (this.g) {
        let projection = d3.geoMercator().translate([this.width / 2, this.height / 2])
          .scale((this.width - 1) / 2 / Math.PI);
        let path = d3.geoPath()
          .projection(projection);
        this.g.selectAll('path').attr('d', path);
      }
    } else {
      this.svg = d3.select(this.hostElement).append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .on('click', function () {
          tooltip.style('display', 'none');
        });
    }
  }

  private setZoom() {
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[0, -(this.height / 3)], [this.width, 4 / 3 * this.height]])
      .on('zoom', () => {
        this.g.selectAll('path') // To prevent stroke width from scaling
          .attr('transform', d3.event.transform);
      });
    this.svg.call(zoom);
  }

  private setColorScale() {
    this.colorScale = d3.scaleThreshold().domain(this.domains).range(this.colors);
  }

  private addGraphicsElement() {
    this.g = this.svg.attr('class', 'map').append("g");
    this.paths = this.g.selectAll('path')
      .data(t.feature(this.countries, this.countries.objects.countries).features)
      .enter()
      .append('path');
    this.updateData();
  }

  private updateData() {
    let data = this.data;
    let year = this.year;
    let projection = d3.geoMercator().translate([this.width / 2, this.height / 2])
      .scale((this.width - 1) / 2 / Math.PI);
    let path = d3.geoPath()
      .projection(projection);
    let tooltip = this.tooltip;
    this.paths.attr('d', path)
      .style('fill', d => {
        let data = this.data[d.properties.name];
        if (data) {
          if (data[this.year] && data[this.year].length > 0) {
            return this.colorScale(d3.mean(data[this.year]));
          }
        }
        return '#808080';
      })
      .style('stroke', 'black')
      .style('stroke-width', '.3px')
      .on('mouseover', function (d) {
        d3.select(this).style('stroke-width', '2px');
      })
      .on('mouseout', function (d) {
        d3.selectAll('path').style('stroke-width', '.3px');
      })
      .on('click', function (d) {
        tooltip
          .style('left', d3.mouse(this)[0] + 'px')
          .style('top', d3.mouse(this)[1] + 'px')
          .style('background', '#f1faf5')
          .style('color', '#114d66')
          .style('display', 'inline-block')
          .html(() => {
            if (data[d.properties.name] && data[d.properties.name][year] && data[d.properties.name][year].length > 0) {
              return `<h5 class="uk-text-center">${d.properties.name}</h5>
             <span class="uk-margin-small-right">Av. Temperature: ${d3.mean(data[d.properties.name][year]).toPrecision(4)}</span>
             <span>Year: ${year}</span>
            `;
            } else return `<h5 class="uk-text-center">${d.properties.name}</h5>
             <span class="uk-margin-small-right">Av. Temperature: Not available</span>
             <span>Year: ${year}</span>
            `;
          });
        d3.event.stopPropagation();
      });
  }

  private addLegend() {
    this.legend = this.svg.append('g');

    this.legend.append('rect')
      .attr('x', 10)
      .attr('y', 300)
      .style('rx', '5')
      .attr('width', 200)
      .attr('height', 280)
      .style('fill', '#f1faf5')
      .style('stroke', 'black')
      .style('stroke-width', '.3px')

    this.legend.append('text')
      .attr('x', 25)
      .attr('y', 330)
      .style('fill', '#006064')
      .text('Av. Temperature')
      .style('font-size', '20px')
      .style('font-weight', 'bold');

    this.colors.forEach((color, i) => {
      let x = 50;
      let y = 350;
      this.legend.append('rect')
        .attr('x', x)
        .attr('y', y + i*20)
        .style('rx', 1)
        .attr('width', 20)
        .attr('height', 15)
        .style('fill', color)
        .style('stroke', 'black')
        .style('stroke-width', '.3px')
        .style('opacity', '0.5');

      this.legend.append('text')
        .attr('x', 120 - this.domains[i].toString().length*5)
        .attr('y', y + 13 + i*20)
        .text(this.domains[i])
        .style('fill', '#006064')
        .style('font-size', '14px');
    });
  }
}