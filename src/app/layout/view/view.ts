import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackgroundService } from '../background.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressoService } from '../progresso.service';
import { AuthService } from '../../auth.service';
import { CURSOS } from '../../data/cursos'; // <--- IMPORTANTE: Importe sua lista de dados

@Component({
    selector: 'app-view',
    standalone: false,
    templateUrl: './view.html',
    styleUrl: './view.scss',
})
export class View implements OnInit, AfterViewInit {

    cursoAtual: any = null;
    aulasDaSessao: any[] = [];
    usuarioTemCurso = false;

    // Progress
    showProgress = false;
    progressoAtual = 0;
    aulasTotal = 1;
    
    // Modals
    showInfo = false;
    showAulas = false;

    // Keyboard Nav
    botoes: HTMLElement[] = [];
    botaoSelecionado = 0;
    sessaoSelecionada = 1;

    // Animations
    progressAnimation = 'fadein';
    infoAnim = 'info-in';

    constructor(
        private bg: BackgroundService,
        private router: Router,
        private route: ActivatedRoute,
        private progresso: ProgressoService,
        public authService: AuthService
    ) { }

    ngOnInit() {
        this.bg.keyboardMode.next(false);

        // 1. INSCRIÇÃO NOS PARÂMETROS DA URL (A CORREÇÃO PRINCIPAL)
        this.route.queryParams.subscribe(params => {
            const idUrl = Number(params['id']); // Pega o ID da URL
            
            // Se tiver um ID na URL, força o carregamento deste curso específico
            if (idUrl) {
                const cursoEncontrado = CURSOS.find(c => c.id === idUrl);
                if (cursoEncontrado) {
                    this.carregarDadosDoCurso(cursoEncontrado);
                }
            } 
            // Se não tiver ID, mas o serviço já tiver um curso (ex: navegação interna sem mudar URL)
            else {
                this.bg.cursoSelecionado$.subscribe(curso => {
                    if (curso && (!this.cursoAtual || this.cursoAtual.id !== curso.id)) {
                        this.carregarDadosDoCurso(curso);
                    }
                });
            }

            // Lógica do Modal de Info
            if (params['info'] == 1) {
                this.abrirInformacoes();
            }
        });
    }

    // === MÉTODO CENTRALIZADO PARA CARREGAR TUDO ===
    carregarDadosDoCurso(curso: any) {
        this.cursoAtual = curso;
        
        // Atualiza o background globalmente (caso o serviço controle o bg do body/html)
        document.documentElement.style.setProperty('--view-bg', `url(${curso.bg})`);
        
        // Atualiza o serviço para que outros componentes saibam quem é o atual
        // (Isso evita conflito se você voltar para a home depois)
        // Se o seu serviço tiver um método 'setCursoAtual', use-o. 
        // Se não tiver, o updateSearch costuma resetar, então só atualizamos a visualização aqui.

        this.usuarioTemCurso = this.authService.temCurso(curso.id);

        if (curso.sessoes && curso.sessoes.length > 0) {
            const primeiraSessao = curso.sessoes[0];
            this.sessaoSelecionada = primeiraSessao.id;
            this.aulasDaSessao = primeiraSessao.aulas;
        }
        this.calcularProgresso();
    }

    ngAfterViewInit() {
        this.botoes = Array.from(document.querySelectorAll('.menu-btn')) as HTMLElement[];
        this.selecionarBotao(0);
        window.addEventListener('keydown', this.handleKeys.bind(this));
    }

    onMouseMove(e: MouseEvent) {
        const btn = e.currentTarget as HTMLElement;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;
        
        btn.style.setProperty('--x', `${x}px`);
        btn.style.setProperty('--y', `${y}px`);
    }

    acaoPrincipal() {
        if (this.usuarioTemCurso) {
            this.router.navigate(['/player'], { queryParams: { aulaId: 1 } }); 
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

    assistirAula(aulaId: number) {
        if (this.usuarioTemCurso) {
            this.router.navigate(['/player'], { queryParams: { aulaId: aulaId } });
        } else {
            this.acaoPrincipal();
        }
    }

    abrirInformacoes() {
        this.showProgress = false;
        this.showAulas = false;
        this.showInfo = true;
        setTimeout(() => { this.infoAnim = 'info-in'; });
        
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

    abrirAulas() {
        this.showAulas = true;
        this.showProgress = false;
        this.showInfo = false;
    }

    fecharAulas() {
        this.showAulas = false;
        this.reativarMenu();
    }

    abrirProgresso() {
        if (this.showProgress) {
            this.progressAnimation = 'fadeout';
            setTimeout(() => { this.showProgress = false; }, 350);
            return;
        }
        this.calcularProgresso();
        this.showProgress = true;
        this.showAulas = false;
        this.showInfo = false;
        setTimeout(() => { this.progressAnimation = 'fadein'; });
    }

    calcularProgresso() {
        if (!this.cursoAtual) return;
        let total = 0;
        let concluidas = 0;
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

    selecionarSessao(id: number) {
        this.sessaoSelecionada = id;
        const sessaoEncontrada = this.cursoAtual.sessoes.find((s: any) => s.id === id);
        if (sessaoEncontrada) {
            this.aulasDaSessao = sessaoEncontrada.aulas;
        }
    }

    getNomeSessaoAtual() {
        const s = this.cursoAtual?.sessoes.find((s:any) => s.id === this.sessaoSelecionada);
        return s ? s.nome : '';
    }

    voltar() {
        this.bg.keyboardMode.next(true);
        this.router.navigate(['/']);
    }

    reativarMenu() {
        setTimeout(() => {
            this.botoes = Array.from(document.querySelectorAll('.menu-btn')) as HTMLElement[];
            if (this.botoes.length > 0) this.selecionarBotao(0);
        }, 50);
    }

    selecionarBotao(index: number) {
        this.botaoSelecionado = index;
        this.botoes.forEach((btn, i) => {
            btn.classList.toggle('btn-focus', i === index);
        });
    }

    handleKeys(event: KeyboardEvent) {
        if ((this.showInfo || this.showProgress) && event.key === 'Enter') {
            if(this.showInfo) this.fecharInformacoes();
            else if(this.showProgress) this.abrirProgresso();
            return;
        }

        if (this.showInfo || this.showAulas) return;

        if (event.key === 'ArrowDown') {
            this.botaoSelecionado = (this.botaoSelecionado + 1) % this.botoes.length;
            this.selecionarBotao(this.botaoSelecionado);
        }

        if (event.key === 'ArrowUp') {
            this.botaoSelecionado = (this.botaoSelecionado - 1 + this.botoes.length) % this.botoes.length;
            this.selecionarBotao(this.botaoSelecionado);
        }

        if (event.key === 'Enter') {
            const botao = this.botoes[this.botaoSelecionado];
            if (botao) botao.click();
        }
    }
}