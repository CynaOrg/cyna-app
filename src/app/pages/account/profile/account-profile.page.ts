import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewWillEnter } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MobilePageShellComponent } from '@shared/components/mobile-page-shell/mobile-page-shell.component';
import { AccountTabComponent } from '../../dashboard/account/components/account-tab/account-tab.component';
import { AuthStore } from '@core/stores/auth.store';
import { UserResponse } from '@core/interfaces/auth.interface';

/**
 * Native-only sub-page reachable from the bottom-tab Account screen.
 * Reuses the standalone AccountTabComponent to keep the form behaviour
 * identical to the web dashboard tab.
 */
@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MobilePageShellComponent,
    AccountTabComponent,
  ],
  template: `
    <app-mobile-page-shell [showBack]="true" title="ACCOUNT.MENU.PROFILE">
      <div class="px-4 py-4">
        <app-account-tab
          [user]="currentUser()"
          (profileSubmit)="onProfileSubmit($event)"
        />
      </div>
    </app-mobile-page-shell>
  `,
})
export class AccountProfilePage implements ViewWillEnter {
  private readonly authStore = inject(AuthStore);

  readonly currentUser = signal<UserResponse | null>(null);

  ionViewWillEnter(): void {
    this.authStore.getProfile().subscribe({
      next: (user) => this.currentUser.set(user),
    });
  }

  onProfileSubmit(event: {
    data: {
      firstName: string;
      lastName: string;
      companyName: string;
      vatNumber: string;
    };
    onSuccess: () => void;
    onError: (message: string) => void;
  }): void {
    this.authStore.clearError();
    this.authStore.updateProfile(event.data).subscribe({
      next: (response) => {
        this.currentUser.set(response.user);
        event.onSuccess();
      },
      error: () => {
        event.onError(this.authStore.errorValue ?? 'Failed to save profile');
      },
    });
  }
}
