import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LayoutModule } from './layout/layout.module';

// Importações Padrão
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';

@NgModule({
  declarations: [
    App,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    HttpClientModule,
    FormsModule,
    SocialLoginModule
  ],
  providers: [
    {
      // Na versão 2.1.0, usamos a string 'SocialAuthServiceConfig' explicitamente
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '279675613124-qjsj5dpa1o6tg8vgt5989sootmhj98f9.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err) => {
          console.error('Erro no Social Login:', err);
        }
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [App]
})
export class AppModule { }