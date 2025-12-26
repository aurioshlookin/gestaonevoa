import { STATS } from '../config/constants';

// Formata data para o padrão brasileiro (DD/MM/AAAA)
export const formatDate = (dateString) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// Formata data e hora completa
export const formatDateTime = (isoString) => {
    if (!isoString) return "Nunca";
    const date = new Date(isoString);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
};

// Calcula os pontos máximos de atributos baseado no nível
export const calculateMaxPoints = (level) => {
    if (level <= 1) return 0; 
    let points = 0;
    const levelsTo50 = Math.min(level, 50) - 1;
    points += levelsTo50 * 5;
    if (level > 50) {
        points += (level - 50) * 4;
    }
    return points;
};

// Calcula os status finais (Vida e Chakra) com base nos atributos
export const calculateStats = (baseStats, hasBonus) => {
    const stats = { ...baseStats };
    const bonusMultiplier = hasBonus ? 1.10 : 1;
    
    let calculated = {};
    STATS.forEach(key => {
        calculated[key] = Math.floor(stats[key] * bonusMultiplier);
    });

    const fortitudeExtra = Math.max(0, calculated['Fortitude'] - 5);
    const hp = 250 + (fortitudeExtra * 8);

    const chakraExtra = Math.max(0, calculated['Chakra'] - 5);
    const cp = 50 + (chakraExtra * 5);

    return { ...calculated, hp, cp };
};

// Calcula estatísticas de atividade (Mensagens, Voz, Tiers)
export const getActivityStats = (member) => {
    // Garante que os objetos existam para evitar erro
    const activityMap = member.activityStats || {};
    const msgMap = member.dailyMessages || {};
    const voiceMap = member.dailyVoice || {};

    let totalScore = 0;
    let totalMsgs = 0;
    let totalVoiceMins = 0;

    // Soma os últimos 14 dias
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        totalScore += (activityMap[dateStr] || 0);
        totalMsgs += (msgMap[dateStr] || 0);
        totalVoiceMins += (voiceMap[dateStr] || 0);
    }

    // Fallback para dados antigos (antes da separação de msg/voz)
    if (totalMsgs === 0 && totalVoiceMins === 0 && totalScore > 0) {
        totalMsgs = totalScore; 
    }

    // Define o Tier (Cor e Ícone)
    let tier = 'Fantasma', color = 'text-red-500', icon = '👻', width = '5%';
    if (totalScore > 250) { tier = 'Lendário'; color = 'text-purple-500'; icon = '👑'; width = '100%'; }
    else if (totalScore > 50) { tier = 'Ativo'; color = 'text-emerald-500'; icon = '🔥'; width = '75%'; }
    else if (totalScore > 10) { tier = 'Regular'; color = 'text-blue-500'; icon = '😐'; width = '50%'; }
    else if (totalScore > 0) { tier = 'Adormecido'; color = 'text-yellow-500'; icon = '💤'; width = '25%'; }
    
    // Formata string de tempo de voz
    const voiceHours = Math.floor(totalVoiceMins / 60);
    const voiceRemMins = totalVoiceMins % 60;
    const voiceString = `${voiceHours}h ${voiceRemMins}m`;

    return { 
        total: totalScore, 
        tier, color, icon, width,
        details: { msgs: totalMsgs, voice: voiceString }
    };
};
