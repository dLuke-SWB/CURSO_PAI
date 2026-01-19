import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BackgroundService } from '../background.service';
import { CursoInfo, AulaInfo, SessaoInfo } from '../../data/cursos';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressoService } from '../progresso.service';

interface SessaoExpandida extends SessaoInfo {
    expanded: boolean;
}

@Component({
    selector: 'app-player',
    templateUrl: './player.html',
    styleUrls: ['./player.scss'],
    standalone: false
})
export class Player implements OnInit {

    @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

    // Dados do Curso
    curso!: CursoInfo;
    aulaSelecionada: AulaInfo | null = null;
    sessoesView: SessaoExpandida[] = [];

    // Estados do Player
    isPlaying = false;
    isMuted = false;
    currentTime = 0;
    duration = 0;
    showControls = false;
    playbackRate = 1.0;
    isFullscreen = false;

    // Volume
    volume = 1;      // Começa em 100% (1.0)
    lastVolume = 1;  // Para restaurar ao desmutar

    // Menu de Velocidade
    showSpeedMenu = false;

    // Animação de Skip
    showForwardAnim = false;
    showBackwardAnim = false;
    animTimeout: any;

    // Variáveis: Próxima Aula
    showNextOverlay = false;
    nextLesson: AulaInfo | null = null;
    autoPlayTimeout: any;

    constructor(
        private bg: BackgroundService, 
        private router: Router,
        private route: ActivatedRoute, 
        private progressoService: ProgressoService
    ) { }

    ngOnInit(): void {
        this.bg.cursoSelecionado$.subscribe((curso: any) => {
            if (!curso) return;
            this.curso = curso;

            if (curso.sessoes) {
                // Prepara as sessões (inicialmente fechadas)
                this.sessoesView = curso.sessoes.map((s: SessaoInfo) => ({
                    ...s,
                    expanded: false 
                }));

                // === LÓGICA DE SELEÇÃO INICIAL (LINK DIRETO) ===
                const aulaIdParam = this.route.snapshot.queryParams['aulaId'];
                let aulaEncontrada = false;

                // 1. Se veio ID na URL, tenta achar a aula
                if (aulaIdParam) {
                    const idBusca = Number(aulaIdParam);

                    for (const sessao of this.sessoesView) {
                        const aula = sessao.aulas.find(a => a.id === idBusca);
                        if (aula) {
                            // Achou! Seleciona ela e abre a sessão correspondente
                            this.selecionarAula(aula);
                            sessao.expanded = true;
                            aulaEncontrada = true;
                            break;
                        }
                    }
                }

                // 2. Se não veio ID ou não achou, seleciona a primeira do curso
                if (!aulaEncontrada && this.sessoesView.length > 0) {
                    // Abre a primeira sessão
                    this.sessoesView[0].expanded = true;
                    
                    if (this.sessoesView[0].aulas.length > 0) {
                        this.selecionarAula(this.sessoesView[0].aulas[0]);
                    }
                }
            }
        });
    }

    // =========================================================
    // 1. CONTROLES DE TECLADO
    // =========================================================
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        
        // Ignora se o usuário estiver digitando em algum input
        if ((event.target as HTMLElement).tagName === 'INPUT') return;

