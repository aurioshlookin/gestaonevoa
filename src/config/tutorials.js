export const TUTORIALS = {
    // --- ADMINISTRAÇÃO GLOBAL ---
    mizukami: {
        roleName: "Mizukami (Líder Supremo)",
        description: "Como Mizukami, você possui autoridade absoluta sobre o sistema de gestão da Vila Oculta da Névoa.",
        sections: [
            {
                title: "💎 Visão Geral & Painel",
                content: "Na tela inicial (Dashboard), você visualiza a lotação de todas as organizações em tempo real. Os cards mostram a contagem de membros ativos versus o limite permitido. Alertas visuais indicarão conflitos, como ninjas registrados em múltiplas organizações indevidamente."
            },
            {
                title: "🛠️ Gestão Irrestrita",
                content: "Você tem permissão de edição em TODAS as organizações. Ao clicar em qualquer card (Sete Lâminas, ANBU, etc.), você pode: \n• Adicionar novos membros.\n• Editar fichas completas (Nível, Atributos, Maestrias).\n• Promover ou rebaixar líderes (ícone de Coroa).\n• Remover membros (ícone de Lixeira)."
            },
            {
                title: "👁️ Monitoramento de Segurança",
                content: "Acesso exclusivo ao botão 'Monitoramento'. Lá você encontra um registro detalhado de:\n• Quem acessou o painel e quando.\n• Log de Auditoria: Todas as alterações feitas por líderes ou conselheiros (quem editou quem, mudanças de atributos, etc.). Use isso para manter a ordem."
            },
            {
                title: "⚙️ Configurações do Sistema",
                content: "Acesso exclusivo ao botão de 'Configurações' (Engrenagem). É lá que você define as regras do jogo: quais cargos do Discord correspondem a Líderes, Membros e Oficiais no painel. Sem essa configuração, o sistema não reconhece os cargos automaticamente."
            }
        ]
    },

    council: {
        roleName: "Conselheiro",
        description: "Como membro do Conselho, seu dever é fiscalizar e auxiliar na administração das forças da vila.",
        sections: [
            {
                title: "🛡️ Supervisão Global",
                content: "Você possui acesso de visualização e edição em todas as organizações da vila. Seu papel é garantir que as fichas estejam atualizadas e que as regras de hierarquia sejam respeitadas."
            },
            {
                title: "📝 Auditoria de Fichas",
                content: "Você pode entrar em qualquer organização e abrir a ficha de qualquer ninja. Verifique se os Atributos (Força, Chakra, etc.) e Níveis correspondem à realidade do RPG. Se encontrar erros, você tem permissão para corrigi-los imediatamente."
            },
            {
                title: "⚠️ Resolução de Conflitos",
                content: "Fique atento a avisos de 'Conflito de Organização' no topo do painel. Isso ocorre quando um ninja tem cargos de duas orgs diferentes no Discord. Você deve investigar e remover o registro incorreto no painel."
            }
        ]
    },

    // --- LÍDERES ---
    leader: { // Genérico para líderes se não especificado
        roleName: "Líder de Organização",
        description: "Você é o responsável direto pela gestão, recrutamento e ordem da sua organização.",
        sections: [
            {
                title: "👥 Gestão de Membros",
                content: "No card da sua organização, você tem controle total. Mantenha a lista de membros atualizada. Se alguém sair do RPG ou for expulso, remova-o do painel imediatamente para liberar vaga."
            },
            {
                title: "➕ Recrutamento",
                content: "Use o botão 'Adicionar Novo Membro' para registrar recrutas. É vital vincular corretamente a conta do Discord para que o sistema de monitoramento de atividade funcione."
            },
            {
                title: "📊 Edição de Fichas",
                content: "É seu dever manter as fichas atualizadas. Ao promover um membro no RPG, atualize seu Nível e Cargo Nin aqui no painel. Você também define as Maestrias (elementos e especializações) de cada subordinado."
            },
            {
                title: "👑 Hierarquia",
                content: "Use o botão de Coroa na tabela para designar Vice-Líderes ou outros cargos de comando dentro da sua organização, se a estrutura permitir."
            }
        ]
    },

    // Tutoriais Específicos por Org (Opcional, mas bom ter fallbacks detalhados)
    'leader_sete-laminas': {
        roleName: "Líder dos Sete Espadachins",
        description: "Comandante da elite dos Espadachins da Névoa.",
        sections: [
            { title: "⚔️ Gestão das Espadas", content: "Sua prioridade é definir quem porta qual das 7 Espadas Lendárias. Na edição de membro, selecione a espada correta no campo 'Cargo Nin'. Isso organiza a tabela automaticamente." },
            { title: "📈 Atributos", content: "Verifique se os portadores possuem os atributos mínimos para empunhar suas espadas." },
            { title: "🚫 Inatividade", content: "Acompanhe a coluna 'Atividade'. Um Espadachim inativo enfraquece a vila. Substitua membros 'Fantasmas' se necessário." }
        ]
    },
    'leader_divisao-especial': {
        roleName: "Comandante da ANBU",
        description: "Líder das operações secretas e táticas.",
        sections: [
            { title: "🎭 Identidades Secretas", content: "A ANBU preza pelo sigilo. Ao cadastrar um agente, é OBRIGATÓRIO preencher o campo 'Codinome'. Na tabela pública, o codinome terá destaque sobre o nome real." },
            { title: "Hierarquia Tática", content: "Organize seus membros entre Recrutas, Agentes e Capitães para definir a cadeia de comando das missões." }
        ]
    },
    'leader_forca-policial': {
        roleName: "Chefe de Polícia",
        description: "Responsável pela ordem pública e cumprimento das leis.",
        sections: [
            { title: "👮 Cadeia de Comando", content: "A Polícia Militar segue uma hierarquia rígida. Mantenha as patentes atualizadas (Cadete -> Oficial -> ... -> Coronel). A tabela respeita essa ordem automaticamente." },
            { title: "Efetivo", content: "Monitore o número de oficiais ativos. Uma força policial com baixo efetivo ou inativa compromete a segurança da vila." }
        ]
    },
    'leader_unidade-medica': {
        roleName: "Diretor Médico",
        description: "Gestor do hospital e da saúde pública.",
        sections: [
            { title: "🏥 Corpo Clínico", content: "Gerencie a carreira dos seus médicos, de Estagiários a Doutores." },
            { title: "💊 Especializações", content: "Na ficha dos médicos, use as 'Maestrias' para indicar especializações (ex: Ninjutsu Médico, Venenos). Isso ajuda a selecionar o médico certo para cada missão." }
        ]
    },

    // --- MEMBROS ---
    member: {
        roleName: "Ninja da Névoa",
        description: "Bem-vindo ao sistema de gestão. Aqui você acompanha seu registro oficial.",
        sections: [
            {
                title: "📜 Sua Ficha",
                content: "Acesse a organização à qual você pertence. Encontre seu nome na lista e clique para ver seus detalhes. Verifique se seu Nível, Atributos e Maestrias estão corretos."
            },
            {
                title: "✅ Atividade",
                content: "O sistema monitora sua participação no Discord (mensagens e voz). Mantenha-se ativo para não cair no rank de 'Fantasma' e correr risco de perder seu posto."
            },
            {
                title: "📞 Suporte",
                content: "Você não pode editar seus próprios dados por segurança. Se houver algo errado na sua ficha, entre em contato imediatamente com o seu Líder ou com um Conselheiro."
            }
        ]
    },

    // --- VISITANTE ---
    visitor: {
        roleName: "Visitante",
        description: "Você ainda não está vinculado a nenhuma organização oficial no painel.",
        sections: [
            {
                title: "🔍 Visualização",
                content: "Você pode navegar pelas organizações e ver quem são os membros e líderes atuais, mas não tem permissão para ver detalhes profundos ou editar."
            },
            {
                title: "👋 Como Entrar",
                content: "Se você já faz parte do RPG, peça ao seu Líder para adicionar sua conta ao painel. Assim que ele fizer isso, você terá acesso à sua ficha."
            }
        ]
    }
};
