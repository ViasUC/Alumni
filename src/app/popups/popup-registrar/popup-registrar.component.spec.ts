import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupRegistrarComponent } from './popup-registrar.component';

describe('PopupRegistrarComponent', () => {
  let component: PopupRegistrarComponent;
  let fixture: ComponentFixture<PopupRegistrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupRegistrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupRegistrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
