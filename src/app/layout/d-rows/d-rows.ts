import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { BackgroundService } from '../background.service';
import { CURSOS, CursoInfo } from '../../data/cursos';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-d-rows',
  standalone: false,
  templateUrl: './d-rows.html',
  styleUrls: ['./d-rows.scss'],
})
export class DRows implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild('container', { static: false }) container!: ElementRef<HTMLDivElement>;

  // Evento para avisar o pai (DBackground) para navegar
  @Output() navegarParaCurso = new EventEmitter<any>();

  // Armazena todos os cursos (Backup)
  allCursos: CursoInfo[] = CURSOS;
  
  // Armazena os cursos visíveis (Filtrados)
  items: CursoInfo[] = [];

  selectedIndex = 0;
  searchSubscription!: Subscription;

  // Variáveis de Drag (Arrastar)
  isDragging = false;
  startX = 0;
  scrollLeftStart = 0;
  dragMoved = false;

  keyboardEnabled = true;

  constructor(private bg: BackgroundService) {}

  ngOnInit() {
    // 1. Inicializa a lista com tudo
    this.items = [...this.allCursos];

    // 2. Escuta o modo teclado (ativado/desativado)
    this.bg.keyboardMode.subscribe(enabled => {
      this.keyboardEnabled = enabled;
    });

    // 3. Escuta a BARRA DE BUSCA (Correção Principal)
    this.searchSubscription = this.bg.search$.subscribe((term: string) => {
        this.filtrarCursos(term);
    });

    // 4. Adiciona ouvinte de teclas global
    window.addEventListener('keydown', this.handleKey);
  }

  ngAfterViewInit() {
    this.scrollIntoSelected();
  }

  ngOnDestroy(): void {
      // Limpa a memória ao sair da tela
      window.removeEventListener('keydown', this.handleKey);
      if (this.searchSubscription) this.searchSubscription.unsubscribe();
  }

  // ==========================================================
  // LÓGICA DE FILTRAGEM (BUSCA)
  // ==========================================================
  filtrarCursos(term: string) {
    if (!term || term.trim() === '') {
        // Se vazio, mostra tudo
        this.items = [...this.allCursos];
    } else {
        // Filtra por nome ou descrição
        const lowerTerm = term.toLowerCase();
        this.items = this.allCursos.filter(c => 
            c.nome.toLowerCase().includes(lowerTerm) || 
            (c.descricao && c.descricao.toLowerCase().includes(lowerTerm))
        );
    }

    // Reseta a seleção para o primeiro item da nova lista
    this.selectedIndex = 0;
    
    // Atualiza o background se houver itens
    if (this.items.length > 0) {
        this.bg.setCurso(this.items[0]);
    }

    // Se o container já existir, rola para o início
    if (this.container && this.container.nativeElement) {
        this.container.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }

  // ==========================================================
  // NAVEGAÇÃO
  // ==========================================================
  repassarNavegacao(item: any) {
    this.navegarParaCurso.emit(item);
  }

  // ==========================================================
  // SCROLL MANUAL (Setas Laterais)
  // ==========================================================
  scrollLeft() {
    if (this.items.length === 0) return;
    const el = this.container.nativeElement;
    el.scrollBy({ left: -365, behavior: 'smooth' });
  }

  scrollRight() {
    if (this.items.length === 0) return;
    const el = this.container.nativeElement;
    el.scrollBy({ left: 365, behavior: 'smooth' });
  }

  // ==========================================================
  // DRAG & DROP (Mouse)
  // ==========================================================
  dragStart(event: MouseEvent) {
    if (this.items.length === 0) return; // Não arrasta se vazio

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
    if (this.dragMoved) {
      this.updateSelectedByScroll();
    }
  }

  // ==========================================================
  // ATUALIZAÇÃO POR SCROLL
  // ==========================================================
  updateSelectedByScroll() {
    if (this.items.length === 0) return;

    const el = this.container.nativeElement;
    const cardWidth = 350 + 15; // Largura + Gap

    const center = el.scrollLeft + el.clientWidth / 2;
    const idx = Math.round(center / cardWidth) - 1;

    if (idx >= 0 && idx < this.items.length) {
      this.selectedIndex = idx;
      this.bg.setCurso(this.items[this.selectedIndex]);
    }
  }

  // ==========================================================
  // CONTROLE VIA TECLADO (Arrow Bind)
  // ==========================================================
  // Usamos arrow function aqui ou .bind(this) no ngOnInit para manter o contexto 'this'
  handleKey = (event: KeyboardEvent) => {
    
    // Bloqueios de segurança
    if (!this.keyboardEnabled) return;
    if (this.items.length === 0) return; // Se a busca não achou nada, ignora teclado

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

    if (event.key === 'Enter') {
        this.repassarNavegacao(this.items[this.selectedIndex]);
    }
  }

  // ==========================================================
  // SCROLL AUTOMÁTICO (Ao selecionar via teclado)
  // ==========================================================
  scrollIntoSelected() {
    if (!this.container || this.items.length === 0) return;

    const el = this.container.nativeElement;
    const cardWidth = 350 + 15;
    const visibleCards = Math.floor(el.clientWidth / cardWidth);

    el.scrollTo({
      left: Math.max((this.selectedIndex - (visibleCards - 1)) * cardWidth, 0),
      behavior: 'smooth',
    });
  }
}