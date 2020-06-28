import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';

import {environment} from '../environments/environment';


@Component({
  selector: 'app-root',
  template: `
    <div uk-sticky="sel-target: .uk-navbar-container; cls-active: uk-navbar-sticky; bottom: #transparent-sticky-navbar">
      <nav class="uk-navbar-container uk-position-relative uk-text-bold" uk-navbar style="z-index: 980;">
        <div class="uk-navbar-left uk-margin-left">
          <a class="uk-navbar-item uk-logo" routerLink="/">
            <img width="50" src="/assets/logo.png">
          </a>
        </div>
        <div class="uk-navbar-right uk-margin-large-right">
          <ul class="uk-navbar-nav">
            <li routerLinkActive="uk-active" [routerLinkActiveOptions]="{exact: true}"><a routerLink="/">Home</a></li>
            <li routerLinkActive="uk-active" [routerLinkActiveOptions]="{exact: true}"><a routerLink="/test">test</a></li>
            <li routerLinkActive="uk-active" [routerLinkActiveOptions]="{exact: true}"><a routerLink="/test2">test2</a></li>
          </ul>
        </div>
      </nav>
    </div>
    <main>
      <router-outlet></router-outlet>
    </main>`,
})
export class AppComponent implements OnInit {
  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit(): void {
    if (environment.production) {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'ng-version');
    }
  }
}
