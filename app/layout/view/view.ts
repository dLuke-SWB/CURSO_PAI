import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackgroundService } from '../background.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressoService } from '../progresso.service';

@Component({
    selector: 'app-view',
    standalone: false,
    templateUrl: './view.html',
    styleUrl: './view.scss',
})
export class View implements OnInit, AfterViewInit {

    cursoAtual: any = null;
    aulasDaSessao: any[] = [];

    // Variáveis de Progresso
    showProgress = false;
    progressoAtual = 0; // Começa zerado para ser calculado
    aulasTotal = 1;     // Começa com 1 para evitar divisão por zero
    
    // Controles de Tela
    showInfo = false;
    showAulas = false;

    // Navegação / Botões
    botoes: HTMLElement[] = [];
    botaoSelecionado = 0;
    sessaoSelecionada = 1;

    // Animações
    progressAnimation = 'fadein';
    infoAnim = 'info-in';

    constructor(
        private bg: BackgroundService,
        private router: Router,
        private route: ActivatedRoute,
        private progresso: ProgressoService
    ) { }

    ngOnInit() {
        // DESATIVA controle do carrossel (para não conflitar com a navegação vertical)
        this.bg.keyboardMode.next(false);

        this.bg.cursoSelecionado$.subscribe(curso => {
            this.cursoAtual = curso;

            if (curso) {
                // Configura o Background
                document.documentElement.style.setProperty(
                    '--view-bg',
                    `url(${curso.bg})`
                );

                // Configura as Sessões (Seleciona a primeira por padrão)
                if (curso.sessoes && curso.sessoes.length > 0) {
                    const primeiraSessao = curso.sessoes[0];
                    this.sessaoSelecionada = primeiraSessao.id;
                    this.aulasDaSessao = primeiraSessao.aulas;
                }

                // === CORREÇÃO: CALCULA O PROGRESSO REAL ===
                this.calcularProgresso();
            }
        });

        // Verifica se deve abrir a aba de info via URL
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
    // LÓGICA DE PROGRESSO REAL (ADICIONADA)
    // =====================================================
    calcularProgresso() {
        if (!this.cursoAtual) return;

        let total = 0;
        let concluidas = 0;

        // Varre todas as sessões e aulas para contar o total e as vistas
        this.cursoAtual.sessoes.forEach((sessao: any) => {
            sessao.aulas.forEach((aula: any) => {
                total++;
                if (this.progresso.isConcluido(this.cursoAtual.id, aula.id)) {
                    concluidas++;
                }
            });
        });

        this.aulasTotal = total > 0 ? total : 1;
        this.progressoAtual = concluidas;
    }

    checkConcluido(aulaId: number): boolean {
        if (!this.cursoAtual) return false;
        return this.progresso.isConcluido(this.cursoAtual.id, aulaId);
    }

    // =====================================================
    // NAVEGAÇÃO
    // =====================================================
    assistirAula(aulaId: number) {
        this.router.navigate(['/player'], {
            queryParams: { aulaId: aulaId }
        });
    }

    irParaPlayer() {
        // Botão "Começar": Vai para o player (que tratará de tocar a primeira aula ou resumir)
        this.router.navigate(['/player']);
    }

    voltar() {
        this.bg.keyboardMode.next(true);
        this.router.navigate(['/']);
    }

    selecionarSessao(id: number) {
        this.sessaoSelecionada = id;
        const sessaoEncontrada = this.cursoAtual.sessoes.find((s: any) => s.id === id);

        if (sessaoEncontrada) {
            this.aulasDaSessao = sessaoEncontrada.aulas;
        }
    }

    // =====================================================
    // CONTROLES VISUAIS (ABRIR/FECHAR)
    // =====================================================
    abrirProgresso() {
        if (this.showProgress) {
            this.progressAnimation = 'fadeout';
            setTimeout(() => { this.showProgress = false; }, 350);
            return;
        }

        // Recalcula ao abrir para garantir dados atualizados
        this.calcularProgresso();

        this.showProgress = true;
        this.showAulas = false;
        this.showInfo = false;

        setTimeout(() => { this.progressAnimation = 'fadein'; });
    }

    abrirAulas() {
        this.showAulas = true;
        this.showProgress = false;
        this.showInfo = false;
    }

    fecharAulas() {
        this.showAulas = false;
    }

    abrirInformacoes() {
        this.showProgress = false;
        this.showAulas = false;
        this.showInfo = true;

        setTimeout(() => { this.infoAnim = 'info-in'; });

        // Muda foco para o botão voltar do painel de info
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

    // =====================================================
    // TECLADO E FOCO
    // =====================================================
    selecionarBotao(index: number) {
        this.botaoSelecionado = index;
        this.botoes.forEach((btn, i) => {
            btn.classList.toggle('btn-focus', i === index);
        });
    }

    handleKeys(event: KeyboardEvent) {
        // === FECHAR INFO COM ENTER ===
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

        // === TRAVAR MENU SE OUTRO PAINEL ESTIVER ABERTO ===
        if (this.showInfo || this.showAulas) return;

        // ===== NAVEGAÇÃO SETAS =====
        if (event.key === 'ArrowDown') {
            this.botaoSelecionado = (this.botaoSelecionado + 1) % this.botoes.length;
            this.selecionarBotao(this.botaoSelecionado);
        }

        if (event.key === 'ArrowUp') {
            this.botaoSelecionado = (this.botaoSelecionado - 1 + this.botoes.length) % this.botoes.length;
            this.selecionarBotao(this.botaoSelecionado);
        }

        // ===== ENTER EXECUTA BOTÃO =====
        if (event.key === 'Enter') {
            const botao = this.botoes[this.botaoSelecionado];

            // Se for botão de progresso e já estiver aberto, fecha
            if (botao.innerText.trim().includes("Ver Progresso") && this.showProgress) {
                this.showProgress = false;
                return;
            }
            botao.click();
        }
    }

    reativarMenu() {
        setTimeout(() => {
            this.botoes = Array.from(document.querySelectorAll('.menu-btn')) as HTMLElement[];
            if (this.botoes.length > 0) {
                this.selecionarBotao(0);
            }
        }, 50);
    }
}