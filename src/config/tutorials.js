export const TUTORIALS = {
    // --- ADMINISTRAÇÃO GLOBAL ---
    mizukami: [
        {
            title: "Painel do Mizukami",
            message: "Como líder supremo, você tem controle total sobre as organizações. Use este painel para supervisionar e gerenciar a vila.",
            target: "#main-header",
            navigate: "dashboard"
        },
        {
            title: "Organizações da Vila",
            message: "Clique nos cards abaixo para acessar os detalhes de cada organização, gerenciar membros e visualizar hierarquias.",
            target: "#dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Monitoramento de Segurança",
            message: "Acesse o 'Monitoramento' para ver logs de acesso e auditoria em tempo real.",
            target: "#btn-monitoring",
            navigate: "access"
        }
    ],

    council: [
        {
            title: "Acesso do Conselho",
            message: "Bem-vindo, Conselheiro. Você tem permissão para auditar e editar membros de todas as organizações.",
            target: "#main-header",
            navigate: "dashboard"
        },
        {
            title: "Supervisão",
            message: "Navegue pelas organizações clicando nos cards para verificar o cumprimento das regras e hierarquias.",
            target: "#dashboard-grid",
            navigate: "dashboard"
        }
    ],

    // --- LÍDERES ---
    'leader_sete-laminas': [
        { title: "Líder dos Espadachins", message: "Você comanda os Sete Espadachins da Névoa.", target: "#org-header", navigate: "sete-laminas" },
        { title: "Gestão de Membros", message: "Use a tabela para verificar quem porta cada espada e atualizar seus status.", target: "#members-table", navigate: "sete-laminas" },
        { title: "Adicionar Membro", message: "Clique aqui para registrar novos portadores ou aspirantes.", target: "#btn-add-member", navigate: "sete-laminas" }
    ],
    'leader_divisao-especial': [
        { title: "Comandante ANBU", message: "Lidere as operações secretas da vila com eficiência.", target: "#org-header", navigate: "divisao-especial" },
        { title: "Identidades Secretas", message: "Garanta que todos os agentes tenham seus codinomes registrados na tabela.", target: "#members-table", navigate: "divisao-especial" },
        { title: "Novo Agente", message: "Recrute novos membros para a divisão através deste botão.", target: "#btn-add-member", navigate: "divisao-especial" }
    ],
    'leader_forca-policial': [
        { title: "Chefe de Polícia", message: "Mantenha a ordem na vila gerenciando a Força Policial.", target: "#org-header", navigate: "forca-policial" },
        { title: "Hierarquia Militar", message: "Organize seus oficiais por patente e monitore sua atividade.", target: "#members-table", navigate: "forca-policial" },
        { title: "Registrar Oficial", message: "Adicione novos membros à corporação aqui.", target: "#btn-add-member", navigate: "forca-policial" }
    ],
    'leader_unidade-medica': [
        { title: "Diretor Médico", message: "Gerencie o hospital e a equipe médica da vila.", target: "#org-header", navigate: "unidade-medica" },
        { title: "Corpo Clínico", message: "Acompanhe a especialização e carreira dos seus médicos.", target: "#members-table", navigate: "unidade-medica" },
        { title: "Nova Contratação", message: "Adicione médicos e estagiários à sua equipe.", target: "#btn-add-member", navigate: "unidade-medica" }
    ],

    // --- MEMBROS ---
    'member_sete-laminas': [
        { title: "Espadachim", message: "Bem-vindo à elite. Acompanhe seu status na organização.", target: "#org-header", navigate: "sete-laminas" },
        { title: "Sua Ficha", message: "Encontre seu nome na lista para ver seus atributos e maestrias.", target: "#members-table", navigate: "sete-laminas" }
    ],
    'member_divisao-especial': [
        { title: "Agente", message: "Bem-vindo à ANBU. Mantenha sua identidade e status atualizados.", target: "#org-header", navigate: "divisao-especial" },
        { title: "Seu Registro", message: "Verifique seu codinome e rank na tabela operacional.", target: "#members-table", navigate: "divisao-especial" }
    ],
    'member_forca-policial': [
        { title: "Oficial", message: "Bem-vindo à Força Policial. Servir e proteger.", target: "#org-header", navigate: "forca-policial" },
        { title: "Sua Patente", message: "Confira sua patente e atividade recente na lista de oficiais.", target: "#members-table", navigate: "forca-policial" }
    ],
    'member_unidade-medica': [
        { title: "Médico Ninja", message: "Bem-vindo à Unidade Médica. Sua cura é essencial.", target: "#org-header", navigate: "unidade-medica" },
        { title: "Seu Status", message: "Verifique seu nível e especializações na tabela da equipe.", target: "#members-table", navigate: "unidade-medica" }
    ],

    // --- VISITANTE ---
    'visitor': [
        { title: "Bem-vindo", message: "Este é o painel da Vila Oculta da Névoa. Aguarde um líder adicioná-lo.", target: "#main-header", navigate: "dashboard" },
        { title: "Organizações", message: "Você pode visualizar a estrutura das organizações clicando nos cards.", target: "#dashboard-grid", navigate: "dashboard" }
    ]
};
