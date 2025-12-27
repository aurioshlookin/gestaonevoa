import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { firebaseConfig, STATS } from './config.js';

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

// --- LÓGICA DE RPG ---
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

    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        totalScore += (activityMap[dateStr] || 0);
        totalMsgs += (msgMap[dateStr] || 0);
        totalVoiceMins += (voiceMap[dateStr] || 0);
    }

    if (totalMsgs === 0 && totalVoiceMins === 0 && totalScore > 0) {
        totalMsgs = totalScore; 
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

// --- LOGS ---
export const logAction = async (user, action, target, details, org = null) => {
    if (!user) return;
    try {
        await addDoc(collection(db, "audit_logs"), {
            action,
            target,
            details,
            executor: user.username || user.displayName,
            executorId: user.id,
            org: org || 'Sistema',
            timestamp: new Date().toISOString()
        });
    } catch (e) { console.error("Erro ao gerar log:", e); }
};

// --- UTILITÁRIOS ---
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
