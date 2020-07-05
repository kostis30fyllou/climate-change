import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

declare var UIkit;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewChecked {

  mapParentWidth: number = 1000;
  lineParentWidth: number = 960;
  areaParentWidth: number = 940;
  // Map
  year = 1743;
  years = [];
  inputYear = 1743;
  interval = 0.1;
  intervals = [0.1, 0.5, 1, 2, 4];
  timeouts: any[] = [];
  autoPlaying: boolean = false;
  @ViewChild('mapParent') mapParent: ElementRef;
  @ViewChild('lineParent') lineParent: ElementRef;
  @ViewChild('areaParent') areaParent: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    for(let i = 1743; i < 2014; i++) {
      this.years.push(i);
    }
    if(typeof UIkit !== "undefined") {
      UIkit.util.on(document, 'beforeitemshow', '#slider', (): void => {
        if (this.mapParent) {
          this.mapParentWidth = this.mapParent.nativeElement.clientWidth;
        }
        if (this.lineParent) {
          this.lineParentWidth = this.lineParent.nativeElement.clientWidth;
        }
        if(this.areaParent) {
          this.areaParentWidth = this.areaParent.nativeElement.clientWidth;
        }
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  ngAfterViewChecked(): void {
    if(this.mapParent) {
      this.mapParentWidth = this.mapParent.nativeElement.clientWidth;
    }
    if(this.lineParent) {
      this.lineParentWidth = this.lineParent.nativeElement.clientWidth;
    }
    if(this.areaParent) {
      this.areaParentWidth = this.areaParent.nativeElement.clientWidth;
    }
    this.cdr.detectChanges();
  }

  startAutoPlay() {
    if(!this.autoPlaying) {
      this.autoPlaying = true;
      if(this.year === 2013) {
        this.year = 1743;
      }
      this.changeYear(this.year);
    }
  }

  private changeYear(year) {
    if(this.year < 2013 && this.autoPlaying) {
      this.timeouts.push(setTimeout(() => {
        this.year = year;
        this.changeYear(year + 1);
      }, this.interval * 1000));
    } else {
      this.stopAutoPlay();
    }
  }

  stopAutoPlay() {
    this.autoPlaying = false;
    this.clearTimeouts();
  }

  yearChange(event: number) {
    this.year = event;
  }

  private clearTimeouts() {
    this.timeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
  }
}
