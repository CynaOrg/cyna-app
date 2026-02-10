import { Component, inject, OnInit } from '@angular/core';
import { CartStore } from '@core/stores/cart.store';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly cartStore = inject(CartStore);

  ngOnInit(): void {
    this.cartStore.loadFromStorage();
  }
}
