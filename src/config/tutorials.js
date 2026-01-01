export const TUTORIALS = {
    // --- ADMINISTRAÇÃO GLOBAL ---
    mizukami: {
        roleName: "Mizukami (Líder Supremo)",
        description: "Como líder da vila, você possui autoridade para supervisionar todas as forças militares e médicas.",
        sections: [
            {
                title: "Painel do Mizukami",
                content: "Este painel é o centro nervoso da Vila Oculta da Névoa. Aqui você tem controle total sobre todas as organizações e hierarquias."
            },
            {
                title: "Gestão das Organizações",
                content: "Você tem acesso livre para entrar em qualquer organização (clicando nos cards) e gerenciar membros, promover líderes ou ajustar fichas."
            },
            {
                title: "Monitoramento de Segurança",
                content: "Acesse a aba 'Monitoramento' para auditar quem entrou no painel e verificar o log de alterações feitas por seus subordinados."
            }
        ]
    },

    council: {
        roleName: "Conselheiro",
        description: "Como membro do Conselho, você auxilia o Mizukami na administração e fiscalização da vila.",
        sections: [
            {
                title: "Acesso do Conselho",
                content: "Bem-vindo, Conselheiro. Você tem permissão para auditar e editar membros de todas as organizações da vila."
            },
            {
                title: "Supervisão",
                content: "Navegue pelas organizações clicando nos cards para verificar o cumprimento das regras e hierarquias."
            }
        ]
    },

    // --- LÍDERES ---
    'leader_sete-laminas': {
        roleName: "Líder dos Sete Espadachins",
        description: "Comandante da elite dos Espadachins da Névoa.",
        sections: [
            { title: "Liderança dos Espadachins", content: "Você comanda os Sete Espadachins da Névoa." },
            { title: "Gestão de Membros", content: "Use a tabela para verificar quem porta cada espada e atualizar seus status." },
            { title: "Adicionar Membro", content: "Clique no botão de adicionar para registrar novos portadores ou aspirantes." }
        ]
    },
    'leader_divisao-especial': {
        roleName: "Comandante da ANBU",
        description: "Líder das operações secretas e táticas.",
        sections: [
            { title: "Comandante ANBU", content: "Lidere as operações secretas da vila com eficiência." },
            { title: "Identidades Secretas", content: "Garanta que todos os agentes tenham seus codinomes registrados na tabela." },
            { title: "Novo Agente", content: "Recrute novos membros para a divisão através do botão de adicionar." }
        ]
    },
    'leader_forca-policial': {
        roleName: "Chefe de Polícia",
        description: "Responsável pela ordem pública e cumprimento das leis.",
        sections: [
            { title: "Chefe de Polícia", content: "Mantenha a ordem na vila gerenciando a Força Policial." },
            { title: "Hierarquia Militar", content: "Organize seus oficiais por patente e monitore sua atividade." },
            { title: "Registrar Oficial", content: "Adicione novos membros à corporação através do botão de adicionar." }
        ]
    },
    'leader_unidade-medica': {
        roleName: "Diretor Médico",
        description: "Gestor do hospital e da saúde pública.",
        sections: [
            { title: "Diretor Médico", content: "Gerencie o hospital e a equipe médica da vila." },
            { title: "Corpo Clínico", content: "Acompanhe a especialização e carreira dos seus médicos." },
            { title: "Nova Contratação", content: "Adicione médicos e estagiários à sua equipe através do botão de adicionar." }
        ]
    },

    // --- MEMBROS ---
    'member_sete-laminas': {
        roleName: "Espadachim da Névoa",
        description: "Membro da elite dos Espadachins da Névoa.",
        sections: [
            { title: "Espadachim", content: "Bem-vindo à elite. Acompanhe seu status na organização." },
            { title: "Sua Ficha", content: "Encontre seu nome na lista para ver seus atributos e maestrias." }
        ]
    },
    'member_divisao-especial': {
        roleName: "Agente ANBU",
        description: "Agente das operações secretas.",
        sections: [
            { title: "Agente", content: "Bem-vindo às sombras. Mantenha sua identidade e status atualizados." },
            { title: "Seu Registro", content: "Verifique seu codinome e rank na tabela operacional." }
        ]
    },
    'member_forca-policial': {
        roleName: "Oficial da Lei",
        description: "Membro da Força Policial.",
        sections: [
            { title: "Oficial", content: "Bem-vindo à Força Policial. Servir e proteger." },
            { title: "Sua Patente", content: "Confira sua patente e atividade recente na lista de oficiais." }
        ]
    },
    'member_unidade-medica': {
        roleName: "Médico Ninja",
        description: "Membro da Unidade Médica.",
        sections: [
            { title: "Médico Ninja", content: "Bem-vindo à Unidade Médica. Sua cura é essencial." },
            { title: "Seu Status", content: "Verifique seu nível e especializações na tabela da equipe." }
        ]
    },
    
    // --- VISITANTE / PADRÃO ---
    'visitor': {
        roleName: "Visitante",
        description: "Usuário sem organização vinculada.",
        sections: [
            { title: "Bem-vindo", content: "Este é o painel da Vila Oculta da Névoa. Aguarde um líder adicioná-lo." },
            { title: "Organizações", content: "Você pode visualizar a estrutura das organizações clicando nos cards." }
        ]
    }
};
