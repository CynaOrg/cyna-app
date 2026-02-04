import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isNativeCapacitor } from '@core/utils/platform.utils';

/**
 * Blocks /home on browser → redirects to /landing.
 * Allows /home on native.
 */
export const nativeOnlyGuard: CanActivateFn = () => {
  if (isNativeCapacitor()) {
    return true;
  }
  return inject(Router).createUrlTree(['/landing']);
};

/**
 * Blocks /landing on native → redirects to /home.
 * Allows /landing on browser.
 */
export const browserOnlyGuard: CanActivateFn = () => {
  if (!isNativeCapacitor()) {
    return true;
  }
  return inject(Router).createUrlTree(['/home']);
};
