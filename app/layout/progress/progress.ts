import { Component, OnInit } from '@angular/core';
import { CURSOS, CursoInfo } from '../../data/cursos';
import { BackgroundService } from '../background.service';
import { Router } from '@angular/router';
import { ProgressoService } from '../progresso.service'; 

@Component({
    selector: 'app-progress',
    templateUrl: './progress.html',
    styleUrls: ['./progress.scss'],
    standalone: false
})
export class Progress implements OnInit {

    constructor(
        private router: Router,
        private bg: BackgroundService,
        private progressoService: ProgressoService 
    ) {}

    // Tabela tipada corretamente
    dataSource: (CursoInfo & { progresso: string })[] = [];

    displayedColumns = ['curso'];

    ngOnInit() {
        // Monta lista completa dos cursos com cálculo REAL
        this.dataSource = CURSOS.map((curso: CursoInfo) => {
            
            // === LÓGICA DE CÁLCULO PARA CADA CURSO ===
            let totalAulas = 0;
            let aulasConcluidas = 0;

            if (curso.sessoes) {
                curso.sessoes.forEach(sessao => {
                    sessao.aulas.forEach(aula => {
                        totalAulas++; // Conta +1 no total
                        
                        // Verifica se essa aula específica está salva
                        if (this.progressoService.isConcluido(curso.id, aula.id)) {
                            aulasConcluidas++;
                        }
                    });
                });
            }

            // Se por acaso o curso não tiver sessões cadastradas, usa o valor padrão
            const totalExibir = totalAulas > 0 ? totalAulas : (curso.aulasTotal || 0);

            return {
                ...curso,
                // Formata a string ex: "2/6"
                progresso: `${aulasConcluidas}/${totalExibir}`
            };
        });
    }

    abrirCurso(curso: CursoInfo & { progresso: string }) {
        this.bg.setCurso(curso);
        this.router.navigate(['/curso']);
    }
}