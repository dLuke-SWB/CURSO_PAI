import { Component, OnInit } from '@angular/core';
import { CURSOS, CursoInfo } from '../../data/cursos';
import { BackgroundService } from '../background.service';
import { Router } from '@angular/router';
import { ProgressoService } from '../progresso.service'; 
import { AuthService } from '../../auth.service';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.html',
    styleUrls: ['./progress.scss'],
    standalone: false
})
export class Progress implements OnInit {

    dataSource: (CursoInfo & { progresso: string })[] = [];
    displayedColumns = ['curso'];

    constructor(
        private router: Router,
        private bg: BackgroundService,
        private progressoService: ProgressoService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        // Carrega todos os cursos da base de dados
        const todosCursos = CURSOS;
        
        // Mapeia e calcula o progresso de cada um
        this.dataSource = todosCursos.map((curso: CursoInfo) => {
            
            let totalAulas = 0;
            let aulasConcluidas = 0;

            if (curso.sessoes) {
                curso.sessoes.forEach(sessao => {
                    sessao.aulas.forEach(aula => {
                        totalAulas++;
                        // Verifica no serviço se a aula está marcada como feita
                        if (this.progressoService.isConcluido(curso.id, aula.id)) {
                            aulasConcluidas++;
                        }
                    });
                });
            }

            // Garante que não divide por zero se o curso estiver vazio
            const totalExibir = totalAulas > 0 ? totalAulas : (curso.aulasTotal || 0);

            return {
                ...curso,
                progresso: `${aulasConcluidas}/${totalExibir}`
            };
        });
        
        // (Opcional) Se quiser mostrar APENAS cursos comprados/iniciados:
        // this.dataSource = this.dataSource.filter(c => this.authService.temCurso(c.id));
    }

    abrirCurso(curso: CursoInfo & { progresso: string }) {
        // Define o curso no serviço de background (para o Hero da home e outras telas)
        this.bg.setCurso(curso);
        
        // Redireciona para a tela do curso
        this.router.navigate(['/curso']);
    }
}