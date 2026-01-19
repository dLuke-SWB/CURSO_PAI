import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ProgressoService {

    private storageKey = 'curso_progresso';

    constructor() { }

    // Recupera todos os dados salvos
    private getDados(): any {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    // Marca uma aula como concluída
    marcarConcluido(cursoId: number, aulaId: number) {
        const dados = this.getDados();

        // Cria a estrutura se não existir: dados[cursoId] = [lista de aulas]
        if (!dados[cursoId]) {
            dados[cursoId] = [];
        }

        // Se ainda não estiver na lista, adiciona
        if (!dados[cursoId].includes(aulaId)) {
            dados[cursoId].push(aulaId);
            localStorage.setItem(this.storageKey, JSON.stringify(dados));
        }
    }

    // Verifica se uma aula já foi assistida
    isConcluido(cursoId: number, aulaId: number): boolean {
        const dados = this.getDados();
        return dados[cursoId] && dados[cursoId].includes(aulaId);
    }
}