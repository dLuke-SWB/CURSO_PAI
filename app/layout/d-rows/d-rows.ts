import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { BackgroundService } from '../background.service';
import { CURSOS } from '../../data/cursos';

@Component({
  selector: 'app-d-rows',
  standalone: false,
  templateUrl: './d-rows.html',
  styleUrls: ['./d-rows.scss'],
})
export class DRows implements AfterViewInit {

  @ViewChild('container', { static: false }) container!: ElementRef<HTMLDivElement>;

  items = CURSOS;
  selectedIndex = 0;

  // Drag
  isDragging = false;
  startX = 0;
  scrollLeftStart = 0;
  dragMoved = false;

  keyboardEnabled = true;

  constructor(private bg: BackgroundService) {}

  ngOnInit() {
    this.bg.keyboardMode.subscribe(enabled => {
      this.keyboardEnabled = enabled;
    });

    window.addEventListener('keydown', this.handleKey.bind(this));
  }

  ngAfterViewInit() {
    this.scrollIntoSelected();
  }

  // ==========================================================
  // SETAS LATERAIS (CLIQUE)
  // ==========================================================
  scrollLeft() {
    const el = this.container.nativeElement;
    el.scrollBy({ left: -350, behavior: 'smooth' });
  }

  scrollRight() {
    const el = this.container.nativeElement;
    el.scrollBy({ left: 350, behavior: 'smooth' });
  }

  // ==========================================================
  // DRAG NETFLIX
  // ==========================================================
  dragStart(event: MouseEvent) {
    this.isDragging = true;
    this.dragMoved = false;

    const el = this.container.nativeElement;
    this.startX = event.pageX - el.offsetLeft;
    this.scrollLeftStart = el.scrollLeft;
  }

  dragMove(event: MouseEvent) {
    if (!this.isDragging) return;

    event.preventDefault();
    this.dragMoved = true;

    const el = this.container.nativeElement;
    const x = event.pageX - el.offsetLeft;

    const walk = (x - this.startX) * 5.4;
    el.scrollLeft = this.scrollLeftStart - walk;
  }

  dragStop() {
    this.isDragging = false;

    // se arrastou, atualiza qual card está no centro da tela
    if (this.dragMoved) {
      this.updateSelectedByScroll();
    }
  }

  // ==========================================================
  // ATUALIZA SELEÇÃO COM BASE NO SCROLL
  // ==========================================================
  updateSelectedByScroll() {
    const el = this.container.nativeElement;
    const cardWidth = 350 + 8;

    const center = el.scrollLeft + el.clientWidth / 2;
    const idx = Math.round(center / cardWidth) - 1;

    if (idx >= 0 && idx < this.items.length) {
      this.selectedIndex = idx;
      this.bg.setCurso(this.items[this.selectedIndex]);
    }
  }

  // ==========================================================
  // TECLADO
  // ==========================================================
  handleKey(event: KeyboardEvent) {

    if (!this.keyboardEnabled) return;

    if (event.key === 'ArrowRight') {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
      this.bg.setCurso(this.items[this.selectedIndex]);
      this.scrollIntoSelected();
    }

    if (event.key === 'ArrowLeft') {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.items.length) % this.items.length;

      this.bg.setCurso(this.items[this.selectedIndex]);
      this.scrollIntoSelected();
    }
  }

  // ==========================================================
  // SCROLL AUTOMÁTICO
  // ==========================================================
  scrollIntoSelected() {
    const el = this.container.nativeElement;
    const cardWidth = 350 + 8;

    const visibleCards = Math.floor(el.clientWidth / cardWidth);

    el.scrollTo({
      left: Math.max((this.selectedIndex - (visibleCards - 1)) * cardWidth, 0),
      behavior: 'smooth',
    });
  }
}
