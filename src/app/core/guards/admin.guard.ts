import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Blocks access to the admin dashboard if no credentials are stored.
 * Credentials are saved to sessionStorage on login and cleared on logout.
 */
export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  let creds = null;
  if (isPlatformBrowser(platformId)) {
    creds = sessionStorage.getItem('md_admin_creds');
  }
  
  if (creds) return true;
  router.navigate(['/admin/login']);
  return false;
};
