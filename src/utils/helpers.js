import { STATS, ORG_CONFIG } from '../config/constants.js';

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

export const getActivityStats = (member) => {
    const activityMap = member.activityStats || {};
    const msgMap = member.dailyMessages || {};
    const voiceMap = member.dailyVoice || {};

    let totalScore = 0;
    let totalMsgs = 0;
    let totalVoiceMins = 0;

    // Calcula a data de corte (14 dias atrás)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Helper: Itera sobre as chaves existentes no banco em vez de tentar adivinhar a data.
    // Isso evita erros de Fuso Horário (UTC vs Local) que faziam a atividade aparecer zerada.
    const sumRecent = (map) => {
        let sum = 0;
        for (const [dateKey, value] of Object.entries(map)) {
            // Comparação de strings ISO (YYYY-MM-DD) funciona corretamente
            if (dateKey >= cutoffStr) {
                sum += Number(value) || 0; // Number() evita erro de "10" + "10" = "1010"
            }
        }
        return sum;
    };

    totalScore = sumRecent(activityMap);
    totalMsgs = sumRecent(msgMap);
    totalVoiceMins = sumRecent(voiceMap);

    // Fallback: Se não tiver contagem separada de msg/voz mas tiver score (dados antigos), usa score como msg
    if (totalMsgs === 0 && totalVoiceMins === 0 && totalScore > 0) {
        totalMsgs = totalScore; 
    }

    let tier = 'Fantasma', color = 'bg-red-500', icon = '👻', width = '5%';
    
    // Tiers baseados no Score Total (Mensagens + Pontos de Voz)
    if (totalScore > 250) { tier = 'Lendário'; color = 'bg-purple-500'; icon = '👑'; width = '100%'; }
    else if (totalScore > 50) { tier = 'Ativo'; color = 'bg-emerald-500'; icon = '🔥'; width = '75%'; }
    else if (totalScore > 10) { tier = 'Regular'; color = 'bg-blue-500'; icon = '😐'; width = '50%'; }
    else if (totalScore > 0) { tier = 'Adormecido'; color = 'bg-yellow-500'; icon = '💤'; width = '25%'; }
    
    const voiceHours = Math.floor(totalVoiceMins / 60);
    const voiceRemMins = totalVoiceMins % 60;
    const voiceString = `${voiceHours}h ${voiceRemMins}m`;

    return { 
        total: totalScore, 
        tier, color, icon, width,
        details: { msgs: totalMsgs, voice: voiceString }
    };
};

export const getMemberOrgsInfo = (allMembers, discordId) => {
    const userOrgs = allMembers.filter(m => m.discordId === discordId);
    if (userOrgs.length <= 1) return null;
    const orgNames = userOrgs.map(m => ORG_CONFIG[m.org]?.name || m.org).join(", ");
    return { count: userOrgs.length, names: orgNames };
};

export const formatDateTime = (isoString) => { 
    if (!isoString) return "Nunca"; 
    const date = new Date(isoString); 
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`; 
};

export const formatDate = (dateString) => { 
    if (!dateString) return "-"; 
    const [year, month, day] = dateString.split('-'); 
    return `${day}/${month}/${year}`; 
};
