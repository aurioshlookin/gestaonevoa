export const TUTORIALS = {
    // --- ADMINISTRAÇÃO GLOBAL (Mizukami) ---
    mizukami: [
        {
            title: "Painel do Mizukami",
            message: "Bem-vindo, Líder Supremo. Este painel é o centro nervoso da Vila Oculta da Névoa. Aqui você tem controle total sobre todas as organizações e hierarquias.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Visão Geral das Forças",
            message: "Na tela inicial, você vê o status de todas as organizações: Sete Lâminas, ANBU, Polícia e Médicos. As barras coloridas indicam a lotação de cada grupo.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Monitoramento em Tempo Real",
            message: "Esta é uma ferramenta crucial de segurança. Aqui você vê quem acessou o painel e um log detalhado de alterações. Use isso para auditar seus líderes.",
            target: "button[title='Monitoramento Integrado']", // Seletor específico
            navigate: "access"
        },
        {
            title: "Gestão Irrestrita",
            message: "Ao entrar em qualquer organização, você terá poder total: editar fichas, alterar níveis, promover líderes e remover membros. Nada está bloqueado para você.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        }
    ],

    // --- CONSELHO ---
    council: [
        {
            title: "Painel do Conselho",
            message: "Saudações, Conselheiro. Você possui autoridade para fiscalizar e intervir em todas as organizações da vila.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Acesso Global",
            message: "Você pode entrar em qualquer organização e realizar alterações nas fichas dos membros se necessário.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Alertas de Conflito",
            message: "Fique atento ao topo do painel. Se um ninja estiver registrado em duas organizações ao mesmo tempo, um alerta amarelo aparecerá aqui.",
            target: "main",
            navigate: "dashboard"
        }
    ],

    // --- SETE LÂMINAS (Líder) ---
    'leader_sete-laminas': [
        { title: "Liderança dos Espadachins", message: "Você comanda a elite dos Sete Espadachins da Névoa.", target: "header", navigate: "sete-laminas" },
        { title: "Gestão das Espadas", message: "Defina quem porta cada espada lendária e gerencie a hierarquia.", target: "table", navigate: "sete-laminas" },
        { title: "Atividade", message: "Acompanhe a coluna 'Atividade' para ver se seus membros estão ativos no Discord.", target: "table th:nth-child(5)", navigate: "sete-laminas" },
        { title: "Recrutamento", message: "Use o botão 'Adicionar Novo Membro' para registrar novos portadores.", target: "button:has(svg.lucide-user-plus)", navigate: "sete-laminas" },
        { title: "Edição de Ficha", message: "Clique em qualquer membro para editar nível, atributos e maestrias.", target: "table tbody tr:first-child", navigate: "sete-laminas" }
    ],
    'member_sete-laminas': [
        { title: "Espadachim da Névoa", message: "Bem-vindo à organização mais letal da vila.", target: "header", navigate: "sete-laminas" },
        { title: "Sua Espada", message: "Verifique seu status, maestrias e qual espada você empunha na lista de membros.", target: "table", navigate: "sete-laminas" }
    ],

    // --- DIVISÃO ESPECIAL / ANBU (Líder) ---
    'leader_divisao-especial': [
        { title: "Comandante ANBU", message: "Você lidera as operações secretas da vila.", target: "header", navigate: "divisao-especial" },
        { title: "Gestão de Identidades", message: "Certifique-se de que todos os seus agentes tenham um codinome registrado.", target: "table", navigate: "divisao-especial" },
        { title: "Hierarquia", message: "Organize seus agentes entre Recrutas, Agentes e Capitães.", target: "table th:nth-child(3)", navigate: "divisao-especial" },
        { title: "Atividade", message: "Verifique a frequência dos seus agentes nas missões.", target: "table th:nth-child(6)", navigate: "divisao-especial" },
        { title: "Gerenciar Agentes", message: "Clique em um agente para editar sua ficha e codinome.", target: "table tbody tr:first-child", navigate: "divisao-especial" }
    ],
    'member_divisao-especial': [
        { title: "Agente ANBU", message: "Bem-vindo às sombras.", target: "header", navigate: "divisao-especial" },
        { title: "Identidade", message: "Seu codinome e rank estão listados aqui.", target: "table", navigate: "divisao-especial" }
    ],

    // --- FORÇA POLICIAL (Líder) ---
    'leader_forca-policial': [
        { title: "Chefe de Polícia", message: "Você é responsável pela ordem na vila.", target: "header", navigate: "forca-policial" },
        { title: "Cadeia de Comando", message: "Gerencie a hierarquia militar, de Cadetes a Coronéis.", target: "table", navigate: "forca-policial" },
        { title: "Patentes", message: "Atribua a Patente correta no campo 'Cargo Nin Online'.", target: "table tbody tr:first-child", navigate: "forca-policial" },
        { title: "Novo Oficial", message: "Registre novos oficiais aqui.", target: "button:has(svg.lucide-user-plus)", navigate: "forca-policial" }
    ],
    'member_forca-policial': [
        { title: "Oficial da Lei", message: "Bem-vindo à Força Policial. Servir e proteger.", target: "header", navigate: "forca-policial" },
        { title: "Patente", message: "Sua patente atual e status de atividade podem ser vistos nesta lista.", target: "table", navigate: "forca-policial" }
    ],

    // --- UNIDADE MÉDICA (Líder) ---
    'leader_unidade-medica': [
        { title: "Diretor Médico", message: "Você gerencia a saúde da vila.", target: "header", navigate: "unidade-medica" },
        { title: "Corpo Clínico", message: "Organize médicos e especialistas.", target: "table", navigate: "unidade-medica" },
        { title: "Especialidades", message: "Na ficha de cada médico, marque as 'Maestrias' de cura.", target: "table tbody tr:first-child", navigate: "unidade-medica" },
        { title: "Carreira", message: "Promova estagiários para médicos e doutores.", target: "table", navigate: "unidade-medica" }
    ],
    'member_unidade-medica': [
        { title: "Médico Ninja", message: "Bem-vindo à Unidade Médica.", target: "header", navigate: "unidade-medica" },
        { title: "Especialização", message: "Confira seu nível de especialização e status na lista da equipe.", target: "table", navigate: "unidade-medica" }
    ],
    
    // --- VISITANTE / PADRÃO ---
    'visitor': [
        { 
            title: "Bem-vindo ao Painel Ninja", 
            message: "Este sistema é usado para gerenciar sua ficha e status na Vila da Névoa.", 
            target: "header", 
            navigate: "dashboard" 
        },
        { 
            title: "Suas Informações", 
            message: "No topo da tela, você vê seu nome e seus cargos atuais. Se algo estiver errado, contate um administrador.", 
            target: "header .flex-col", 
            navigate: "dashboard" 
        },
        { 
            title: "Consultar Organizações", 
            message: "Clique em uma organização para ver a lista de membros e líderes.", 
            target: ".dashboard-grid", 
            navigate: "dashboard" 
        }
    ]
};
