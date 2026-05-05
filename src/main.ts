import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { importProvidersFrom } from '@angular/core';
import { Observable } from 'rxjs';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Registrar locales
registerLocaleData(localeEs);
registerLocaleData(localeEn);

function getSavedLanguage(): 'es' | 'en' {
  try {
    const stored = localStorage.getItem('blackForestSettings');
    if (stored) {
      const settings = JSON.parse(stored) as { language?: string };
      if (settings.language === 'en') {
        return 'en';
      }
    }
  } catch {
    // Ignore parse errors and use default
  }
  return 'es';
}

const savedLanguage = getSavedLanguage();

// Clase personalizada para cargar traducciones
class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }
}

// Función para crear el loader de traducciones
export function HttpLoaderFactory(http: HttpClient): CustomTranslateLoader {
  return new CustomTranslateLoader(http);
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: savedLanguage },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        defaultLanguage: savedLanguage
      })
    ),
  ],
});
