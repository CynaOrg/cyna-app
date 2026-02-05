import { Component } from '@angular/core';
import { MOCK_SERVICES, MOCK_PRODUCTS } from '@core/mocks/products.mock';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.page.html',
  standalone: false,
})
export class LandingPage {
  mockServices = MOCK_SERVICES;
  mockProducts = MOCK_PRODUCTS;
}
