import { Component } from '@angular/core';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  isNative = isNativeCapacitor();
}
