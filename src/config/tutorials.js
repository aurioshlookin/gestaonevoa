export const TUTORIALS = {
    // 1. Visitante / Membro Comum
    member: [
        {
            title: "Bem-vindo à Névoa!",
            message: "Este é o painel de gestão da Vila. Aqui você pode acompanhar o status das organizações e seus membros.",
            target: "header",
            navigate: "dashboard" // Garante que comece no painel
        },
        {
            title: "Organizações",
            message: "Cada cubo representa uma organização. Clique para ver detalhes.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Detalhes da Organização",
            message: "Aqui dentro você vê a lista de membros, hierarquia e quem está ativo.",
            target: "table", // Alvo genérico da tabela
            navigate: "sete-laminas" // Leva o usuário para uma org de exemplo
        },
        {
            title: "Seu Perfil",
            message: "Seus dados ficam aqui no topo. Fale com seu líder para atualizações.",
            target: "header .user-profile", // Classe que adicionaremos no Header
            navigate: "dashboard"
        }
    ],

    // 2. Líder de Organização
    leader: [
        {
            title: "Painel de Liderança",
            message: "Como líder, você gerencia sua organização diretamente por aqui.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Sua Organização",
            message: "Acesse sua organização para ver as opções de gestão.",
            target: ".dashboard-grid",
            navigate: "sete-laminas" // Exemplo
        },
        {
            title: "Adicionar Membros",
            message: "Use este botão para registrar novos membros na sua equipe.",
            target: "button:has(svg.lucide-user-plus)", // Seletor do botão Add
            navigate: "sete-laminas"
        },
        {
            title: "Editar Membros",
            message: "Clique em qualquer membro na lista para editar atributos e maestrias.",
            target: "table tbody tr:first-child", // Primeiro membro da lista
            navigate: "sete-laminas"
        }
    ],

    // 3. Conselho (Admin Global Moderado)
    council: [
        {
            title: "Acesso do Conselho",
            message: "Você tem permissão para editar membros de TODAS as organizações.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Visão Global",
            message: "Você pode entrar em qualquer organização e realizar alterações, promoções ou remoções.",
            target: ".dashboard-grid",
            navigate: "dashboard"
        },
        {
            title: "Gestão",
            message: "Basta acessar a organização desejada. Você verá as ferramentas de edição disponíveis.",
            target: "table",
            navigate: "divisao-especial"
        }
    ],

    // 4. Mizukami (Admin Supremo / Criador)
    mizukami: [
        {
            title: "Saudações, Mizukami",
            message: "Você tem controle total sobre o sistema.",
            target: "header",
            navigate: "dashboard"
        },
        {
            title: "Configurações Globais",
            message: "Aqui você define os cargos do Discord que representam cada função no site.",
            target: "button[title='Configurações']",
            navigate: "dashboard"
        },
        {
            title: "Monitoramento",
            message: "Acompanhe acessos e alterações em tempo real nesta aba exclusiva.",
            target: "button[title='Monitoramento Integrado']",
            navigate: "access" // Leva para a aba de monitoramento
        }
    ]
};
