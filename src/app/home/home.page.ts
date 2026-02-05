import { Component } from '@angular/core';
import { isNativeCapacitor } from '@core/utils/platform.utils';
import { MOCK_SERVICES, MOCK_PRODUCTS } from '@core/mocks/products.mock';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  isNative = isNativeCapacitor();
  mockServices = MOCK_SERVICES;
  mockProducts = MOCK_PRODUCTS;
}
