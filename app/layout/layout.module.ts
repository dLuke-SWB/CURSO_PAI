import { NgModule              } from "@angular/core";
import { Navbar                } from './nav/navbar';
import { DBackground           } from './d-background/d-background';
import { AngularMaterialModule } from "../angular-material/angular-material.module";
import { DRows                 } from './d-rows/d-rows';
import { Item                  } from './item/item';
import { Progress              } from './progress/progress';
import { View                  } from './view/view';
import { DAulas                } from './d-aulas/d-aulas';
import { CommonModule          } from '@angular/common';
import { AppRoutingModule      } from "../app-routing-module";
import { CircleProgress        } from './circle-progress/circle-progress';
import { Player                } from './player/player';
import { FormsModule           } from '@angular/forms';
import { Login } from './login/login';
import { Register } from './register/register';

@NgModule({
   declarations: [
      Navbar,
      DBackground,
      DRows, 
      Item,
      Progress,
      View,
      DAulas,
      CircleProgress,
      Player,
      Login,
      Register
   ],
   imports: [
      AngularMaterialModule,
      CommonModule,
      AppRoutingModule,
      FormsModule
   ], 
   exports: [
      Navbar,
      DBackground,
      Progress,
      View,
      Player,
      Login,
      Register
   ]
})
export class LayoutModule { }
