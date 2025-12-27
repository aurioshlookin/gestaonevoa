import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, addDoc, collection } from "firebase/firestore";

// Inicializa o namespace global de serviços se não existir
window.AppServices = window.AppServices || {};

// Garante que o Config foi carregado antes
if (!window.AppConfig) {
    console.error("ERRO CRÍTICO: config.js deve ser carregado antes de services.js");
}

const { firebaseConfig, STATS } = window.AppConfig;

// --- Inicialização do Firebase ---
const app = initializeApp(firebaseConfig);
window.AppServices.analytics = getAnalytics(app);
window.AppServices.db = getFirestore(app);

// --- Funções de Cálculo de RPG ---

// Calcula pontos máximos baseados no nível
window.AppServices.calculateMaxPoints = (level) => {
    if (level <= 1) return 0; 
    let points = 0;
    
    // Níveis 2 a 50 ganham 5 pontos por nível
    const levelsTo50 = Math.min(level, 50) - 1;
    points += levelsTo50 * 5;
    
    // Níveis acima de 50 ganham 4 pontos por nível
    if (level > 50) {
        points += (level - 50) * 4;
    }
    return points;
};

// Calcula status finais (HP, CP) baseados nos atributos
window.AppServices.calculateStats = (baseStats, hasBonus) => {
    const stats = { ...baseStats };
    const bonusMultiplier = hasBonus ? 1.10 : 1;
    
    let calculated = {};
    STATS.forEach(key => {
        calculated[key] = Math.floor(stats[key] * bonusMultiplier);
    });

    // Cálculo de HP: Base 250 + (Fortitude extra * 8)
    const fortitudeExtra = Math.max(0, calculated['Fortitude'] - 5);
    const hp = 250 + (fortitudeExtra * 8);

    // Cálculo de CP: Base 50 + (Chakra extra * 5)
    const chakraExtra = Math.max(0, calculated['Chakra'] - 5);
    const cp = 50 + (chakraExtra * 5);

    return { ...calculated, hp, cp };
};

// --- Lógica de Estatísticas de Atividade ---
window.AppServices.getActivityStats = (member) => {
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

    // Fallback: Se não houver detalhe de mensagem/voz mas houver score total
    if (totalMsgs === 0 && totalVoiceMins === 0 && totalScore > 0) {
        totalMsgs = totalScore; 
    }

    // Definição de Tiers
    let tier = 'Fantasma';
    let color = 'bg-red-500';
    let icon = '👻';
    let width = '5%';

    if (totalScore > 250) { 
        tier = 'Lendário'; 
        color = 'bg-purple-500'; 
        icon = '👑'; 
        width = '100%'; 
    } else if (totalScore > 50) { 
        tier = 'Ativo'; 
        color = 'bg-emerald-500'; 
        icon = '🔥'; 
        width = '75%'; 
    } else if (totalScore > 10) { 
        tier = 'Regular'; 
        color = 'bg-blue-500'; 
        icon = '😐'; 
        width = '50%'; 
    } else if (totalScore > 0) { 
        tier = 'Adormecido'; 
        color = 'bg-yellow-500'; 
        icon = '💤'; 
        width = '25%'; 
    }
    
    // Formatação de tempo de voz
    const voiceHours = Math.floor(totalVoiceMins / 60);
    const voiceRemMins = totalVoiceMins % 60;
    const voiceString = `${voiceHours}h ${voiceRemMins}m`;

    return { 
        total: totalScore, 
        tier, 
        color, 
        icon, 
        width,
        details: { msgs: totalMsgs, voice: voiceString }
    };
};

// --- Sistema de Logs ---
window.AppServices.logAction = async (user, action, target, details, org = null) => {
    if (!user) return;
    try {
        await addDoc(collection(window.AppServices.db, "audit_logs"), {
            action,
            target,
            details,
            executor: user.username || user.displayName,
            executorId: user.id,
            org: org || 'Sistema',
            timestamp: new Date().toISOString()
        });
    } catch (e) { 
        console.error("Erro ao gerar log:", e); 
    }
};

// --- Utilitários de Formatação ---
window.AppServices.formatDateTime = (isoString) => { 
    if (!isoString) return "Nunca"; 
    const date = new Date(isoString); 
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`; 
};

window.AppServices.formatDate = (dateString) => { 
    if (!dateString) return "-"; 
    const [year, month, day] = dateString.split('-'); 
    return `${day}/${month}/${year}`; 
};
