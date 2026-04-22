import { Component } from '@angular/core';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  selector: 'app-error-500',
  templateUrl: 'error-500.page.html',
  standalone: false,
})
export class Error500Page {
  isNative = isNativeCapacitor();

  retry(): void {
    window.location.reload();
  }
}
