import {Component} from "@angular/core";
import {animation} from "./animation";
import {transition, trigger} from "@angular/animations";

@Component({
  selector: 'slide',
  template: `
    <div @blockInitialRenderAnimation>
      <div [@state]="{value: state, params: {y: y}}"
           style="position: absolute;top: 50%;left: 50%;width: 100%;min-height: 50vh">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  animations: [animation,
    trigger(
      "blockInitialRenderAnimation",
      [
        transition( ":enter", [] )
      ]
    )]
})
export class SlideComponent {
  state: number = 1
  y: number = -50;
  medium: boolean = true;
}
