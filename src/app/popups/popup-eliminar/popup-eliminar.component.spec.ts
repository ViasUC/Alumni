import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEliminarComponent } from './popup-eliminar.component';

describe('PopupEliminarComponent', () => {
  let component: PopupEliminarComponent;
  let fixture: ComponentFixture<PopupEliminarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupEliminarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEliminarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
