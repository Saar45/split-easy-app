import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActionSheetController, ToastController } from '@ionic/angular';
import { of } from 'rxjs';

import { TabsPage } from './tabs.page';
import { GroupService } from '../core/services/group.service';
import { Group } from '../core/models/group.model';

const makeGroup = (id: number): Group => ({
  id,
  nom: `Groupe ${id}`,
  statut: 'actif',
  date_creation: '2026-01-01',
});

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  let actionSheetCtrlSpy: jasmine.SpyObj<ActionSheetController>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let routerSpy: jasmine.SpyObj<Router>;
  let groupServiceSpy: jasmine.SpyObj<GroupService>;

  const sheetPresent = jasmine.createSpy('present').and.returnValue(Promise.resolve());
  const toastPresent = jasmine.createSpy('present').and.returnValue(Promise.resolve());

  beforeEach(async () => {
    actionSheetCtrlSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    actionSheetCtrlSpy.create.and.returnValue(Promise.resolve({ present: sheetPresent } as unknown as HTMLIonActionSheetElement));

    toastCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastCtrlSpy.create.and.returnValue(Promise.resolve({ present: toastPresent } as unknown as HTMLIonToastElement));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    groupServiceSpy = jasmine.createSpyObj('GroupService', ['list']);
    groupServiceSpy.list.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [TabsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActionSheetController, useValue: actionSheetCtrlSpy },
        { provide: ToastController, useValue: toastCtrlSpy },
        { provide: Router, useValue: routerSpy },
        { provide: GroupService, useValue: groupServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openQuickAdd', () => {
    it('creates an action sheet with 4 buttons', async () => {
      const event = new MouseEvent('click');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component.openQuickAdd(event);
      await fixture.whenStable();

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();

      expect(actionSheetCtrlSpy.create).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          buttons: jasmine.arrayWithExactContents([
            jasmine.objectContaining({ text: 'Nouvelle dépense' }),
            jasmine.objectContaining({ text: 'Nouveau groupe' }),
            jasmine.objectContaining({ text: 'Proposer un remboursement' }),
            jasmine.objectContaining({ role: 'cancel' }),
          ]),
        }),
      );
      expect(sheetPresent).toHaveBeenCalled();
    });

    it('navigates to groupes and shows toast when no groups (nouvelle dépense)', async () => {
      groupServiceSpy.list.and.returnValue(of([]));
      fixture = TestBed.createComponent(TabsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();

      let capturedButtons: { text?: string; role?: string; handler?: () => void }[] = [];
      actionSheetCtrlSpy.create.and.callFake((opts: { buttons: typeof capturedButtons }) => {
        capturedButtons = opts.buttons;
        return Promise.resolve({ present: sheetPresent } as unknown as HTMLIonActionSheetElement);
      });

      component.openQuickAdd(new MouseEvent('click'));
      await fixture.whenStable();

      const depenseBtn = capturedButtons.find((b) => b.text === 'Nouvelle dépense');
      depenseBtn?.handler?.();
      await fixture.whenStable();

      expect(toastCtrlSpy.create).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/groupes']);
    });

    it('navigates directly to add expense when exactly 1 group', async () => {
      groupServiceSpy.list.and.returnValue(of([makeGroup(42)]));
      fixture = TestBed.createComponent(TabsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();

      let capturedButtons: { text?: string; role?: string; handler?: () => void }[] = [];
      actionSheetCtrlSpy.create.and.callFake((opts: { buttons: typeof capturedButtons }) => {
        capturedButtons = opts.buttons;
        return Promise.resolve({ present: sheetPresent } as unknown as HTMLIonActionSheetElement);
      });

      component.openQuickAdd(new MouseEvent('click'));
      await fixture.whenStable();

      const depenseBtn = capturedButtons.find((b) => b.text === 'Nouvelle dépense');
      depenseBtn?.handler?.();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/depenses/add', 42]);
    });

    it('shows toast and navigates to groupes when multiple groups (nouvelle dépense)', async () => {
      groupServiceSpy.list.and.returnValue(of([makeGroup(1), makeGroup(2)]));
      fixture = TestBed.createComponent(TabsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();

      let capturedButtons: { text?: string; role?: string; handler?: () => void }[] = [];
      actionSheetCtrlSpy.create.and.callFake((opts: { buttons: typeof capturedButtons }) => {
        capturedButtons = opts.buttons;
        return Promise.resolve({ present: sheetPresent } as unknown as HTMLIonActionSheetElement);
      });

      component.openQuickAdd(new MouseEvent('click'));
      await fixture.whenStable();

      const depenseBtn = capturedButtons.find((b) => b.text === 'Nouvelle dépense');
      depenseBtn?.handler?.();
      await fixture.whenStable();

      expect(toastCtrlSpy.create).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/groupes']);
    });

    it('navigates to groupes/create for nouveau groupe', async () => {
      let capturedButtons: { text?: string; role?: string; handler?: () => void }[] = [];
      actionSheetCtrlSpy.create.and.callFake((opts: { buttons: typeof capturedButtons }) => {
        capturedButtons = opts.buttons;
        return Promise.resolve({ present: sheetPresent } as unknown as HTMLIonActionSheetElement);
      });

      component.openQuickAdd(new MouseEvent('click'));
      await fixture.whenStable();

      const groupeBtn = capturedButtons.find((b) => b.text === 'Nouveau groupe');
      groupeBtn?.handler?.();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/groupes/create']);
    });

    it('navigates to remboursements when at least 1 group', async () => {
      groupServiceSpy.list.and.returnValue(of([makeGroup(5)]));
      fixture = TestBed.createComponent(TabsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();

      let capturedButtons: { text?: string; role?: string; handler?: () => void }[] = [];
      actionSheetCtrlSpy.create.and.callFake((opts: { buttons: typeof capturedButtons }) => {
        capturedButtons = opts.buttons;
        return Promise.resolve({ present: sheetPresent } as unknown as HTMLIonActionSheetElement);
      });

      component.openQuickAdd(new MouseEvent('click'));
      await fixture.whenStable();

      const rembBtn = capturedButtons.find((b) => b.text === 'Proposer un remboursement');
      rembBtn?.handler?.();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/remboursements']);
    });
  });
});
