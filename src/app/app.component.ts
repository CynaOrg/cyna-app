import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '@core/stores/auth.store';
import { CartStore } from '@core/stores/cart.store';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly cartStore = inject(CartStore);

  ngOnInit(): void {
    this.authStore.tryRestoreSession().subscribe();
    this.cartStore.loadFromStorage();
  }
}
