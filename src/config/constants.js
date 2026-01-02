import { 
    Swords, Shield, Activity, Ghost, Users, UserPlus, Trash2, 
    Save, RefreshCw, AlertCircle, Menu, LogOut, Search, Settings, X, 
    AlertTriangle, Crown, ArrowUp, ArrowDown, ArrowUpDown, ArrowLeft,
    Heart, Zap, Flame, Droplets, Mountain, Wind, CloudLightning, 
    Cross, Target, Circle, Calendar, Info, Lock, Database, Clock, 
    MessageSquare, Mic, ShieldCheck, UserCog, BookOpen, ChevronDown, 
    ChevronUp, FileText, History, Globe, Star, RotateCcw, VenetianMask, User
} from 'lucide-react';

export const STATS = ['Força', 'Fortitude', 'Intelecto', 'Agilidade', 'Chakra'];

// Objeto com todos os ícones para facilitar o uso dinâmico
export const Icons = { 
    Swords, Shield, Activity, Ghost, Users, UserPlus, Trash2, Save, RefreshCw, AlertCircle, 
    Menu, LogOut, Lock, Search, Settings, X, Info, AlertTriangle, Crown, ArrowUp, ArrowDown, 
    ArrowUpDown, ArrowLeft, Heart, Zap, Flame, Droplets, Mountain, Wind, CloudLightning, 
    Cross, Target, Circle, Calendar, Database, Clock, MessageSquare, Mic, ShieldCheck, 
    UserCog, BookOpen, ChevronDown, ChevronUp, FileText, History, Globe, Star, RotateCcw, 
    VenetianMask, User
};

export const MASTERIES = [
    { id: 'Fogo', icon: Flame, color: 'text-orange-500' },
    { id: 'Água', icon: Droplets, color: 'text-blue-500' },
    { id: 'Terra', icon: Mountain, color: 'text-amber-700' },
    { id: 'Vento', icon: Wind, color: 'text-slate-400' },
    { id: 'Raio', icon: CloudLightning, color: 'text-yellow-400' },
    { id: 'Médico', icon: Cross, color: 'text-emerald-400' },
    { id: 'Taijutsu', icon: Activity, color: 'text-red-500' },
    { id: 'Arma', icon: Target, color: 'text-gray-300' },
    { id: 'Bolha', icon: Circle, color: 'text-cyan-300' }
];

