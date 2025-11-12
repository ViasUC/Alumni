import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEndorseComponent } from './popup-endorse.component';

describe('PopupEndorseComponent', () => {
  let component: PopupEndorseComponent;
  let fixture: ComponentFixture<PopupEndorseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupEndorseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEndorseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
