import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DBackground } from './layout/d-background/d-background';
import { View } from './layout/view/view';
import { Progress } from './layout/progress/progress';
import { Player } from './layout/player/player';

const routes: Routes = [
  { path: ''         , component: DBackground },  
  { path: 'curso'    , component: View        },
  { path: 'progresso', component: Progress    },
  { path: 'player'   , component: Player      }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
