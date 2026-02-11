import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddressFormComponent } from './address-form.component';
import { InputComponent } from '../input/input.component';
import { Component } from '@angular/core';

@Component({
  template: `<app-address-form
    [type]="type"
    [value]="value"
    (addressChange)="onAddressChange($event)"
  />`,
  standalone: true,
  imports: [AddressFormComponent],
})
class TestHostComponent {
  type: 'billing' | 'shipping' = 'billing';
  value: any = null;
  lastAddress: any = null;

  onAddressChange(address: any): void {
    this.lastAddress = address;
  }
}

describe('AddressFormComponent', () => {
  let component: AddressFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        AddressFormComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form with billing fields', () => {
    expect(component.form).toBeTruthy();
    expect(component.form.contains('street')).toBeTrue();
    expect(component.form.contains('city')).toBeTrue();
    expect(component.form.contains('postalCode')).toBeTrue();
    expect(component.form.contains('country')).toBeTrue();
    expect(component.form.contains('state')).toBeTrue();
    expect(component.form.contains('recipientName')).toBeFalse();
    expect(component.form.contains('phone')).toBeFalse();
  });

  it('should default country to FR', () => {
    expect(component.form.get('country')?.value).toBe('FR');
  });

  it('should be invalid when required fields are empty', () => {
    component.form.patchValue({
      street: '',
      city: '',
      postalCode: '',
      country: '',
    });
    expect(component.form.valid).toBeFalse();
  });

  it('should be valid when all required fields are filled', () => {
    component.form.patchValue({
      street: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    });
    expect(component.form.valid).toBeTrue();
  });

  it('isValid() should mark all fields as touched and return validity', () => {
    expect(component.isValid()).toBeFalse();
    expect(component.form.get('street')?.touched).toBeTrue();

    component.form.patchValue({
      street: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    });
    expect(component.isValid()).toBeTrue();
  });

  it('should emit addressChange when form becomes valid', () => {
    component.form.patchValue({
      street: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    });
    fixture.detectChanges();

    expect(host.lastAddress).toBeTruthy();
    expect(host.lastAddress.street).toBe('123 Rue Test');
    expect(host.lastAddress.city).toBe('Paris');
  });

  it('should not emit addressChange when form is invalid', () => {
    host.lastAddress = null;
    component.form.patchValue({
      street: '',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
    });
    fixture.detectChanges();

    expect(host.lastAddress).toBeNull();
  });
});

describe('AddressFormComponent (shipping mode)', () => {
  let component: AddressFormComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TestHostComponent,
        AddressFormComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.type = 'shipping';
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should include shipping-specific fields', () => {
    expect(component.form.contains('recipientName')).toBeTrue();
    expect(component.form.contains('phone')).toBeTrue();
  });

  it('should require recipientName for shipping', () => {
    component.form.patchValue({
      street: '123 Rue Test',
      city: 'Paris',
      postalCode: '75001',
      country: 'FR',
      recipientName: '',
    });
    expect(component.form.valid).toBeFalse();

    component.form.patchValue({ recipientName: 'Jean Dupont' });
    expect(component.form.valid).toBeTrue();
  });
});
