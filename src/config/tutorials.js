export const TUTORIALS = {
    // 1. Visitante / Membro Comum
    member: [
        {
            title: "Bem-vindo à Névoa!",
            message: "Este é o painel de gestão da Vila. Aqui você pode acompanhar o status das organizações e seus membros.",
            target: "header"
        },
        {
            title: "Organizações",
            message: "Clique em uma organização para ver a lista de membros, hierarquia e status de atividade.",
            target: ".dashboard-grid"
        },
        {
            title: "Seu Perfil",
            message: "Aqui você vê seu status atual. Se precisar atualizar seus pontos ou cargo, fale com o líder da sua organização.",
            target: ".user-status-pill"
        }
    ],

    // 2. Líder de Organização
    leader: [
        {
            title: "Painel de Liderança",
            message: "Como líder, você tem ferramentas extras para gerenciar sua organização.",
            target: "header"
        },
        {
            title: "Adicionar Membros",
            message: "Dentro da página da sua organização, você verá um botão 'Adicionar Novo Membro'. Use-o para registrar novos ninjas.",
            target: ".dashboard-grid"
        },
        {
            title: "Editar Dados",
            message: "Clique em qualquer membro da sua organização na lista para editar seus atributos, maestrias e nível.",
            target: ".dashboard-grid" // Genérico pois a tabela não está visível no início
        },
        {
            title: "Promover/Rebaixar",
            message: "Você pode alterar a liderança clicando no ícone de coroa na lista de membros.",
            target: ".dashboard-grid"
        }
    ],

    // 3. Conselho (Admin Global Moderado)
    council: [
        {
            title: "Acesso do Conselho",
            message: "Você tem permissão para gerenciar membros de TODAS as organizações da vila.",
            target: "header"
        },
        {
            title: "Visão Geral",
            message: "Fique atento aos alertas de conflito (membros em múltiplas orgs) que aparecerão aqui no topo.",
            target: ".dashboard-grid"
        },
        {
            title: "Monitoramento",
            message: "Use o botão de Monitoramento para ver quem acessou o painel e o que foi alterado recentemente.",
            target: "button[title='Monitoramento Integrado']" // Seletor específico
        }
    ],

    // 4. Mizukami (Admin Supremo / Criador)
    mizukami: [
        {
            title: "Saudações, Mizukami",
            message: "Você tem controle total sobre o sistema. Use-o com sabedoria.",
            target: "header"
        },
        {
            title: "Configurações do Sistema",
            message: "Acesse as engrenagens para configurar quais cargos do Discord correspondem a cada função no painel.",
            target: "button:has(svg.lucide-settings)" // Seletor avançado para o ícone de engrenagem
        },
        {
            title: "Segurança",
            message: "Nas configurações, você também define quem faz parte do Conselho e quem são os VIPs.",
            target: "header"
        },
        {
            title: "Monitoramento Total",
            message: "Acompanhe todas as ações e acessos em tempo real através do menu de Monitoramento.",
            target: "button[title='Monitoramento Integrado']"
        }
    ]
};
