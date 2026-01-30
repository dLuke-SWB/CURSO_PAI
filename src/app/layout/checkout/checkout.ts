import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
  standalone: false
})
export class Checkout implements OnInit, OnDestroy {

  // === DADOS DE CHECKOUT ===
  loading = false;
  qrCodeBase64 = ''; 
  pixCode = '';
  curso = {
    id: 0,
    nome: 'Carregando...',
    preco: '0,00'
  };

  // === CONTROLE VISUAL (TYPEWRITER) ===
  logoText: string = '';
  finalText: string = 'Alexandre Bricio';
  intervals: any[] = []; // Array para limpar todos os timers

  // === CONTROLE DE TOAST & TIMER ===
  toastVisible = false;
  toastTimeout: any;
  timerDisplay = '10:00';
  pixExpirado = false;
  private intervalId: any;

  constructor(private location: Location, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Inicia a animação de escrita
    this.typeWriterLoop();

    // === LÊ OS DADOS ENVIADOS PELO BOTÃO COMPRAR ===
    this.route.queryParams.subscribe(params => {
        if(params['id']) {
            this.curso = {
                id: params['id'],
                nome: params['nome'],
                // Se vier como número, formata. Se string, usa direto.
                preco: params['valor'] 
            };
        }
    });
  }

  ngOnDestroy(): void {
    // Limpa todos os timeouts/intervals para evitar memory leak
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    
    this.intervals.forEach(i => clearTimeout(i));
    this.intervals.forEach(i => clearInterval(i));
  }

  // === EFEITO MÁQUINA DE ESCREVER (MESMO DO LOGIN) ===
  typeWriterLoop() {
    let isDeleting = false;
    let charIndex = 0;
    let typeSpeed = 150;
    
    const tick = () => {
        if (isDeleting) {
            this.logoText = this.finalText.substring(0, charIndex - 1);
            charIndex--; typeSpeed = 75;
        } else {
            this.logoText = this.finalText.substring(0, charIndex + 1);
            charIndex++; typeSpeed = 150;
        }
        
        if (!isDeleting && this.logoText === this.finalText) {
            isDeleting = true; typeSpeed = 2500; // Espera antes de apagar
        } else if (isDeleting && this.logoText === '') {
            isDeleting = false; charIndex = 0; typeSpeed = 500; // Espera antes de recomeçar
        }
        
        const timer = setTimeout(tick, typeSpeed);
        this.intervals.push(timer);
    };
    tick();
  }

  // === AÇÕES DE CHECKOUT ===
  voltar() {
    this.location.back();
  }

  gerarPix() {
    this.loading = true;
    this.pixExpirado = false;
    this.timerDisplay = '10:00';

    setTimeout(() => {
        this.loading = false;
        // Simulação API
        this.qrCodeBase64 = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PixExemplo';
        this.pixCode = '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Alexandre Bricio6008BRASILIA62070503***6304E2CA';
        
        this.iniciarContagem(600); 
    }, 1500);
  }

  iniciarContagem(segundos: number) {
    if (this.intervalId) clearInterval(this.intervalId);

    let timer = segundos;
    this.intervalId = setInterval(() => {
      const minutos = Math.floor(timer / 60);
      const segs = timer % 60;
      this.timerDisplay = `${minutos < 10 ? '0' : ''}${minutos}:${segs < 10 ? '0' : ''}${segs}`;

      if (--timer < 0) {
        clearInterval(this.intervalId);
        this.timerDisplay = "00:00";
        this.pixExpirado = true;
      }
    }, 1000);
  }

  copiarPix(inputElement: HTMLInputElement) {
    if(this.pixExpirado) return;

    inputElement.select();
    navigator.clipboard.writeText(this.pixCode).then(() => {
        this.mostrarToast();
    }).catch(err => {
        document.execCommand('copy');
        this.mostrarToast();
    });
  }

  mostrarToast() {
    if (this.toastVisible) {
        clearTimeout(this.toastTimeout);
        this.toastVisible = false;
        setTimeout(() => {
            this.toastVisible = true;
            this.iniciarTimeoutEsconder();
        }, 100);
    } else {
        this.toastVisible = true;
        this.iniciarTimeoutEsconder();
    }
  }

  iniciarTimeoutEsconder() {
    this.toastTimeout = setTimeout(() => {
        this.toastVisible = false;
    }, 3000);
  }
}