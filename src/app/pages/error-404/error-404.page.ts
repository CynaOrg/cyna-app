import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  selector: 'app-error-404',
  templateUrl: 'error-404.page.html',
  standalone: false,
})
export class Error404Page {
  private readonly location = inject(Location);
  isNative = isNativeCapacitor();

  goBack(): void {
    this.location.back();
  }
}
