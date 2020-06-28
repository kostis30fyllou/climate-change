import {animate, state, style, transition, trigger} from "@angular/animations";

export const animation = trigger('state', [
  state('*', style({
    transform: 'translate(-50%, {{y}}%)'
  }), {params: {y: -50}}),
  transition('* => *', [
    animate('{{time}}s')
  ], {params: {time: 0.5}})
]);
