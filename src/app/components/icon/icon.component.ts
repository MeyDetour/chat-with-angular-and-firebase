import {Component, input} from '@angular/core';
@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
  host: { class: 'd-block' },

})
export class IconComponent {
  iconLink = input('/google.svg')
  action = input()
}