        switch (event.key) {
            case 'ArrowRight':
                this.skip(5);
                event.preventDefault();
                break;

            case 'ArrowLeft':
                this.skip(-5);
                event.preventDefault();
                break;

            case ' ': // Barra de Espaço
            case 'k': 
                this.togglePlay();
                event.preventDefault();
                break;
                
            case 'f': // Fullscreen
                this.toggleFullscreen();
                break;
                
            case 'm': // Mute
                this.toggleMute();
                break;
        }
    }

    // =========================================================
    // 2. FULLSCREEN E DETECÇÃO DE TELA
    // =========================================================
    @HostListener('document:fullscreenchange')
    @HostListener('document:webkitfullscreenchange')
    @HostListener('document:mozfullscreenchange')
    @HostListener('document:MSFullscreenChange')
    screenChange() {
        this.isFullscreen = !!document.fullscreenElement;
    }

    toggleFullscreen() {
        const videoArea = document.querySelector('.video-area');
        if (!document.fullscreenElement) {
            videoArea?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // =========================================================
    // 3. PLAYBACK BÁSICO E SELEÇÃO
    // =========================================================
    selecionarAula(aula: AulaInfo) {
        // Limpa qualquer overlay ou timer pendente
        this.showNextOverlay = false;
        if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);

        this.aulaSelecionada = aula;
        this.isPlaying = true;

        setTimeout(() => {
            if (this.videoRef && this.videoRef.nativeElement) {
                const video = this.videoRef.nativeElement;
                video.load();
            }
        });
    }

    togglePlay() {
        const video = this.videoRef.nativeElement;
        if (video.paused) {
            video.play();
            this.isPlaying = true;
            this.showNextOverlay = false;
            if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);
        } else {
            video.pause();
            this.isPlaying = false;
        }
    }

    onMetadataLoaded() {
        this.duration = this.videoRef.nativeElement.duration;
    }

    updateProgress() {
        this.currentTime = this.videoRef.nativeElement.currentTime;
    }

    // === LÓGICA DE FIM DE AULA ===
    onVideoEnded() {
        this.isPlaying = false;
        
        // Marca como concluído no serviço
        if (this.curso && this.aulaSelecionada) {
            this.progressoService.marcarConcluido(this.curso.id, this.aulaSelecionada.id);
        }
        
        this.checkNextLesson();
    }

    checkConcluido(aulaId: number): boolean {
        if (!this.curso) return false;
        return this.progressoService.isConcluido(this.curso.id, aulaId);
    }

    checkNextLesson() {
        if (!this.curso || !this.aulaSelecionada) return;

        let foundCurrent = false;

        for (const sessao of this.curso.sessoes) {
            for (const aula of sessao.aulas) {
                if (foundCurrent) {
                    this.nextLesson = aula;
                    this.showNextOverlay = true;
                    return; 
                }

                if (aula.id === this.aulaSelecionada.id) {
                    foundCurrent = true;
                }
            }
        }
    }

    goToNextLesson() {
        if (this.nextLesson) {
            this.selecionarAula(this.nextLesson);
        }
    }

    cancelNext() {
        this.showNextOverlay = false;
        if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);
    }

    // =========================================================
    // 4. PROGRESSO E SKIP
    // =========================================================
    seek(event: any) {
        const value = event.target.value;
        this.videoRef.nativeElement.currentTime = value;
        this.currentTime = value;
    }

    skip(seconds: number) {
        const video = this.videoRef.nativeElement;
        video.currentTime += seconds;
        this.currentTime = video.currentTime; 

        if (this.animTimeout) clearTimeout(this.animTimeout);

        if (seconds > 0) {
            this.showForwardAnim = true;
            this.showBackwardAnim = false;
        } else {
            this.showBackwardAnim = true;
            this.showForwardAnim = false;
        }

        this.animTimeout = setTimeout(() => {
            this.showForwardAnim = false;
            this.showBackwardAnim = false;
        }, 600);
    }

    getGradient() {
        const percent = (this.currentTime / this.duration) * 100;
        return `linear-gradient(to right, #f79055 ${percent}%, #444 ${percent}%)`;
    }

    // =========================================================
    // 5. VOLUME REAL
    // =========================================================
    setVolume(event: any) {
        const vol = parseFloat(event.target.value);
        this.volume = vol;
        
        if (this.videoRef && this.videoRef.nativeElement) {
            this.videoRef.nativeElement.volume = this.volume;
        }

        this.isMuted = (this.volume === 0);
    }

    toggleMute() {
        const video = this.videoRef.nativeElement;

        if (this.volume > 0) {
            this.lastVolume = this.volume;
            this.volume = 0;
            this.isMuted = true;
        } else {
            this.volume = this.lastVolume; 
            if(this.volume === 0) this.volume = 1; 
            this.isMuted = false;
        }

        video.volume = this.volume;
    }

    getVolumeIcon(): string {
        if (this.volume === 0 || this.isMuted) return 'bi-volume-mute-fill';
        if (this.volume < 0.5) return 'bi-volume-down-fill';
        return 'bi-volume-up-fill';
    }
    
    getVolumeGradient() {
        const percent = this.volume * 100;
        return `linear-gradient(to right, white ${percent}%, rgba(255,255,255,0.2) ${percent}%)`;
    }

    // =========================================================
    // 6. VELOCIDADE
    // =========================================================
    toggleSpeedMenu() {
        this.showSpeedMenu = !this.showSpeedMenu;
    }

    setSpeed(speed: number) {
        this.playbackRate = speed;
        this.videoRef.nativeElement.playbackRate = this.playbackRate;
        this.showSpeedMenu = false;
    }

    getSpeedLabel(): string {
        return this.playbackRate === 1 ? 'Normal' : `${this.playbackRate}x`;
    }

    // =========================================================
    // 7. UTILITÁRIOS
    // =========================================================
    formatTime(seconds: number): string {
        if (!seconds) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    voltar() {
        this.router.navigate(['/curso']);
    }
}