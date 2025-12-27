export const TUTORIALS = {
    // --- ADMINISTRAÇÃO GLOBAL ---
    mizukami: [
        {
            title: "Saudações, Mizukami",
            message: "Como líder supremo da Vila Oculta da Névoa, você possui autoridade absoluta sobre a gestão das organizações.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Gestão Global",
            message: "Você pode acessar qualquer organização clicando nos cards para gerenciar membros, promover líderes ou remover ninjas.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Edição Irrestrita",
            message: "Ao entrar em uma organização, você verá todas as ferramentas de edição disponíveis para manter a ordem na vila.",
            target: "header", // Foco genérico
            navigate: "sete-laminas" // Exemplo
        }
    ],

    council: [
        {
            title: "Saudações, Conselheiro",
            message: "Como membro do Conselho, você auxilia o Mizukami na administração e fiscalização da vila.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Supervisão",
            message: "Você tem permissão de edição em todas as organizações. Navegue entre elas para auditar e ajustar o que for necessário.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        }
    ],

    // --- SETE LÂMINAS ---
    'leader_sete-laminas': [
        { title: "Líder dos Espadachins", message: "Você comanda a elite dos Sete Espadachins da Névoa.", target: "header", navigate: "sete-laminas" },
        { title: "Gestão das Espadas", message: "Aqui você define quem porta cada uma das espadas lendárias e gerencia a hierarquia.", target: "table", navigate: "sete-laminas" },
        { title: "Recrutamento", message: "Use o botão 'Adicionar Novo Membro' para registrar novos portadores ou aspirantes.", target: "button:has(svg.lucide-user-plus)", navigate: "sete-laminas" }
    ],
    'member_sete-laminas': [
        { title: "Espadachim da Névoa", message: "Bem-vindo à organização mais letal da vila.", target: "header", navigate: "sete-laminas" },
        { title: "Sua Espada", message: "Verifique seu status, maestrias e qual espada você empunha na lista de membros.", target: "table", navigate: "sete-laminas" }
    ],

    // --- DIVISÃO ESPECIAL (ANBU) ---
    'leader_divisao-especial': [
        { title: "Comandante ANBU", message: "Você lidera as operações secretas da vila.", target: "header", navigate: "divisao-especial" },
        { title: "Codinomes", message: "Gerencie os codinomes e identidades dos seus agentes na tabela.", target: "table", navigate: "divisao-especial" },
        { title: "Recrutamento", message: "Adicione novos recrutas ou agentes através deste botão.", target: "button:has(svg.lucide-user-plus)", navigate: "divisao-especial" }
    ],
    'member_divisao-especial': [
        { title: "Agente ANBU", message: "Bem-vindo às sombras. Aqui você acompanha sua divisão.", target: "header", navigate: "divisao-especial" },
        { title: "Identidade", message: "Seu codinome e rank estão listados aqui. Mantenha seus dados atualizados com o comandante.", target: "table", navigate: "divisao-especial" }
    ],

    // --- FORÇA POLICIAL ---
    'leader_forca-policial': [
        { title: "Chefe de Polícia", message: "Você é responsável pela ordem e cumprimento das leis na vila.", target: "header", navigate: "forca-policial" },
        { title: "Hierarquia Militar", message: "Gerencie as patentes de seus oficiais, de Cadetes a Coronéis.", target: "table", navigate: "forca-policial" },
        { title: "Novo Oficial", message: "Registre novos oficiais na corporação aqui.", target: "button:has(svg.lucide-user-plus)", navigate: "forca-policial" }
    ],
    'member_forca-policial': [
        { title: "Oficial da Lei", message: "Bem-vindo à Força Policial. Servir e proteger.", target: "header", navigate: "forca-policial" },
        { title: "Patente", message: "Sua patente atual e status de atividade podem ser vistos nesta lista.", target: "table", navigate: "forca-policial" }
    ],

    // --- UNIDADE MÉDICA ---
    'leader_unidade-medica': [
        { title: "Diretor Médico", message: "Você gerencia a saúde e o suporte médico da vila.", target: "header", navigate: "unidade-medica" },
        { title: "Corpo Clínico", message: "Organize seus médicos, residentes e especialistas na tabela.", target: "table", navigate: "unidade-medica" },
        { title: "Contratação", message: "Adicione novos médicos ou estagiários à equipe.", target: "button:has(svg.lucide-user-plus)", navigate: "unidade-medica" }
    ],
    'member_unidade-medica': [
        { title: "Médico Ninja", message: "Bem-vindo à Unidade Médica. Sua cura é a força da vila.", target: "header", navigate: "unidade-medica" },
        { title: "Especialização", message: "Confira seu nível de especialização e status na lista da equipe.", target: "table", navigate: "unidade-medica" }
    ],
    
    // Fallback genérico
    'visitor': [
        { title: "Bem-vindo à Névoa", message: "Você está visualizando o painel como visitante. Aguarde um líder adicioná-lo a uma organização.", target: "header", navigate: "dashboard" }
    ]
};
