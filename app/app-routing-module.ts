import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DBackground } from './layout/d-background/d-background';
import { View } from './layout/view/view';
import { Progress } from './layout/progress/progress';
import { Player } from './layout/player/player';
import { Login } from './layout/login/login';
import { Register } from './layout/register/register';

import { AuthGuard } from './auth.guard'; 

const routes: Routes = [
  // Rotas PÚBLICAS (Qualquer um acessa)
  { path: 'login',    component: Login },
  { path: 'cadastrar', component: Register },

  // Rotas PROTEGIDAS (Precisa de Login)
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
    path: 'progresso', 
    component: Progress, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'player', 
    component: Player, 
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
