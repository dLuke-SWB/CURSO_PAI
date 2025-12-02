import { Component } from '@angular/core';
import { CURSOS, CursoInfo } from '../../data/cursos';
import { BackgroundService } from '../background.service';
import { gsap } from 'gsap';
import { Router } from '@angular/router';

@Component({
    selector: 'app-d-background',
    standalone: false,
    templateUrl: './d-background.html',
    styleUrl: './d-background.scss',
})
export class DBackground {
    cursos = CURSOS;
    cursoSelecionado: CursoInfo = this.cursos[0]; // começa no primeiro

    selecionarCurso(curso: CursoInfo) {
        this.cursoSelecionado = curso;
    }

    cursoAtual: any = null;

    constructor(private bgService: BackgroundService, private router: Router) { }

    irParaView(showInfo: boolean = false) {
        this.router.navigate(['/curso'], {
            queryParams: { info: showInfo ? 1 : 0 }
        });
    }

    ngOnInit() {
        this.bgService.cursoSelecionado$.subscribe((curso) => {
            if (curso) {
                this.cursoAtual = curso;
            }
        });

        this.bgService.cursoSelecionado$.subscribe((curso) => {
            if (!curso) return;

            const bg = document.querySelector('.bg-fade') as HTMLElement;

            gsap.to(bg, {
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: () => {
                    bg.style.backgroundImage = `url(${curso.bg})`;

                    gsap.to(bg, {
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power2.out',
                    });

                    this.cursoAtual = curso;
                },
            });
        });

        window.addEventListener('keydown', this.handleKey.bind(this));
    }
    
    handleKey(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.irParaView();
        }
    }
}
