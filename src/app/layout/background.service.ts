import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {

  private cursoSelecionado = new BehaviorSubject<any>({
    id: 1,
    nome: "Curso 1 Fundamentos da fortografia e edição",
    thumb: "assets/curso1/curso1.png",
    bg: "assets/curso1/curso1.jpg",
    aulasTotal: 20,
  });

  cursoSelecionado$ = this.cursoSelecionado.asObservable();

  // ⬅ Novo controle global do teclado
  keyboardMode = new BehaviorSubject<boolean>(true);

  setCurso(curso: any) {
    this.cursoSelecionado.next(curso);
  }

  // === SISTEMA DE BUSCA ===
  private searchSubject = new BehaviorSubject<string>(''); // Começa vazio
  public search$ = this.searchSubject.asObservable();

  constructor() { }

  // Função chamada pela Navbar ao digitar
  updateSearch(term: string) {
    this.searchSubject.next(term);
  }
}
