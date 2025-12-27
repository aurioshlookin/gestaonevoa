import { Swords, Shield, Activity, Ghost, Users, UserPlus, Trash2, Save, RefreshCw, AlertCircle, Menu, LogOut, Search, Settings, X, AlertTriangle, Crown, ArrowUp, ArrowDown, ArrowUpDown, ArrowLeft, Heart, Zap, Flame, Droplets, Mountain, Wind, CloudLightning, Cross, Target, Circle, Calendar, Info, Lock, Database, Clock, MessageSquare, Mic, ShieldCheck, UserCog, BookOpen, ChevronDown, ChevronUp, FileText, History, Globe, Star, RotateCcw, UserSecret } from 'lucide-react';

export const STATS = ['Força', 'Fortitude', 'Intelecto', 'Agilidade', 'Chakra'];

export const Icons = { 
    Swords, Shield, Activity, Ghost, Users, UserPlus, Trash2, Save, RefreshCw, AlertCircle, 
    Menu, LogOut, Lock, Search, Settings, X, Info, AlertTriangle, Crown, ArrowUp, ArrowDown, 
    ArrowUpDown, ArrowLeft, Heart, Zap, Flame, Droplets, Mountain, Wind, CloudLightning, 
    Cross, Target, Circle, Calendar, Database, Clock, MessageSquare, Mic, ShieldCheck, 
    UserCog, BookOpen, ChevronDown, ChevronUp, FileText, History, Globe, Star, RotateCcw, UserSecret 
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
        internalRoles: ['Recruta', 'Agente', 'Capitão', 'Comandante'],
        roleDetails: [
            { name: 'Comandante', desc: 'Líder das operações especiais.' },
            { name: 'Capitão', desc: 'Líder de esquadrão tático.' },
            { name: 'Agente', desc: 'Operativo de campo plenamente treinado.' },
            { name: 'Recruta', desc: 'Novo membro em fase de avaliação.' }
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
