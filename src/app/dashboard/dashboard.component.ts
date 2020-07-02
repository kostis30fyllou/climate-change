import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewChecked {

  parentWidth: number = 1400;
  year = 1743;
  inputYear = 1743;
  interval = 0.1;
  years = [];
  intervals = [0.1, 0.5, 1, 2, 4];
  timeouts: any[] = [];
  autoPlaying: boolean = false;
  @ViewChild('mapParent') mapParent: ElementRef;

  ngOnInit(): void {
    for(let i = 1743; i < 2014; i++) {
      this.years.push(i);
    }
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  ngAfterViewChecked(): void {
    this.parentWidth = this.mapParent.nativeElement.clientWidth;
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
