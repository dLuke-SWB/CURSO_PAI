import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { BackgroundService } from '../background.service';
import { CursoInfo, AulaInfo, SessaoInfo } from '../../data/cursos';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressoService } from '../progresso.service';
import shaka from 'shaka-player/dist/shaka-player.compiled';

interface SessaoExpandida extends SessaoInfo {
    expanded: boolean;
}

@Component({
    selector: 'app-player',
    templateUrl: './player.html',
    styleUrls: ['./player.scss'],
    standalone: false
})
export class Player implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
    player: any;

    // Estados de Controle
    isWindowHidden = false;
    securityError = false;
    userIdentifier = 'Usuario Anônimo';

    // Dados
    curso!: CursoInfo;
    userId: number = 0;
    aulaSelecionada: AulaInfo | null = null;
    sessoesView: SessaoExpandida[] = [];

    // Playback
    isPlaying = false;
    isMuted = false;
    currentTime = 0;
    duration = 0;
    showControls = false;
    playbackRate = 1.0;
    isFullscreen = false;
    volume = 1;

    // UI
    showSpeedMenu = false;
    showForwardAnim = false;
    showBackwardAnim = false;
    showNextOverlay = false;
    nextLesson: AulaInfo | null = null;
    
    animTimeout: any;
    controlsTimeout: any;

    constructor(
        private bg: BackgroundService, 
        private router: Router,
        private route: ActivatedRoute, 
        private progressoService: ProgressoService
    ) { }

    ngOnInit(): void {
        const rawUser = localStorage.getItem('usuario');
        if (rawUser) {
            const user = JSON.parse(rawUser);
            this.userId = user.id;
            this.userIdentifier = user.email || user.cpf || `ID: ${user.id}`;
            this.progressoService.carregarProgresso(this.userId).subscribe({
                error: (err) => console.error('Erro ao carregar progresso:', err)
            });
        }

        this.bg.cursoSelecionado$.subscribe((curso: any) => {
            if (!curso) return;
            this.curso = curso;
            if (curso.sessoes) {
                this.sessoesView = curso.sessoes.map((s: SessaoInfo) => ({ ...s, expanded: false }));
                const aulaIdParam = this.route.snapshot.queryParams['aulaId'];
                
                setTimeout(() => {
                    if (aulaIdParam) {
                        const id = Number(aulaIdParam);
                        for (const s of this.sessoesView) {
                            const a = s.aulas.find(x => x.id === id);
                            if (a) {
                                this.selecionarAula(a);
                                s.expanded = true;
                                break;
                            }
                        }
                    } else if (this.sessoesView.length > 0 && this.sessoesView[0].aulas.length > 0) {
                        this.sessoesView[0].expanded = true;
                        this.selecionarAula(this.sessoesView[0].aulas[0]);
                    }
                }, 100);
            }
        });
    }

    ngAfterViewInit() {
        this.initShakaPlayer();
    }

    ngOnDestroy(): void {
        if (this.player) this.player.destroy();
        clearTimeout(this.animTimeout);
        clearTimeout(this.controlsTimeout);
    }

    // === BLACKOUT (PERDA DE FOCO) ===
    // Correção: Removido ['$event'] pois a função não aceita argumentos
    @HostListener('window:blur')
    @HostListener('document:visibilitychange')
    onLossOfFocus() {
        if (document.hidden || !document.hasFocus()) {
            this.isWindowHidden = true;
            if (this.videoRef && this.videoRef.nativeElement) {
                this.videoRef.nativeElement.pause();
                this.isPlaying = false;
            }
        }
    }

    // Correção: Removido ['$event'] pois a função não aceita argumentos
    @HostListener('window:focus')
    onGainFocus() {
        this.isWindowHidden = false;
    }

    // === SHAKA PLAYER ===
    initShakaPlayer() {
        if (!this.videoRef || !this.videoRef.nativeElement) return;
        if (this.player) return;

        shaka.polyfill.installAll();

        if (shaka.Player.isBrowserSupported()) {
            const videoElement = this.videoRef.nativeElement;
            this.player = new shaka.Player(videoElement);

            this.player.configure({
                drm: {
                    clearKeys: {
                        'd06f95e26372074e53ca0733d9d30560': '100b6c20940f779a4589152b57d2dacb'
                    }
                }
            });

            this.player.addEventListener('error', (event: any) => {
                console.error('Shaka Error:', event);
                if (event.detail && event.detail.code >= 6000) {
                     this.securityError = true;
                }
            });
        } else {
            console.error('Browser not supported!');
            this.securityError = true;
        }
    }

    async selecionarAula(aula: AulaInfo) {
        this.showNextOverlay = false;
        this.aulaSelecionada = aula;
        this.securityError = false;

        if (!this.player) this.initShakaPlayer();
        
        if (!this.player) {
            setTimeout(() => this.selecionarAula(aula), 500);
            return;
        }

        try {
            await this.player.load(aula.video); 
            const video = this.videoRef.nativeElement;
            video.playbackRate = this.playbackRate;
            video.play().then(() => {
                this.isPlaying = true;
            }).catch(() => {
                this.isPlaying = false;
            });
        } catch (e: any) {
            console.error('Erro Load:', e);
        }
    }

    // === CONTROLES ===
    
    togglePlay() {
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

    toggleFullscreen() {
        const container = document.querySelector('.video-area') as any;
        const video = this.videoRef.nativeElement as any;
        const isFull = document.fullscreenElement || (document as any).webkitFullscreenElement; 
        if (!isFull) {
            if (container.requestFullscreen) container.requestFullscreen();
            else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    }

    @HostListener('document:fullscreenchange')
    screenChange() { this.isFullscreen = !!document.fullscreenElement; }

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

    seek(event: any) {
        const value = event.target.value;
        this.videoRef.nativeElement.currentTime = value;
        this.currentTime = value;
    }

    setVolume(event: any) {
        this.volume = parseFloat(event.target.value);
        if (this.videoRef?.nativeElement) this.videoRef.nativeElement.volume = this.volume;
        this.isMuted = (this.volume === 0);
    }

    toggleMute() {
        if (this.volume > 0) {
            this.volume = 0;
            this.isMuted = true;
        } else {
            this.volume = 1;
            this.isMuted = false;
        }
        this.videoRef.nativeElement.volume = this.volume;
    }
    
    // UI Helpers
    onMetadataLoaded() {
        this.duration = this.videoRef.nativeElement.duration;
        this.videoRef.nativeElement.volume = this.volume;
    }
    updateProgress() { this.currentTime = this.videoRef.nativeElement.currentTime; }
    
    onVideoEnded() {
        this.isPlaying = false;
        this.showControls = true;
        if(this.userId && this.curso && this.aulaSelecionada) {
            this.progressoService.marcarConcluido(this.userId, this.curso.id, this.aulaSelecionada.id).subscribe();
        }
        this.checkNextLesson();
    }

    checkNextLesson() {
        if (!this.curso || !this.aulaSelecionada) return;
        let found = false;
        for (const s of this.curso.sessoes) {
            for (const a of s.aulas) {
                if (found) { this.nextLesson = a; this.showNextOverlay = true; return; }
                if (a.id === this.aulaSelecionada.id) found = true;
            }
        }
    }

    goToNextLesson() { if (this.nextLesson) this.selecionarAula(this.nextLesson); }
    cancelNext() { this.showNextOverlay = false; }
    
    toggleSpeedMenu() { this.showSpeedMenu = !this.showSpeedMenu; }
    setSpeed(s: number) { 
        this.playbackRate = s; 
        this.videoRef.nativeElement.playbackRate = s; 
        this.showSpeedMenu = false; 
    }
    
    getGradient() { return `linear-gradient(to right, #f79055 ${(this.currentTime/this.duration)*100}%, #444 0%)`; }
    getVolumeGradient() { return `linear-gradient(to right, white ${this.volume*100}%, rgba(255,255,255,0.2) 0%)`; }
    getVolumeIcon() { return this.volume === 0 ? 'bi-volume-mute-fill' : 'bi-volume-up-fill'; }
    getSpeedLabel() { return this.playbackRate + 'x'; }
    
    formatTime(s: number) { 
        if(!s) return '00:00';
        const m=Math.floor(s/60), sec=Math.floor(s%60);
        return `${m<10?'0':''}${m}:${sec<10?'0':''}${sec}`; 
    }
    checkConcluido(id: number) { 
        if(!this.curso) return false;
        return this.progressoService.isConcluido(this.curso.id, id); 
    }
    
    voltar() {
        if(this.curso) this.router.navigate(['/curso'], { queryParams: { id: this.curso.id } });
        else this.router.navigate(['/']);
    }

    // Teclado
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if ((event.target as HTMLElement).tagName === 'INPUT') return;
        switch (event.key) {
            case 'ArrowRight': this.skip(5); event.preventDefault(); break;
            case 'ArrowLeft': this.skip(-5); event.preventDefault(); break;
            case ' ': 
            case 'k': 
                event.preventDefault(); 
                this.togglePlay(); 
                break;
            case 'f': this.toggleFullscreen(); break;
            case 'm': this.toggleMute(); break;
        }
    }
    
    preventRightClick(event: MouseEvent) { event.preventDefault(); return false; }
}
