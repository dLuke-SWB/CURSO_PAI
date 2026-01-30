import { NgModule           } from "@angular/core";
import { MatButtonModule    } from '@angular/material/button';
import { MatCardModule      } from '@angular/material/card';
import { MatTableModule     } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
}

@NgModule({
	imports: [
		MatCardModule,
		MatButtonModule,
		MatTableModule,
		MatExpansionModule
	],
	exports: [
		MatCardModule,
		MatButtonModule,
		MatTableModule,
		MatExpansionModule
	]
})

export class AngularMaterialModule { }