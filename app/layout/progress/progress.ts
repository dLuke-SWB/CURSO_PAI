import { Component, OnInit } from '@angular/core';
import { CURSOS, CursoInfo } from '../../data/cursos';
import { BackgroundService } from '../background.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.html',
    styleUrls: ['./progress.scss'],
    standalone: false
})
export class Progress implements OnInit {

    constructor(
        private router: Router,
        private bg: BackgroundService
    ) {}

    // tabela tipada corretamente
    dataSource: (CursoInfo & { progresso: string })[] = [];

    // progresso fake (por enquanto)
    progressoFake: { [id: number]: number } = {
        1: 6,
        2: 12
    };

    displayedColumns = ['curso'];

    ngOnInit() {

        // monta lista completa dos cursos
        this.dataSource = CURSOS.map((curso: CursoInfo) => ({
            ...curso,  // << INCLUI bg, thumb, descricao, nome, id, aulasTotal
            progresso: `${this.progressoFake[curso.id] || 0}/${curso.aulasTotal}`
        }));
    }

    abrirCurso(curso: CursoInfo & { progresso: string }) {
        // envia o curso completo (agora com BG!)
        this.bg.setCurso(curso);

        // navega para a tela do curso selecionado
        this.router.navigate(['/curso']);
    }

}
