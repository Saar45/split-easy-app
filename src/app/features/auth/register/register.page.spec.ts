import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';

import { RegisterPage } from './register.page';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'login', 'fetchCurrentUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    (routerSpy as unknown as { events: unknown }).events = EMPTY;

    TestBed.configureTestingModule({
      declarations: [RegisterPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
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

  it('should not show the strength indicator when the password is empty', () => {
    const indicator = fixture.nativeElement.querySelector('.password-strength');
    expect(indicator).toBeNull();
  });

  it('should show the strength indicator once a password is entered', () => {
    component.form.controls['motDePasse'].setValue('Aa1!aaaa');
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('.password-strength');
    expect(indicator).not.toBeNull();
    expect(component.passwordStrength.level).toBe('fort');
    expect(indicator.textContent).toContain('Fort');
  });

  it('should reflect a weak password in the indicator', () => {
    component.form.controls['motDePasse'].setValue('aaaaaaaa');
    fixture.detectChanges();

    expect(component.passwordStrength.level).toBe('faible');
    const label = fixture.nativeElement.querySelector('.password-strength-label');
    expect(label.textContent).toContain('Faible');
  });

  it('should not alter form validity based on the strength indicator', () => {
    component.form.controls['motDePasse'].setValue('aaaaaaaa');
    fixture.detectChanges();

    expect(component.form.controls['motDePasse'].valid).toBeFalse();
  });

  it('should navigate to accueil after register, login and fetchCurrentUser succeed', () => {
    authServiceSpy.register.and.returnValue(
      of({ id: 1, email: 'a@a.com', nom: 'A', prenom: 'B', roles: [] }),
    );
    authServiceSpy.login.and.returnValue(of({ token: 't', refresh_token: 'r', refresh_token_expiration: 1 }));
    authServiceSpy.fetchCurrentUser.and.returnValue(
      of({ id: 1, email: 'a@a.com', nom: 'A', prenom: 'B', roles: [] }),
    );

    component.form.setValue({
      nom: 'Doe',
      prenom: 'John',
      email: 'a@a.com',
      motDePasse: 'Password1!',
      cguAcceptees: true,
    });
    component.onSubmit();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/tabs/accueil', { replaceUrl: true });
  });

  it('should not submit when the form is invalid', () => {
    component.form.setValue({
      nom: '',
      prenom: '',
      email: '',
      motDePasse: '',
      cguAcceptees: false,
    });
    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });
});
