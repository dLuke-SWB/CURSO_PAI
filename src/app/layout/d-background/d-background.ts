import { Component, OnInit, OnDestroy } from '@angular/core';
import { BackgroundService } from '../background.service';
import { gsap } from 'gsap';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'app-d-background',
    standalone: false,
    templateUrl: './d-background.html',
    styleUrl: './d-background.scss',
})
export class DBackground implements OnInit, OnDestroy {
    
    cursoAtual: any = null;
    usuarioTemCurso = false;
    
    private loadingUrl: string | null = null; 

    constructor(
        private bgService: BackgroundService, 
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.bgService.cursoSelecionado$.subscribe(async (curso) => {
            if (!curso) return;

            this.cursoAtual = curso;
            this.usuarioTemCurso = this.authService.temCurso(curso.id);

            const bgElement = document.querySelector('.bg-fade') as HTMLElement;
            
            if (bgElement) {
                const targetUrl = curso.bg;
                this.loadingUrl = targetUrl;

                await this.animarFadeOut(bgElement);

                if (this.loadingUrl !== targetUrl) return;

                try {
                    await this.preloadImage(targetUrl);
                } catch (err) {
                    console.error("Erro ou imagem inexistente", err);
                }

                if (this.loadingUrl !== targetUrl) return;

                bgElement.style.backgroundImage = `url(${targetUrl})`;
                await new Promise(r => setTimeout(r, 50));
                this.animarFadeIn(bgElement);
            }
        });

        window.addEventListener('keydown', this.handleKey);
    }

    // === NOVO: RASTREAMENTO DO MOUSE PARA O EFEITO DE BORDA ===
    onMouseMove(e: MouseEvent) {
        const btn = e.currentTarget as HTMLElement;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;
        
        btn.style.setProperty('--x', `${x}px`);
        btn.style.setProperty('--y', `${y}px`);
    }

    private async preloadImage(src: string): Promise<void> {
        const img = new Image();
        img.src = src;
        try {
            await img.decode();
        } catch (e) {
            return new Promise((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
            });
        }
    }

    private animarFadeOut(element: HTMLElement): Promise<void> {
        return new Promise((resolve) => {
            gsap.to(element, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => resolve()
            });
        });
    }

    private animarFadeIn(element: HTMLElement) {
        gsap.to(element, {
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
        });
    }

    ngOnDestroy(): void {
        window.removeEventListener('keydown', this.handleKey);
    }
    
    acaoPrincipal() {
        if (this.usuarioTemCurso) {
            this.irParaView();
        } else {
            this.router.navigate(['/checkout'], { 
                queryParams: { 
                    id: this.cursoAtual.id,
                    valor: this.cursoAtual.valor,
                    nome: this.cursoAtual.nome 
                } 
            });
        }
    }

    irParaView(showInfo: boolean = false) {
        this.router.navigate(['/curso'], {
            queryParams: { info: showInfo ? 1 : 0 }
        });
    }

    handleKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            this.acaoPrincipal();
        }
    }
}