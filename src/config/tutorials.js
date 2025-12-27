export const TUTORIALS = {
    // --- ADMINISTRAÇÃO GLOBAL (Mizukami) ---
    mizukami: [
        {
            title: "Painel do Mizukami",
            message: "Bem-vindo, Líder Supremo. Este painel é o centro nervoso da Vila Oculta da Névoa. Aqui você tem controle total sobre todas as organizações, hierarquias e configurações do sistema.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Visão Geral das Forças",
            message: "Na tela inicial, você vê o status de todas as organizações: Sete Lâminas, ANBU, Polícia e Médicos. As barras coloridas indicam a lotação de cada grupo. Se uma organização estiver cheia ou sem cargos configurados, você verá alertas aqui.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Monitoramento em Tempo Real",
            message: "Esta é uma ferramenta crucial de segurança. Aqui você pode ver quem acessou o painel recentemente, quais páginas visitou e, mais importante, um log detalhado de todas as alterações feitas (quem editou quem, o que mudou nos atributos, promoções, etc.). Use isso para auditar as ações dos seus líderes.",
            target: "button[title='Monitoramento Integrado']", // Seletor específico
            navigate: "access"
        },
        {
            title: "Configurações do Sistema",
            message: "Aqui você define as 'Leis da Vila'. Você pode vincular quais Cargos do Discord correspondem a Líderes, Membros e Oficiais no painel. Também é aqui que você define quem faz parte do Conselho e quem são os Moderadores.",
            target: "button[title='Configurações']",
            navigate: "dashboard"
        },
        {
            title: "Gestão Irrestrita",
            message: "Ao entrar em qualquer organização, você terá poder total: editar fichas de personagens, alterar níveis, promover líderes, remover membros e ajustar maestrias. Nada está bloqueado para você.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        }
    ],

    // --- CONSELHO ---
    council: [
        {
            title: "Painel do Conselho",
            message: "Saudações, Conselheiro. Você possui autoridade para fiscalizar e intervir em todas as organizações da vila, garantindo que as regras sejam seguidas.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Acesso Global",
            message: "Diferente de um líder comum, você pode entrar em qualquer organização (Sete Lâminas, ANBU, etc.) e realizar alterações nas fichas dos membros se necessário.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Alertas de Conflito",
            message: "Fique atento ao topo do painel. Se um ninja estiver registrado em duas organizações ao mesmo tempo (ex: ANBU e Polícia), um alerta amarelo aparecerá aqui. Cabe a você resolver esses conflitos.",
            target: "main",
            navigate: "dashboard"
        },
        {
            title: "Auditoria de Fichas",
            message: "Ao acessar uma organização, verifique se os atributos e níveis dos membros estão condizentes. Você pode corrigir qualquer discrepância clicando no membro e editando seus dados.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        }
    ],

    // --- SETE LÂMINAS (Líder) ---
    'leader_sete-laminas': [
        { title: "Liderança dos Espadachins", message: "Você comanda a elite dos Sete Espadachins da Névoa. Sua responsabilidade é manter a tradição e a força das lâminas lendárias.", target: "header", navigate: "sete-laminas" },
        { title: "Gestão das Espadas", message: "Nesta tabela, você vê quem porta cada espada (Samehada, Kubikiribocho, etc.). Certifique-se de que cada membro esteja com o cargo correto (Rank Nin) correspondente à sua espada.", target: "table", navigate: "sete-laminas" },
        { title: "Atividade dos Membros", message: "Acompanhe a coluna 'Atividade'. O ícone e a barra mostram se o membro está ativo no Discord (mensagens e voz) nos últimos 14 dias. Membros inativos ('Fantasma') podem precisar ser substituídos.", target: "table th:nth-child(5)", navigate: "sete-laminas" },
        { title: "Recrutamento", message: "Use o botão 'Adicionar Novo Membro' para registrar um novo portador. Você precisará vincular a conta do Discord dele e definir seus atributos iniciais.", target: "button:has(svg.lucide-user-plus)", navigate: "sete-laminas" },
        { title: "Edição de Ficha", message: "Clique em qualquer membro na lista para abrir a ficha completa. Lá você pode atualizar Nível, Atributos (Força, Chakra, etc.) e definir quais Maestrias ele domina.", target: "table tbody tr:first-child", navigate: "sete-laminas" }
    ],

    // --- DIVISÃO ESPECIAL / ANBU (Líder) ---
    'leader_divisao-especial': [
        { title: "Comandante ANBU", message: "Você lidera as operações secretas. A discrição e a eficiência são suas maiores armas.", target: "header", navigate: "divisao-especial" },
        { title: "Gestão de Identidades", message: "A ANBU utiliza Codinomes. Na tabela, você verá uma coluna especial 'Codinome'. Certifique-se de que todos os seus agentes tenham um codinome registrado para proteger suas identidades reais.", target: "table", navigate: "divisao-especial" },
        { title: "Hierarquia Operacional", message: "Organize seus agentes entre Recrutas, Agentes e Capitães. Use a ordenação da tabela (clicando no título 'Nin') para ver sua estrutura de comando.", target: "table th:nth-child(3)", navigate: "divisao-especial" },
        { title: "Monitoramento de Atividade", message: "Verifique a frequência dos seus agentes. A coluna de atividade mostra quem está participando ativamente das missões (chat/voz) e quem está ausente.", target: "table th:nth-child(6)", navigate: "divisao-especial" },
        { title: "Gerenciar Agentes", message: "Clique em um agente para editar sua ficha. Não esqueça de preencher o campo 'Codinome' no formulário de edição.", target: "table tbody tr:first-child", navigate: "divisao-especial" }
    ],

    // --- FORÇA POLICIAL (Líder) ---
    'leader_forca-policial': [
        { title: "Chefe de Polícia", message: "Sua função é manter a ordem na vila. Você gerencia a hierarquia militar da Força Policial.", target: "header", navigate: "forca-policial" },
        { title: "Cadeia de Comando", message: "A Polícia segue uma hierarquia rígida (Cadete -> Oficial -> Sargento...). Use a tabela para visualizar claramente quem responde a quem.", target: "table", navigate: "forca-policial" },
        { title: "Patentes", message: "Ao editar um membro, certifique-se de atribuir a Patente correta no campo 'Cargo Nin Online'. Isso atualizará a posição dele na tabela automaticamente.", target: "table tbody tr:first-child", navigate: "forca-policial" },
        { title: "Controle de Efetivo", message: "O contador no topo (ex: 15/20) mostra quantos oficiais você tem e qual o limite da corporação. Mantenha o recrutamento ativo para não deixar a vila desprotegida.", target: "header span.text-2xl", navigate: "forca-policial" }
    ],

    // --- UNIDADE MÉDICA (Líder) ---
    'leader_unidade-medica': [
        { title: "Diretor Médico", message: "Você é responsável pela saúde da vila. Gerencie seus médicos e a distribuição de especialistas.", target: "header", navigate: "unidade-medica" },
        { title: "Especialidades", message: "Na ficha de cada médico (clique para abrir), você pode marcar as 'Maestrias'. Use isso para identificar quem é especialista em 'Médico' (Cura) ou outras áreas de suporte.", target: "table tbody tr:first-child", navigate: "unidade-medica" },
        { title: "Residência e Carreira", message: "Promova seus membros de Estagiários para Médicos e Doutores conforme eles evoluem. A hierarquia é vital para saber quem pode realizar cirurgias complexas.", target: "table", navigate: "unidade-medica" }
    ],
    
    // --- VISITANTE / MEMBRO PADRÃO ---
    'visitor': [
        { 
            title: "Bem-vindo ao Painel Ninja", 
            message: "Este sistema é usado para gerenciar sua ficha e status na Vila da Névoa. Mesmo não sendo líder, você pode usar o painel para consultas.", 
            target: "header", 
            navigate: "dashboard" 
        },
        { 
            title: "Suas Informações", 
            message: "No topo da tela, você vê seu nome e seus cargos atuais reconhecidos pelo sistema. Se algo estiver errado, contate um administrador.", 
            target: "header .flex-col", 
            navigate: "dashboard" 
        },
        { 
            title: "Consultar Organizações", 
            message: "Você pode clicar em qualquer organização para ver quem são os membros, quem são os líderes e a hierarquia atual.", 
            target: ".dashboard-grid", 
            navigate: "dashboard" 
        },
        { 
            title: "Verificar Sua Ficha", 
            message: "Dentro da lista da sua organização, procure seu nome. Você pode ver seus atributos, nível e atividade. (Você não pode editar, apenas visualizar).", 
            target: "main", 
            navigate: "dashboard" 
        }
    ]
};
