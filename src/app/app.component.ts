import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    const settings = this.settingsService.getSettings();
    const lang = settings.language || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(lang);
  }
}
