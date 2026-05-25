import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: false,
})
export class ProfilPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user$ = this.auth.user$;

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login', { replaceUrl: true });
  }
}
