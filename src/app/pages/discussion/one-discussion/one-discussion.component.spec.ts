import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneDiscussionComponent } from './one-discussion.component';

describe('OneDiscussionComponent', () => {
  let component: OneDiscussionComponent;
  let fixture: ComponentFixture<OneDiscussionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneDiscussionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneDiscussionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
