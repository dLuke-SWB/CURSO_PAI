import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackgroundService } from '../background.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-view',
    standalone: false,
    templateUrl: './view.html',
    styleUrl: './view.scss',
})
export class View implements OnInit, AfterViewInit {

    cursoAtual: any = null;

    constructor(
        private bg: BackgroundService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    showProgress = false;
    progressoAtual = 6;
    aulasTotal = 20;
    showInfo = false;
    showAulas = false;

    // lista dos botões
    botoes: HTMLElement[] = [];
    botaoSelecionado = 0;

    sessoes = [
        { id: 1, nome: "Sessão 1" },
        { id: 2, nome: "Sessão 2" },
        { id: 3, nome: "Sessão 3" }
    ];
    sessaoSelecionada = 1;

    ngOnInit() {

        // DESATIVA controle do carrossel
        this.bg.keyboardMode.next(false);

        this.bg.cursoSelecionado$.subscribe(curso => {
            this.cursoAtual = curso;

            if (curso) {
                document.documentElement.style.setProperty(
                    '--view-bg',
                    `url(${curso.bg})`
                );
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['info'] == 1) {
                this.showInfo = true;
                this.showAulas = false;
                this.showProgress = false;
            }
        });
    }

    ngAfterViewInit() {
        this.botoes = Array.from(document.querySelectorAll('.menu-btn')) as HTMLElement[];
        this.selecionarBotao(0);

        window.addEventListener('keydown', this.handleKeys.bind(this));
    }

    // =====================================================
    // Foco e navegação nos botões
    // =====================================================
    selecionarBotao(index: number) {
        this.botaoSelecionado = index;

        this.botoes.forEach((btn, i) => {
            btn.classList.toggle('btn-focus', i === index);
        });
    }

    // =====================================================
    // Teclado — CORRIGIDO PARA FECHAR MODAL
    // =====================================================
    handleKeys(event: KeyboardEvent) {

        // === FECHAR INFO COM ENTER (TEM QUE VIR ANTES DE TUDO) ===
        if (this.showInfo && event.key === 'Enter') {
            this.fecharInformacoes();
            return;
        }

        // === FECHAR PROGRESSO COM ENTER ===
        if (this.showProgress && event.key === 'Enter') {
            this.progressAnimation = 'fadeout';
            setTimeout(() => this.showProgress = false, 350);
            return;
        }

        // === TRAVAR MENU QUANDO INFO OU AULAS ESTIVEREM ABERTOS ===
        if (this.showInfo || this.showAulas) return;

        // ===== NAVEGAÇÃO NORMAL =====
        if (event.key === 'ArrowDown') {
            this.botaoSelecionado =
                (this.botaoSelecionado + 1) % this.botoes.length;
            this.selecionarBotao(this.botaoSelecionado);
        }

        if (event.key === 'ArrowUp') {
            this.botaoSelecionado =
                (this.botaoSelecionado - 1 + this.botoes.length) % this.botoes.length;
            this.selecionarBotao(this.botaoSelecionado);
        }

        // ===== ENTER EXECUTA BOTÃO =====
        if (event.key === 'Enter') {

            const botao = this.botoes[this.botaoSelecionado];

            // ver progresso já estava aberto → fecha
            if (botao.innerText.trim().includes("Ver Progresso") && this.showProgress) {
                this.showProgress = false;
                return;
            }

            botao.click();
        }
    }


    // =====================================================
    // BOTÕES VISUAIS
    // =====================================================
    abrirAulas() {
        this.showAulas = true;
        this.showProgress = false;
        this.showInfo = false;
    }

    fecharAulas() {
        this.showAulas = false;
    }

    abrirProgresso() {

        // SE já está aberto → fechar com animação
        if (this.showProgress) {
            this.progressAnimation = 'fadeout';

            setTimeout(() => {
                this.showProgress = false;
            }, 350);
            return;
        }

        // ABRIR
        this.showProgress = true;

        // garante que a animação entra corretamente
        setTimeout(() => {
            this.progressAnimation = 'fadein';
        });
    }

    abrirInformacoes() {

        // Garantir que exclui outros painéis
        this.showProgress = false;
        this.showAulas = false;

        this.showInfo = true;

        setTimeout(() => {
            this.infoAnim = 'info-in';
        });

        // Seleciona automaticamente o botão "Voltar"
        setTimeout(() => {
            this.botoes = Array.from(document.querySelectorAll('.info-btn')) as HTMLElement[];
            this.selecionarBotao(0);
        }, 50);
    }

    fecharInformacoes() {
        this.infoAnim = 'info-out';

        setTimeout(() => {
            this.showInfo = false;
            this.reativarMenu();
        }, 350);
    }

    selecionarSessao(id: number) {
        this.sessaoSelecionada = id;
    }

    irParaPlayer() {
        this.router.navigate(['/player']);
    }

    voltar() {
        this.bg.keyboardMode.next(true);
        this.router.navigate(['/']);
    }

    progressAnimation = 'fadein';
    infoAnim = 'info-in';


    reativarMenu() {
        setTimeout(() => {
            this.botoes = Array.from(document.querySelectorAll('.menu-btn')) as HTMLElement[];

            if (this.botoes.length > 0) {
                this.selecionarBotao(0);
            }
        }, 50);
    }

}