export const ORG_CONFIG = {
    // --- CLÃS INDIVIDUAIS ---
    'cla-yagyu': { 
        id: 'cla-yagyu', 
        name: 'Clã Yagyu', 
        icon: 'Crown', 
        color: 'text-amber-400', 
        bgColor: 'bg-amber-900/20', 
        border: 'border-amber-500/30', 
        limit: 1, 
        internalRoles: ['Líder Yagyu'],
        roleDetails: [
            { name: 'Líder Yagyu', desc: 'Sobreviventes de guerra que se tornaram senhores feudais com riqueza para treinar ninjas poderosos rapidamente.' }
        ]
    },
    'cla-murasame': { 
        id: 'cla-murasame', 
        name: 'Clã Murasame', 
        icon: 'Crown', 
        color: 'text-slate-400', 
        bgColor: 'bg-slate-800/20', 
        border: 'border-slate-500/30', 
        limit: 1, 
        internalRoles: ['Líder Murasame'],
        roleDetails: [
            { name: 'Líder Murasame', desc: 'Família de ferreiros forçada à guerra que superou a ocasião e encontrou sua verdadeira vocação ninja.' }
        ]
    },
    'cla-hoshi': { 
        id: 'cla-hoshi', 
        name: 'Clã Hoshi', 
        icon: 'Star', 
        color: 'text-yellow-400', 
        bgColor: 'bg-yellow-900/20', 
        border: 'border-yellow-500/30', 
        limit: 1, 
        internalRoles: ['Líder Hoshi'],
        roleDetails: [
            { name: 'Líder Hoshi', desc: 'Antiga família cujas habilidades sugerem serem descendentes de seres que habitam as estrelas.' }
        ]
    },
    'cla-kazuki': { 
        id: 'cla-kazuki', 
        name: 'Clã Kazuki', 
        icon: 'Shield', 
        color: 'text-emerald-400', 
        bgColor: 'bg-emerald-900/20', 
        border: 'border-emerald-500/30', 
        limit: 1, 
        internalRoles: ['Líder Kazuki'],
        roleDetails: [
            { name: 'Líder Kazuki', desc: 'Leais e tradicionais, seguem as regras rigidamente, mesmo que isso signifique derramamento de sangue.' }
        ]
    },
    'cla-sakame': { 
        id: 'cla-sakame', 
        name: 'Clã Sakame', 
        icon: 'Target', 
        color: 'text-red-400', 
        bgColor: 'bg-red-900/20', 
        border: 'border-red-500/30', 
        limit: 1, 
        internalRoles: ['Líder Sakame'],
        roleDetails: [
            { name: 'Líder Sakame', desc: 'Famosos por treinar ninjas desde uma idade extremamente jovem, prática questionada por outros.' }
        ]
    },

    // --- PROMOÇÕES ---
    'promocoes': { 
        id: 'promocoes', 
        name: 'Promoções & Patentes', 
        icon: 'Medal', 
        color: 'text-pink-400', 
        bgColor: 'bg-pink-900/20', 
        border: 'border-pink-500/30', 
        limit: 50, 
        internalRoles: [
            'Genin', 
            'Chunin', 
            'Tokubetsu Jonin', // Jonin Special
            'Jonin'
        ],
        roleDetails: [
            { name: 'Jonin', desc: 'Elite ninja de nível superior.' },
            { name: 'Tokubetsu Jonin', desc: 'Jonin Especial com habilidades táticas específicas.' },
            { name: 'Chunin', desc: 'Líder de esquadrão qualificado.' },
            { name: 'Genin', desc: 'Ninja graduado, nível básico.' }
        ]
    },

    // --- ORGANIZAÇÕES PADRÃO ---
    'sete-laminas': { 
        id: 'sete-laminas', 
        name: 'Sete Lâminas', 
        icon: 'Swords', 
        color: 'text-red-400', 
        bgColor: 'bg-red-900/20', 
        border: 'border-red-500/30', 
        limit: 7, 
        internalRoles: [
            'Lâmina Lança de Chakra (Himarakei)',
            'Lâmina Rompedora de Armadura (Kabutowari)',
            'Lâmina Pele de Escama (Samehada)',
            'Lâminas do Trovão (Kiba)',
            'Lâmina Agulha (Nuibari)',
            'Lâmina Explosiva (Shibuki)',
            'Lâmina Decapitadora (Kubikiribocho)'
        ],
        roleDetails: [
            { name: 'Lâmina Lança de Chakra (Himarakei)', desc: 'Espada Lendária da Névoa.' },
            { name: 'Lâmina Rompedora de Armadura (Kabutowari)', desc: 'Espada Lendária da Névoa.' },
            { name: 'Lâmina Pele de Escama (Samehada)', desc: 'Espada Lendária da Névoa.' },
            { name: 'Lâminas do Trovão (Kiba)', desc: 'Espada Lendária da Névoa.' },
            { name: 'Lâmina Agulha (Nuibari)', desc: 'Espada Lendária da Névoa.' },
            { name: 'Lâmina Explosiva (Shibuki)', desc: 'Espada Lendária da Névoa.' },
            { name: 'Lâmina Decapitadora (Kubikiribocho)', desc: 'Espada Lendária da Névoa.' }
        ]
    },
    'divisao-especial': { 
        id: 'divisao-especial', 
        name: 'Divisão Especial (ANBU)', 
        icon: 'Ghost', 
        color: 'text-purple-400', 
        bgColor: 'bg-purple-900/20', 
        border: 'border-purple-500/30', 
        limit: 14, 
        internalRoles: ['Membro', 'Vice-Líder', 'Líder'],
        roleDetails: [
            { name: 'Líder', desc: 'Comandante supremo das operações especiais.' },
            { name: 'Vice-Líder', desc: 'Segundo em comando, auxilia na coordenação.' },
            { name: 'Membro', desc: 'Agente operacional da ANBU.' }
        ]
    },
    'forca-policial': { 
        id: 'forca-policial', 
        name: 'Força Policial', 
        icon: 'Shield', 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-900/20', 
        border: 'border-blue-500/30', 
        limit: 20, 
        internalRoles: ['Oficial', 'Investigador', 'Tenente', 'Capitão', 'Coronel', 'Subchefe', 'Chefe'],
        roleDetails: [
            { name: 'Chefe', desc: 'Líder supremo da Força Policial.' },
            { name: 'Subchefe', desc: 'Segundo em comando.' },
            { name: 'Coronel', desc: 'Comandante de alto escalão.' },
            { name: 'Capitão', desc: 'Líder de companhias.' },
            { name: 'Tenente', desc: 'Oficial superior de campo.' },
            { name: 'Investigador', desc: 'Especialista em investigações.' },
            { name: 'Oficial', desc: 'Patrulheiro padrão.' }
        ]
    },
    'unidade-medica': { 
        id: 'unidade-medica', 
        name: 'Unidade Médica', 
        icon: 'Activity', 
        color: 'text-emerald-400', 
        bgColor: 'bg-emerald-900/20', 
        border: 'border-emerald-500/30', 
        limit: 20, 
        internalRoles: ['Estagiário', 'Médico de Campo', 'Médico Júnior', 'Médico Sênior', 'Paramédico', 'Doutor', 'Residente Chefe', 'Diretor Médico'],
        roleDetails: [
            { name: 'Diretor Médico', desc: 'Líder Supremo.' },
            { name: 'Residente Chefe', desc: 'Vice-líder.' },
            { name: 'Doutor', desc: 'Líder clínico.' },
            { name: 'Paramédico', desc: 'Elite de resposta rápida.' },
            { name: 'Médico Sênior', desc: 'Experiente com Chakra.' },
            { name: 'Médico Júnior', desc: 'Cura com Chakra.' },
            { name: 'Médico de Campo', desc: 'Primeiros socorros.' },
            { name: 'Estagiário', desc: 'Aprendiz.' }
        ]
    }
};
