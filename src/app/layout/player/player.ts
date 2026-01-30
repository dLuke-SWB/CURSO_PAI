import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BackgroundService } from '../background.service';
import { CursoInfo, AulaInfo, SessaoInfo } from '../../data/cursos';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressoService } from '../progresso.service';
// import { AuthService } from '../../auth.service';

interface SessaoExpandida extends SessaoInfo {
    expanded: boolean;
}

@Component({
    selector: 'app-player',
    templateUrl: './player.html',
    styleUrls: ['./player.scss'],
    standalone: false
})
export class Player implements OnInit, OnDestroy {

    @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

    // Dados
    curso!: CursoInfo;
    userId: number = 0;
    
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
    volume = 1;
    lastVolume = 1;

    // Menus e Animações
    showSpeedMenu = false;
    showForwardAnim = false;
    showBackwardAnim = false;
    
    // Timeouts para limpeza
    animTimeout: any;
    controlsTimeout: any;
    autoPlayTimeout: any;

    // Próxima Aula
    showNextOverlay = false;
    nextLesson: AulaInfo | null = null;

    constructor(
        private bg: BackgroundService, 
        private router: Router,
        private route: ActivatedRoute, 
        private progressoService: ProgressoService,
        // private authService: AuthService
    ) { }

    ngOnInit(): void {
        const rawUser = localStorage.getItem('usuario');
        if (rawUser) {
            this.userId = JSON.parse(rawUser).id;
            this.progressoService.carregarProgresso(this.userId).subscribe({
                error: (err) => console.error('Erro ao carregar progresso:', err)
            });
        }

        this.bg.cursoSelecionado$.subscribe((curso: any) => {
            if (!curso) return;

            // if (!this.authService.temCurso(curso.id)) { ... }

            this.curso = curso;

            if (curso.sessoes) {
                this.sessoesView = curso.sessoes.map((s: SessaoInfo) => ({ ...s, expanded: false }));

                const aulaIdParam = this.route.snapshot.queryParams['aulaId'];
                let aulaEncontrada = false;

                if (aulaIdParam) {
                    const idBusca = Number(aulaIdParam);
                    for (const sessao of this.sessoesView) {
                        const aula = sessao.aulas.find(a => a.id === idBusca);
                        if (aula) {
                            this.selecionarAula(aula);
                            sessao.expanded = true;
                            aulaEncontrada = true;
                            break;
                        }
                    }
                }

                if (!aulaEncontrada && this.sessoesView.length > 0) {
                    this.sessoesView[0].expanded = true;
                    if (this.sessoesView[0].aulas.length > 0) {
                        this.selecionarAula(this.sessoesView[0].aulas[0]);
                    }
                }
            }
        });
    }

    ngOnDestroy(): void {
        if (this.animTimeout) clearTimeout(this.animTimeout);
        if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
        if (this.autoPlayTimeout) clearTimeout(this.autoPlayTimeout);
    }

    // =========================================================
    // 1. CONTROLES GERAIS E TECLADO
    // =========================================================
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if ((event.target as HTMLElement).tagName === 'INPUT') return;

