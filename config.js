import { 
    Swords, Shield, Activity, Ghost, Users, UserPlus, Trash2, 
    Save, RefreshCw, AlertCircle, Menu, LogOut, Search, Settings, X, 
    AlertTriangle, Crown, ArrowUp, ArrowDown, ArrowUpDown,
    Heart, Zap, Flame, Droplets, Mountain, Wind, CloudLightning, 
    Cross, Target, Circle, Calendar, Info, Lock, Database, Clock, MessageSquare, Mic, ShieldCheck, UserCog,
    BookOpen, ChevronDown, ChevronUp, FileText, History, Globe, Star
} from 'lucide-react';

export const firebaseConfig = {
    apiKey: "AIzaSyBtpZZaQElw7ieRgXaD3wJ_7EyNwEB9RVo",
    authDomain: "nevoasystem.firebaseapp.com",
    projectId: "nevoasystem",
    storageBucket: "nevoasystem.firebasestorage.app",
    messagingSenderId: "887482895210",
    appId: "1:887482895210:web:1177bbc7fe859d1db37313",
    measurementId: "G-545J0LDVTY"
};

export const DISCORD_CLIENT_ID = "1453817939265589452"; 
export const GUILD_ID = "1410456333391761462";

export const Icons = { Swords, Shield, Activity, Ghost, Users, UserPlus, Trash2, Save, RefreshCw, AlertCircle, Menu, LogOut, Lock, Search, Settings, X, Info, AlertTriangle, Crown, ArrowUp, ArrowDown, ArrowUpDown, Heart, Zap, Flame, Droplets, Mountain, Wind, CloudLightning, Cross, Target, Circle, Calendar, Database, Clock, MessageSquare, Mic, ShieldCheck, UserCog, BookOpen, ChevronDown, ChevronUp, FileText, History, Globe, Star };

export const STATS = ['Força', 'Fortitude', 'Intelecto', 'Agilidade', 'Chakra'];

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
        internalRoles: ['Cadete', 'Oficial', 'Sargento', 'Delegado'],
        roleDetails: [
            { name: 'Delegado', desc: 'Chefe da força policial e responsável pela ordem.' },
            { name: 'Sargento', desc: 'Oficial superior responsável por coordenar patrulhas.' },
            { name: 'Oficial', desc: 'Policial padrão com autoridade de prisão.' },
            { name: 'Cadete', desc: 'Membro em treinamento na academia.' }
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
        internalRoles: [
            'Estagiário', 'Médico de Campo', 'Médico Júnior', 'Médico Sênior', 
            'Paramédico', 'Doutor', 'Residente Chefe', 'Diretor Médico'
        ],
        roleDetails: [
            { name: 'Diretor Médico', desc: 'Líder Supremo da Unidade Médica.' },
            { name: 'Residente Chefe', desc: 'Vice-líder, braço direito do Diretor.' },
            { name: 'Doutor', desc: 'Médico com funções administrativas e liderança clínica.' },
            { name: 'Paramédico', desc: 'Elite da Corporação, formam grupos de resposta rápida.' },
            { name: 'Médico Sênior', desc: 'Médicos experientes com Chakra, podem ministrar treinamentos.' },
            { name: 'Médico Júnior', desc: 'Médicos que utilizam Chakra para cura.' },
            { name: 'Médico de Campo', desc: 'Médicos focados em primeiros socorros (sem Chakra).' },
            { name: 'Estagiário', desc: 'Vaga rotativa para aprendizado.' }
        ]
    }
};
