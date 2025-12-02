import { NgModule        } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule   } from '@angular/material/card';
import { MatTableModule  } from '@angular/material/table';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
}

@NgModule({
	imports: [
		MatCardModule,
		MatButtonModule,
		MatTableModule
	],
	exports: [
		MatCardModule,
		MatButtonModule,
		MatTableModule
	]
})

export class AngularMaterialModule { }