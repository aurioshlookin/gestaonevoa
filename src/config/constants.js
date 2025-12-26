import { 
    Flame, Droplets, Mountain, Wind, CloudLightning, 
    Cross, Activity, Target, Circle 
} from 'lucide-react';

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

// IDs do Discord para configuração
export const DISCORD_CONFIG = {
    CLIENT_ID: "1453817939265589452",
    GUILD_ID: "1410456333391761462"
};
