import { Component, OnInit } from '@angular/core';
import { BackgroundService } from '../background.service';
import { CursoInfo, CURSOS } from '../../data/cursos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: './player.html',
  styleUrls: ['./player.scss'],
  standalone: false
})
export class Player implements OnInit {

  curso!: CursoInfo;
  aulaSelecionada: any = null;

  // exemplo de aulas, futuramente virá do backend
  aulas = CURSOS[0].sessoes[0].aulas;

  constructor(private bg: BackgroundService, private router: Router) {}

  ngOnInit(): void {
    this.bg.cursoSelecionado$.subscribe(curso => {
      if (!curso) return;
      this.curso = curso;
      this.aulas = curso.sessoes[0].aulas;
      this.aulaSelecionada = this.aulas[0];
    });
  }

  selecionarAula(aula: any) {
    this.aulaSelecionada = aula;
  }

  voltar() {
    this.router.navigate(['/curso']);
  }
}
