import { Component, Input } from '@angular/core';
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

  constructor(
    private bg: BackgroundService,
    private rows: DRows            // ⬅ injeta o DRows aqui
  ) {}

  selecionarCurso() {
    // 1) troca o background
    this.bg.setCurso(this.data);

    // 2) descobre qual é o índice desse item dentro da lista do DRows
    const index = this.rows.items.indexOf(this.data);

    // 3) se existir, atualiza o selectedIndex do pai
    if (index !== -1) {
      this.rows.selectedIndex = index;
    }
  }
}
