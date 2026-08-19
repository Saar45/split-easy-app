import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';

import { LoginPage } from './login.page';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'fetchCurrentUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    (routerSpy as unknown as { events: unknown }).events = EMPTY;

    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default showPassword to false', () => {
    expect(component.showPassword).toBeFalse();
  });

  it('toggleShowPassword should flip showPassword', () => {
    component.toggleShowPassword();
    expect(component.showPassword).toBeTrue();
    component.toggleShowPassword();
    expect(component.showPassword).toBeFalse();
  });

  it('password input should switch type between password and text', () => {
    const input = fixture.nativeElement.querySelector('ion-input[formcontrolname="motDePasse"]');
    expect(input.type).toBe('password');

    component.toggleShowPassword();
    fixture.detectChanges();

    expect(input.type).toBe('text');
  });

  it('password toggle button aria-label should switch with state', () => {
    const button: HTMLElement = fixture.nativeElement.querySelector('.password-toggle');
    expect(button.getAttribute('aria-label')).toBe('Afficher le mot de passe');

    component.toggleShowPassword();
    fixture.detectChanges();

    expect(button.getAttribute('aria-label')).toBe('Masquer le mot de passe');
  });

  it('clicking the toggle button flips showPassword', () => {
    const button: HTMLElement = fixture.nativeElement.querySelector('.password-toggle');
    button.click();
    expect(component.showPassword).toBeTrue();
  });

  it('should navigate to accueil on successful login', () => {
    authServiceSpy.login.and.returnValue(of({ token: 't', refresh_token: 'r', refresh_token_expiration: 1 }));
    authServiceSpy.fetchCurrentUser.and.returnValue(
      of({ id: 1, email: 'a@a.com', nom: 'A', prenom: 'B', roles: [] }),
    );

    component.form.setValue({ email: 'a@a.com', motDePasse: 'password123' });
    component.onSubmit();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/tabs/accueil', { replaceUrl: true });
  });

  it('should not submit when the form is invalid', () => {
    component.form.setValue({ email: '', motDePasse: '' });
    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});
