import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ScenePage } from './scene.page';
import { GameStateService } from '../../core/services/game-state.service';
import { StoryService } from '../../core/services/story.service';
import { AudioService } from '../../core/services/audio.service';
import { SettingsService } from '../../core/services/settings.service';
import { RegulationService } from '../../core/services/regulation.service';
import { DEFAULT_PLAYER_STATE } from '../../core/models/player-state.model';

class MockGameStateService {
  getState() {
    return of(DEFAULT_PLAYER_STATE);
  }
}

class MockStoryService {
  ready() {
    return Promise.resolve();
  }
  getScene() {
    return null;
  }
}

class MockAudioService {}
class MockSettingsService {}
class MockRegulationService {}

describe('ScenePage', () => {
  let component: ScenePage;
  let fixture: ComponentFixture<ScenePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenePage, RouterTestingModule],
      providers: [
        { provide: GameStateService, useClass: MockGameStateService },
        { provide: StoryService, useClass: MockStoryService },
        { provide: AudioService, useClass: MockAudioService },
        { provide: SettingsService, useClass: MockSettingsService },
        { provide: RegulationService, useClass: MockRegulationService },
        { provide: ActivatedRoute, useValue: { params: of({ id: '100' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
