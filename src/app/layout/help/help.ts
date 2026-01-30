import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.html',
  styleUrls: ['./help.scss'],
  standalone: false
})
export class Help {
  
  faqs = [
    {
      question: 'Como acesso meu certificado?',
      answer: 'Após concluir 100% das aulas, o certificado ficará disponível automaticamente na aba "Progresso" para download em PDF.',
      isOpen: false
    },
    {
      question: 'Posso assistir às aulas offline?',
      answer: 'No momento, nossa plataforma requer conexão com a internet para garantir o registro do seu progresso em tempo real.',
      isOpen: false
    },
    {
      question: 'Esqueci minha senha, e agora?',
      answer: 'Na tela de login, clique em "Esqueci minha senha". Enviaremos um link seguro de recuperação para o seu e-mail cadastrado.',
      isOpen: false
    },
    {
      question: 'Quais as formas de pagamento?',
      answer: 'Aceitamos cartão de crédito (até 12x), PIX e boleto bancário. O acesso via PIX e cartão é liberado imediatamente após a aprovação.',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    // 1. Guarda se o item clicado já estava aberto
    const wasOpen = this.faqs[index].isOpen;

    // 2. Fecha TODOS os itens
    // O CSS vai cuidar da animação suave de fechamento
    this.faqs.forEach(faq => faq.isOpen = false);

    // 3. Se o item clicado estava fechado, abre ele
    if (!wasOpen) {
      this.faqs[index].isOpen = true;
    }
  }
}