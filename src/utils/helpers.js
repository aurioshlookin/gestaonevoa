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

    // Helper: Itera sobre as chaves existentes no banco
    const sumRecent = (map) => {
        let sum = 0;
        for (const [dateKey, value] of Object.entries(map)) {
            // Compara strings ISO para garantir range correto
            if (dateKey >= cutoffStr) {
                sum += Number(value) || 0; 
            }
        }
        return sum;
    };

    totalScore = sumRecent(activityMap);
    totalMsgs = sumRecent(msgMap);
    totalVoiceMins = sumRecent(voiceMap);

    // --- CORREÇÃO DE CONSISTÊNCIA VISUAL ---
    // Problema: Membros com Score alto (ex: importado/antigo) mas sem logs diários apareciam como "Lendário" mas com "0 msgs".
    // Solução: Se o Score Total for muito maior que o que as mensagens e voz justificam,
    // assumimos que a diferença são mensagens válidas que apenas perderam o log detalhado.
    
    const voicePoints = Math.floor(totalVoiceMins / 10);
    // O Score teoricamente é: Msgs + (Voz / 10). Então: Msgs = Score - (Voz / 10)
    const expectedMsgsFromScore = totalScore - voicePoints;

    // Se tivermos uma discrepância grande (mais de 5 pontos sem explicação), ajustamos as mensagens para o display
    if (totalMsgs < expectedMsgsFromScore - 5) {
        totalMsgs = Math.max(totalMsgs, expectedMsgsFromScore);
    }

    let tier = 'Fantasma', color = 'bg-red-500', icon = '👻', width = '5%';
    
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
