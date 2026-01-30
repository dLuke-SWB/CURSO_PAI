import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

// === CORREÇÃO DO ERRO NG6002 ===
// NÃO importe AppRoutingModule aqui. 
// Use RouterModule para que o routerLink funcione sem criar ciclo.
import { RouterModule } from '@angular/router'; 

import { AngularMaterialModule } from "../angular-material/angular-material.module";
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

import { Navbar } from './nav/navbar'; 
import { DBackground } from './d-background/d-background';
import { DRows } from './d-rows/d-rows';
import { Item } from './item/item';
import { Progress } from './progress/progress';
import { View } from './view/view';
import { CircleProgress } from './circle-progress/circle-progress';
import { Player } from './player/player';
import { Login } from './login/login';
import { Settings } from './settings/settings';
import { Register } from './register/register';
import { Help } from './help/help';
import { Checkout } from './checkout/checkout';
import { RecoverPassword } from "./recover-password/recover-password";

@NgModule({
  declarations: [
    Navbar, DBackground, DRows, Item, Progress, View, CircleProgress, 
    Player, Login, Register, Settings, Help, Checkout, RecoverPassword
  ],
  imports: [
    CommonModule,            
    RouterModule,            // <--- O SEGREDO ESTÁ AQUI (Troque AppRoutingModule por RouterModule)
    AngularMaterialModule,   
    FormsModule,             
    GoogleSigninButtonModule 
  ], 
  exports: [
    Navbar, DBackground, Progress, View, Player, Login, Register, Checkout
  ]
})
export class LayoutModule { }