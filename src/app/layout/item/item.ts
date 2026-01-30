import { Component, Input, Output, EventEmitter } from '@angular/core'; // Adicione Output, EventEmitter
import { BackgroundService } from '../background.service';
import { DRows } from '../d-rows/d-rows';

@Component({
  selector: 'app-item',
  templateUrl: './item.html',
  styleUrls: ['./item.scss'],
  standalone: false
})
export class Item {

  @Input() data: any; 
  @Input() isSelected: boolean = false;
  
  // CRIAMOS UM EVENTO DE SAÍDA
  @Output() aoSolicitarAbertura = new EventEmitter<void>();

  constructor(
    private bg: BackgroundService,
    private rows: DRows
  ) {}

  selecionarCurso() {
    this.bg.setCurso(this.data);
    const index = this.rows.items.indexOf(this.data);
    if (index !== -1) {
      this.rows.selectedIndex = index;
    }
  }

  // Ao dar Double Click, garantimos a seleção e emitimos o evento
  onDoubleClick() {
    this.selecionarCurso(); // Garante que virou o atual
    this.aoSolicitarAbertura.emit(); // Avisa o pai (DRows)
  }
}