        switch (event.key) {
            case 'ArrowRight': this.skip(5); event.preventDefault(); break;
            case 'ArrowLeft': this.skip(-5); event.preventDefault(); break;
            case ' ': case 'k': this.togglePlay(); event.preventDefault(); break;
            case 'f': this.toggleFullscreen(); break;
            case 'm': this.toggleMute(); break;
        }
    }

    toggleControlsMobile() {
        if (window.innerWidth < 992) {
            this.showControls = !this.showControls;
            if (this.controlsTimeout) clearTimeout(this.controlsTimeout);
            
            if (this.showControls && this.isPlaying) {
                this.controlsTimeout = setTimeout(() => {
                    this.showControls = false;
                }, 3000);
            }
        }
    }

    // =========================================================
    // 2. PLAYBACK E SELEÇÃO
    // =========================================================
    selecionarAula(aula: AulaInfo) {
        this.showNextOverlay = false;
        this.aulaSelecionada = aula;
        this.isPlaying = true;

        setTimeout(() => {
            if (this.videoRef && this.videoRef.nativeElement) {
                const video = this.videoRef.nativeElement;
                video.load();
                video.playbackRate = this.playbackRate;
                
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => { this.isPlaying = false; });
                }
            }
        });
    }

    togglePlay(event?: Event) {
        if (event) event.stopPropagation();

        const video = this.videoRef.nativeElement;
        if (video.paused) {
            video.play();
            this.isPlaying = true;
            this.showNextOverlay = false;
        } else {
            video.pause();
            this.isPlaying = false;
            this.showControls = true; 
        }
    }

    // =========================================================
    // 3. FULLSCREEN (CORRIGIDO PARA MOBILE/IOS)
    // =========================================================
    toggleFullscreen() {
        const container = document.querySelector('.video-area') as any;
        const video = this.videoRef.nativeElement as any;

        // Verifica se já está em fullscreen (suporta prefixos Webkit/Moz)
        const isFull = document.fullscreenElement || 
                       (document as any).webkitFullscreenElement || 
                       (document as any).mozFullScreenElement ||
                       (document as any).msFullscreenElement ||
                       video.webkitDisplayingFullscreen; // Específico iOS

        if (!isFull) {
            // --- ENTRAR ---
            if (container.requestFullscreen) {
                // Padrão Desktop/Android moderno: Expande a DIV com controles
                container.requestFullscreen().catch((err: any) => {
                    console.error("Erro ao entrar em fullscreen:", err);
                    // Fallback se falhar no container (alguns Androids antigos)
                    if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
                });
            } 
            else if (video.webkitEnterFullscreen) {
                // Padrão iOS (iPhone): Expande apenas o VÍDEO (Nativo)
                video.webkitEnterFullscreen();
            }
            else if (container.webkitRequestFullscreen) {
                // Chrome/Safari antigos
                container.webkitRequestFullscreen();
            } 
            else if (container.mozRequestFullScreen) {
                // Firefox antigo
                container.mozRequestFullScreen();
            }
        } else {
            // --- SAIR ---
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if (video.webkitExitFullscreen) {
                video.webkitExitFullscreen();
            }
        }
    }

    @HostListener('document:fullscreenchange')
    @HostListener('document:webkitfullscreenchange')
    @HostListener('document:mozfullscreenchange')
    @HostListener('document:MSFullscreenChange')
    screenChange() { 
        this.isFullscreen = !!(document.fullscreenElement || 
                             (document as any).webkitFullscreenElement || 
                             (document as any).mozFullScreenElement);
    }

    // =========================================================
    // 4. EVENTOS E PROGRESSO
    // =========================================================
    onMetadataLoaded() {
        this.duration = this.videoRef.nativeElement.duration;
        this.videoRef.nativeElement.volume = this.volume;
    }

    updateProgress() {
        this.currentTime = this.videoRef.nativeElement.currentTime;
    }

    onVideoEnded() {
        this.isPlaying = false;
        this.showControls = true;

        if (this.curso && this.aulaSelecionada && this.userId) {
            this.progressoService.marcarConcluido(
                this.userId, this.curso.id, this.aulaSelecionada.id
            ).subscribe({
                error: (err) => console.error('Erro ao salvar:', err)
            });
        }
        this.checkNextLesson();
    }

    checkNextLesson() {
        if (!this.curso || !this.aulaSelecionada) return;
        let foundCurrent = false;
        this.nextLesson = null;

        for (const sessao of this.curso.sessoes) {
            for (const aula of sessao.aulas) {
                if (foundCurrent) {
                    this.nextLesson = aula;
                    this.showNextOverlay = true;
                    return;
                }
                if (aula.id === this.aulaSelecionada.id) foundCurrent = true;
            }
        }
    }

    goToNextLesson() {
        if (this.nextLesson) this.selecionarAula(this.nextLesson);
    }

    cancelNext() {
        this.showNextOverlay = false;
    }

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
            this.showForwardAnim = true; this.showBackwardAnim = false;
        } else {
            this.showBackwardAnim = true; this.showForwardAnim = false;
        }
        this.animTimeout = setTimeout(() => {
            this.showForwardAnim = false; this.showBackwardAnim = false;
        }, 600);
    }

    getGradient() {
        const percent = (this.currentTime / this.duration) * 100 || 0;
        return `linear-gradient(to right, #f79055 ${percent}%, #444 ${percent}%)`;
    }

    // =========================================================
    // 5. VOLUME E VELOCIDADE
    // =========================================================
    setVolume(event: any) {
        this.volume = parseFloat(event.target.value);
        if (this.videoRef?.nativeElement) this.videoRef.nativeElement.volume = this.volume;
        this.isMuted = (this.volume === 0);
    }

    toggleMute() {
        if (this.volume > 0) {
            this.lastVolume = this.volume;
            this.volume = 0;
            this.isMuted = true;
        } else {
            this.volume = this.lastVolume || 1;
            this.isMuted = false;
        }
        this.videoRef.nativeElement.volume = this.volume;
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

    toggleSpeedMenu() { this.showSpeedMenu = !this.showSpeedMenu; }

    setSpeed(speed: number) {
        this.playbackRate = speed;
        this.videoRef.nativeElement.playbackRate = this.playbackRate;
        this.showSpeedMenu = false;
    }

    getSpeedLabel(): string { return this.playbackRate === 1 ? 'Normal' : `${this.playbackRate}x`; }

    // =========================================================
    // 6. UTILITÁRIOS
    // =========================================================
    checkConcluido(aulaId: number): boolean {
        if (!this.curso) return false;
        return this.progressoService.isConcluido(this.curso.id, aulaId);
    }

    formatTime(seconds: number): string {
        if (!seconds || isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    voltar() {
        this.router.navigate(['/view'], { queryParams: { id: this.curso.id } });
    }
}