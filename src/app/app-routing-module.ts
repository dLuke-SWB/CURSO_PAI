import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// === IMPORTAÇÃO DOS COMPONENTES ===
import { DBackground } from './layout/d-background/d-background';
import { View } from './layout/view/view';
import { Progress } from './layout/progress/progress';
import { Player } from './layout/player/player';
import { Settings } from './layout/settings/settings';
import { Help } from './layout/help/help';

// Telas Públicas
import { Login } from './layout/login/login';
import { Register } from './layout/register/register';
import { RecoverPassword } from './layout/recover-password/recover-password'; // Importe se faltar

// === IMPORTAÇÃO DO GUARDIÃO ===
import { AuthGuard } from './auth.guard'; 
import { Checkout } from './layout/checkout/checkout';

const routes: Routes = [
  // ==========================================
  // 1. ROTAS PÚBLICAS (Acesso Livre)
  // ==========================================
  { path: 'login', component: Login },
  { path: 'cadastrar', component: Register },
  { path: 'recuperar-senha', component: RecoverPassword },

  // ==========================================
  // 2. ROTAS PROTEGIDAS (Exigem Login)
  // ==========================================
  { 
    path: '', 
    component: DBackground,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'curso', 
    component: View, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'aula', 
    component: Player, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'progresso', 
    component: Progress, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'configuracoes', 
    component: Settings, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'ajuda', 
    component: Help, 
    canActivate: [AuthGuard] 
  },

  // === CORREÇÃO AQUI ===
  // Removemos o "/:id" para aceitar QueryParams (?id=1&valor=...)
  { 
    path: 'checkout', 
    component: Checkout, 
    canActivate: [AuthGuard] 
  },

  // ==========================================
  // 3. ROTA CORINGA (Segurança Final)
  // ==========================================
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled' 
    })
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}