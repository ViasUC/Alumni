import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumanoComponent } from './humano.component';

describe('HumanoComponent', () => {
  let component: HumanoComponent;
  let fixture: ComponentFixture<HumanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HumanoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HumanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
