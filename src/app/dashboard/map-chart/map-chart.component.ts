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
  year = 1743;
  colors: any[] = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf',
                  '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'].reverse();
  domains: number[] = [-40, -32, -24, -16, -8, 0, 8, 16, 24, 32, 40];
  data: any;
  countries: any;
  @Input()
  parentWidth = 1000;
  width = 900;
  height = 600;
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
    d3.json('/assets/dataset/temperatures.json').then(data => {
      this.data = data;
      d3.json('/assets/dataset/countries.json').then(countries => {
        this.countries = countries;
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
      if(this.legend) {
        this.updateLegend();
      }
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
    const tooltip = this.tooltip;
    if (this.svg) {
      this.svg.attr('width', this.width).attr('height', this.height).on('click', function () {
        tooltip.style('display', 'none');
      });
      if (this.g) {
        const projection = d3.geoMercator().translate([this.width / 2, this.height / 2])
          .scale((this.width - 1) / 2 / Math.PI);
        const path = d3.geoPath()
          .projection(projection);
        this.g.selectAll('path').attr('d', path);
      }
    } else {
      this.svg = d3.select(this.hostElement).append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .on('click', () => {
          tooltip.style('display', 'none');
        });
    }
  }

  private setZoom() {
    if(typeof navigator !== "undefined") {
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, -(this.height / 3)], [this.width, 4 / 3 * this.height]])
        .on('zoom', () => {
          this.g.selectAll('path') // To prevent stroke width from scaling
            .attr('transform', d3.event.transform);
        });
      this.svg.call(zoom);
    }
  }

  private setColorScale() {
    this.colorScale = d3.scaleThreshold().domain(this.domains).range(this.colors);
  }

  private addGraphicsElement() {
    this.g = this.svg.attr('class', 'chart').style('background', '#aadaff').append('g');
    this.paths = this.g.selectAll('path')
      .data(t.feature(this.countries, this.countries.objects.countries).features)
      .enter()
      .append('path');
    this.updateData();
  }

  private updateData() {
    const data = this.data;
    const year = this.year;
    const projection = d3.geoMercator().translate([this.width / 2, this.height / 2])
      .scale((this.width - 1) / 2 / Math.PI);
    const path = d3.geoPath()
      .projection(projection);
    const tooltip = this.tooltip;
    this.paths.attr('d', path)
      .style('fill', d => {
        const datum = this.data[d.properties.name];
        if (datum) {
          if (datum[this.year] && datum[this.year].length > 0) {
            return this.colorScale(d3.mean(datum[this.year]));
          }
        }
        return '#808080';
      })
      .style('stroke', 'black')
      .style('stroke-width', '.3px')
      .on('mouseover', function (d) {
        d3.select(this).style('stroke-width', '1px');
      })
      .on('mouseout', () => {
        this.g.selectAll('path').style('stroke-width', '.3px');
      })
      .on('click', function (d) {
        tooltip
          .style('left', d3.mouse(this)[0] + 'px')
          .style('top', d3.mouse(this)[1] + 'px')
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
      .attr('id', 'legend')
      .attr('x', 10)
      .attr('y', this.height - 350)
      .style('rx', '5')
      .attr('width', 200)
      .attr('height', 310)
      .style('fill', '#f1faf5')
      .style('stroke', 'black')
      .style('stroke-width', '.5px')

    this.legend.append('text')
      .attr('id', 'title')
      .attr('x', 35)
      .attr('y', this.height - 320)
      .text('Av. Temperature')
      .style('font-size', '20px')
      .style('font-weight', 'bold');

    const x = 50;
    const y = this.height - 300;
    this.colors.forEach((color, i) => {
      this.legend.append('rect')
        .attr('id', 'color-' + i)
        .attr('x', x)
        .attr('y', y + i * 20)
        .style('rx', 1)
        .attr('width', 20)
        .attr('height', 15)
        .style('fill', color)
        .style('stroke', 'black')
        .style('stroke-width', '1px');

      this.legend.append('text')
        .attr('id', 'text-' + i)
        .attr('x', 145 - this.domains[i].toString().length * 5)
        .attr('y', y + 13 + i * 20)
        .text(this.domains[i]);
    });

    this.legend.append('rect')
      .attr('id', 'color-unknown')
      .attr('x', x)
      .attr('y', y + this.colors.length * 20)
      .style('rx', 1)
      .attr('width', 20)
      .attr('height', 15)
      .style('fill', '#808080')
      .style('stroke', 'black')
      .style('stroke-width', '1px');

    this.legend.append('text')
      .attr('id', 'text-unknown')
      .attr('x', 100)
      .attr('y', y + 13 + this.colors.length * 20)
      .text('Not available');
  }

  private updateLegend() {
    this.legend.select('#legend')
      .attr('y', this.height - 350);

    this.legend.select('#title')
      .attr('y', this.height - 320);

    const y = this.height - 300;
    this.colors.forEach((color, i) => {
      this.legend.select('#color-' + i)
        .attr('y', y + i * 20);

      this.legend.select('#text-' + i)
        .attr('y', y + 13 + i * 20)
    });

    this.legend.select('#color-unknown')
      .attr('y', y + this.colors.length * 20);

    this.legend.select('#text-unknown')
      .attr('y', y + 13 + this.colors.length * 20)
  }
}
