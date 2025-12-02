export interface AulaInfo {
    id: number;
    titulo: string;
    video: string;
    duracao: string;
}

export interface SessaoInfo {
    id: number;
    nome: string;
    aulas: AulaInfo[];
}

export interface CursoInfo {
    id: number;
    nome: string;
    bg: string;
    thumb: string;
    descricao?: string;
    sessoes: SessaoInfo[];
    aulasTotal: number;
}

export const CURSOS: CursoInfo[] = [

    // ==========================================================
    // CURSO 1
    // ==========================================================
    {
        id: 1,
        nome: 'Curso 1 — Fundamentos da Fotografia e Edição',
        descricao: 'Fotografia básica',
        thumb: "assets/curso1/curso1.png",
        bg: "assets/curso1/curso1.jpg",
        aulasTotal: 6,

        sessoes: [
            {
                id: 1,
                nome: "Sessão 1",
                aulas: [
                    { id: 1, titulo: "Introdução", video: "assets/curso1/aula1.mov", duracao: "5min" },
                    { id: 2, titulo: "Exposição", video: "assets/curso1/aula2.mp4", duracao: "7min" },
                    { id: 3, titulo: "ISO / Diafragma", video: "assets/curso1/aula3.mp4", duracao: "6min" },
                    { id: 4, titulo: "Velocidade", video: "assets/curso1/aula4.mp4", duracao: "8min" },
                    { id: 5, titulo: "Balanço de Branco", video: "assets/curso1/aula5.mp4", duracao: "4min" },
                    { id: 6, titulo: "Conclusão", video: "assets/curso1/aula6.mp4", duracao: "5min" }
                ]
            }
        ]
    },

    // ==========================================================
    // CURSO 2
    // ==========================================================
    {
        id: 2,
        nome: 'Curso 2 — Colorimetria e Tratamento',
        descricao: 'Edição básica',
        thumb: "assets/curso2/curso2.png",
        bg: "assets/curso2/curso2.jpg",
        aulasTotal: 4,
        sessoes: [
            {
                id: 1,
                nome: "Sessão Única",
                aulas: [
                    { id: 1, titulo: "Introdução", video: "assets/curso2/aula1.mp4", duracao: "5min" },
                    { id: 2, titulo: "Cores primárias", video: "assets/curso2/aula2.mp4", duracao: "7min" },
                    { id: 3, titulo: "Máscaras", video: "assets/curso2/aula3.mp4", duracao: "6min" },
                    { id: 4, titulo: "Finalização", video: "assets/curso2/aula4.mp4", duracao: "8min" },
                ]
            }
        ]
    },

    // ==========================================================
    // CURSO 3
    // ==========================================================
    {
        id: 3,
        nome: 'Curso 3 — Enquadramento e Composição',
        descricao: 'Enquadramento básico',
        thumb: "assets/curso3/curso3.png",
        bg: "assets/curso3/curso3.jpg",
        aulasTotal: 3,
        sessoes: [
            {
                id: 1,
                nome: "Sessão Única",
                aulas: [
                    { id: 1, titulo: "Introdução", video: "assets/curso3/aula1.mp4", duracao: "5min" },
                    { id: 2, titulo: "Regra dos Terços", video: "assets/curso3/aula2.mp4", duracao: "7min" },
                    { id: 3, titulo: "Linhas Guias", video: "assets/curso3/aula3.mp4", duracao: "6min" }
                ]
            }
        ]
    },

    // ==========================================================
    // CURSO 4
    // ==========================================================
    {
        id: 4,
        nome: 'Curso 4 — Luz e Iluminação',
        descricao: 'Iluminação básica',
        thumb: "assets/curso4/curso4.png",
        bg: "assets/curso4/curso4.jpg",
        aulasTotal: 4,  
        sessoes: [
            {
                id: 1,
                nome: "Luz Natural",
                aulas: [
                    { id: 1, titulo: "Direção de luz", video: "assets/curso4/aula1.mp4", duracao: "5min" },
                    { id: 2, titulo: "Golden Hour", video: "assets/curso4/aula2.mp4", duracao: "7min" },
                ]
            },
            {
                id: 2,
                nome: "Luz Artificial",
                aulas: [
                    { id: 3, titulo: "Softbox", video: "assets/curso4/aula3.mp4", duracao: "6min" },
                    { id: 4, titulo: "LED Panels", video: "assets/curso4/aula4.mp4", duracao: "8min" },
                ]
            }
        ]
    },

    // ==========================================================
    // CURSO 5
    // ==========================================================
    {
        id: 5,
        nome: 'Curso 5 — Cenário e Produção',
        descricao: 'Produção básica',
        thumb: "assets/curso5/curso5.png",
        bg: "assets/curso5/curso5.jpg",
        aulasTotal: 3,

        sessoes: [
            {
                id: 1,
                nome: "Sessão Única",
                aulas: [
                    { id: 1, titulo: "Introdução", video: "assets/curso5/aula1.mp4", duracao: "5min" },
                    { id: 2, titulo: "Montagem", video: "assets/curso5/aula2.mp4", duracao: "7min" },
                    { id: 3, titulo: "Objetos de Cena", video: "assets/curso5/aula3.mp4", duracao: "6min" },
                ]
            }
        ]
    },

    // ==========================================================
    // CURSO 6
    // ==========================================================
    {
        id: 6,
        nome: 'Curso 6 — Lentes e Equipamentos',
        descricao: 'Lentes básicas',
        thumb: "assets/curso6/curso6.png",
        bg: "assets/curso6/curso6.jpg",
        aulasTotal: 4,
        sessoes: [
            {
                id: 1,
                nome: "Sessão Única",
                aulas: [
                    { id: 1, titulo: "Lentes Fixas", video: "assets/curso6/aula1.mp4", duracao: "5min" },
                    { id: 2, titulo: "Zoom", video: "assets/curso6/aula2.mp4", duracao: "7min" },
                    { id: 3, titulo: "Abetura e Profundidade", video: "assets/curso6/aula3.mp4", duracao: "6min" },
                    { id: 4, titulo: "Lentes Artisticas", video: "assets/curso6/aula4.mp4", duracao: "8min" },
                ]
            }
        ]
    }
];
