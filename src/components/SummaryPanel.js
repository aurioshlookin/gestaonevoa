import React, { useMemo, useState } from 'react';
import { 
    BarChart3, PieChart, Zap, Activity, Users, Layers, Award, AlertCircle, 
    ChevronRight, TrendingUp, UserPlus, Crown, ChevronDown, ChevronUp, Info, 
    Flame, Swords, Heart, Dumbbell, Brain, Wind, ShieldCheck, Target, Medal, Droplets
} from 'lucide-react';
import { MASTERIES, ORG_CONFIG, Icons } from '../config/constants.js';
import { getActivityStats, calculateStats } from '../utils/helpers.js';

// Mapa de cores Hex para garantir visualização correta
const ELEMENT_COLORS = {
    'Fogo': '#ef4444',     // red-500
    'Água': '#3b82f6',     // blue-500
    'Vento': '#22c55e',    // green-500
    'Terra': '#a855f7',    // purple-500
    'Raio': '#eab308',     // yellow-500
    'Relâmpago': '#eab308',
    'Gelo': '#06b6d4',     // cyan-500
    'Madeira': '#166534',  // green-800
    'Cristal': '#ec4899',  // pink-500
    'Vapor': '#94a3b8',    // slate-400
    'Lava': '#ea580c',     // orange-600
    'Areia': '#d97706',    // amber-600
    'Yin': '#1e293b',      // slate-800
    'Yang': '#f8fafc',     // slate-50
    'Pendente': '#64748b'  // slate-500
};

const SummaryPanel = ({ members }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeView, setActiveView] = useState('general'); 
    const [selectedActivityTier, setSelectedActivityTier] = useState(null);

    const stats = useMemo(() => {
        const data = {
            masteries: {},
            combos: {},
            activity: {},
            membersByTier: {},
            ranks: {},
            pendingMastery: 0,
            totalMembers: members.length,
            totalLevel: 0,
            newMembers: 0,
            orgActivity: {},
            combat: {
                maxHp: { value: 0, member: null },
                maxCp: { value: 0, member: null },
                accumulators: { Força: 0, Fortitude: 0, Intelecto: 0, Agilidade: 0, Chakra: 0, HP: 0, CP: 0 },
                avgStats: { Força: 0, Fortitude: 0, Intelecto: 0, Agilidade: 0, Chakra: 0, HP: 0, CP: 0 },
                countLevel35: 0,
                maxValues: { Força: 1, Fortitude: 1, Intelecto: 1, Agilidade: 1, Chakra: 1, HP: 1, CP: 1 }
            }
        };

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        members.forEach(m => {
            // 1. Maestrias & Combos
            if (m.masteries && m.masteries.length > 0) {
                m.masteries.forEach(mast => {
                    data.masteries[mast] = (data.masteries[mast] || 0) + 1;
                });
                const comboKey = m.masteries.slice().sort().join(' + ');
                data.combos[comboKey] = (data.combos[comboKey] || 0) + 1;
            } else {
                data.masteries['Pendente'] = (data.masteries['Pendente'] || 0) + 1;
                data.pendingMastery += 1;
            }

            // 2. Atividade
            const activityInfo = getActivityStats(m);
            const tier = activityInfo.tier; 
            data.activity[tier] = (data.activity[tier] || 0) + 1;
            
            if (!data.membersByTier[tier]) data.membersByTier[tier] = [];
            data.membersByTier[tier].push({
                id: m.id,
                name: m.rpName || m.name,
                discordName: m.name,
                org: m.org,
                score: activityInfo.total,
                msgs: activityInfo.details.msgs,
                role: m.ninRole,
                level: m.level || 1
            });

            // 3. Patentes
            data.totalLevel += parseInt(m.level || 1);
            let rank = m.ninRank || 'Desconhecido';
            const rankKey = ['Kage', 'Sannin', 'Anbu', 'Jonin', 'Tokubetsu', 'Chunin', 'Genin', 'Estudante'].find(r => rank.toLowerCase().includes(r.toLowerCase())) || rank;
            data.ranks[rankKey] = (data.ranks[rankKey] || 0) + 1;
            
            if (m.joinDate && new Date(m.joinDate) >= oneWeekAgo) data.newMembers++;

            // 4. Org Activity
            if (!data.orgActivity[m.org]) data.orgActivity[m.org] = { total: 0, count: 0 };
            data.orgActivity[m.org].total += activityInfo.total;
            data.orgActivity[m.org].count += 1;

            // 5. Combate
            const mStats = m.stats || { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 };
            const derived = calculateStats(mStats, m.guildBonus);

            if (derived.hp > data.combat.maxHp.value) data.combat.maxHp = { value: derived.hp, member: m };
            if (derived.cp > data.combat.maxCp.value) data.combat.maxCp = { value: derived.cp, member: m };

            data.combat.maxValues.HP = Math.max(data.combat.maxValues.HP, derived.hp);
            data.combat.maxValues.CP = Math.max(data.combat.maxValues.CP, derived.cp);
            Object.keys(mStats).forEach(key => {
                if (data.combat.maxValues[key] !== undefined) {
                    data.combat.maxValues[key] = Math.max(data.combat.maxValues[key], parseInt(mStats[key] || 0));
                }
            });

            if (parseInt(m.level || 1) >= 35) {
                data.combat.countLevel35++;
                data.combat.accumulators.Força += parseInt(mStats.Força || 5);
                data.combat.accumulators.Fortitude += parseInt(mStats.Fortitude || 5);
                data.combat.accumulators.Intelecto += parseInt(mStats.Intelecto || 5);
                data.combat.accumulators.Agilidade += parseInt(mStats.Agilidade || 5);
                data.combat.accumulators.Chakra += parseInt(mStats.Chakra || 5);
                data.combat.accumulators.HP += derived.hp;
                data.combat.accumulators.CP += derived.cp;
            }
        });

        if (data.combat.countLevel35 > 0) {
            Object.keys(data.combat.avgStats).forEach(k => {
                data.combat.avgStats[k] = Math.round(data.combat.accumulators[k] / data.combat.countLevel35);
            });
        }

        let bestOrg = { id: null, avg: 0 };
        Object.entries(data.orgActivity).forEach(([orgId, info]) => {
            const avg = info.total / info.count;
            if (avg > bestOrg.avg) bestOrg = { id: orgId, avg: Math.round(avg) };
        });
        data.topOrg = bestOrg;

        return data;
    }, [members]);

    const topOrgName = stats.topOrg.id ? (ORG_CONFIG[stats.topOrg.id]?.name || stats.topOrg.id) : "-";
    const avgLevel = stats.totalMembers > 0 ? Math.round(stats.totalLevel / stats.totalMembers) : 0;
    const sortedMasteries = Object.entries(stats.masteries).sort((a, b) => b[1] - a[1]);
    const sortedCombos = Object.entries(stats.combos).sort((a, b) => b[1] - a[1]);
    
    const rankOrder = ['Kage', 'Sannin', 'Anbu', 'Jonin', 'Tokubetsu', 'Chunin', 'Genin', 'Estudante'];
    const sortedRanks = Object.entries(stats.ranks).sort((a, b) => {
        const indexA = rankOrder.findIndex(r => a[0].includes(r));
        const indexB = rankOrder.findIndex(r => b[0].includes(r));
        const valA = indexA === -1 ? 99 : indexA;
        const valB = indexB === -1 ? 99 : indexB;
        return valA - valB;
    });

    const activityColors = {
        'Lendário': 'bg-purple-500 text-purple-100 border-purple-500/30',
        'Ativo': 'bg-emerald-500 text-emerald-100 border-emerald-500/30',
        'Regular': 'bg-blue-500 text-blue-100 border-blue-500/30',
        'Adormecido': 'bg-yellow-500 text-yellow-100 border-yellow-500/30',
        'Fantasma': 'bg-red-500 text-red-100 border-red-500/30'
    };

    const toggleTierDetails = (e, tier) => {
        e.stopPropagation(); 
        setSelectedActivityTier(selectedActivityTier === tier ? null : tier);
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button 
            onClick={(e) => { e.stopPropagation(); setActiveView(id); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeView === id 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' 
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
        >
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <div className={`glass-panel rounded-xl transition-all duration-300 mb-8 ${isExpanded ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
            
            {/* CABEÇALHO CLICÁVEL */}
            <div 
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-cyan-900/20 text-cyan-400">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Relatório de Inteligência</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                <Users size={12}/> {stats.totalMembers} Ninjas
                            </span>
                            {stats.pendingMastery > 0 && (
                                <span className="text-xs text-yellow-400 font-bold font-mono flex items-center gap-1">
                                    <AlertCircle size={12}/> {stats.pendingMastery} Pendentes
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight className="text-slate-500" size={24} />
                </div>
            </div>

            {/* CONTEÚDO EXPANDIDO */}
            {isExpanded && (
                <div className="px-6 pb-6 animate-fade-in border-t border-slate-700/50 pt-6">
                    
                    {/* BARRA DE NAVEGAÇÃO (ABAS) */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <TabButton id="general" label="Geral" icon={Info} />
                        <TabButton id="combat" label="Status & Combate" icon={Swords} />
                        <TabButton id="masteries" label="Maestrias" icon={Zap} />
                        <TabButton id="activity" label="Atividade" icon={Activity} />
                    </div>

                    <div className="animate-fade-in">
                        
                        {/* === ABA GERAL === */}
                        {activeView === 'general' && (
                            <div className="space-y-6">
                                {/* KPIs Principais */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Efetivo Total</p>
                                            <Users size={16} className="text-blue-400"/>
                                        </div>
                                        <p className="text-3xl font-bold text-white">{stats.totalMembers}</p>
                                    </div>

                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Nível Médio</p>
                                            <TrendingUp size={16} className="text-emerald-400"/>
                                        </div>
                                        <p className="text-3xl font-bold text-white">{avgLevel}</p>
                                    </div>

                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Recrutas (7d)</p>
                                            <UserPlus size={16} className="text-cyan-400"/>
                                        </div>
                                        <p className="text-3xl font-bold text-white">{stats.newMembers}</p>
                                    </div>

                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Org. Destaque</p>
                                            <Crown size={16} className="text-yellow-400"/>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-lg font-bold text-white truncate" title={topOrgName}>{topOrgName}</p>
                                            <p className="text-[10px] text-slate-500">Média: <span className="text-yellow-400 font-bold">{stats.topOrg.avg} pts</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Distribuição de Patentes (Estilo Barra Horizontal) */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
                                        <Medal size={16}/> Distribuição de Patentes
                                    </h3>
                                    {sortedRanks.length > 0 ? (
                                        <div className="space-y-4">
                                            {sortedRanks.map(([rank, count]) => {
                                                const percentage = stats.totalMembers > 0 ? (count / stats.totalMembers) * 100 : 0;
                                                
                                                let barColor = 'bg-slate-600';
                                                let textColor = 'text-slate-400';
                                                
                                                if (rank.includes('Kage')) { barColor = 'bg-red-600'; textColor = 'text-red-400'; }
                                                else if (rank.includes('Sannin')) { barColor = 'bg-orange-600'; textColor = 'text-orange-400'; }
                                                else if (rank.includes('Anbu')) { barColor = 'bg-purple-600'; textColor = 'text-purple-400'; }
                                                else if (rank.includes('Jonin')) { barColor = 'bg-emerald-600'; textColor = 'text-emerald-400'; }
                                                else if (rank.includes('Tokubetsu')) { barColor = 'bg-teal-600'; textColor = 'text-teal-400'; }
                                                else if (rank.includes('Chunin')) { barColor = 'bg-blue-600'; textColor = 'text-blue-400'; }
                                                else if (rank.includes('Genin')) { barColor = 'bg-cyan-600'; textColor = 'text-cyan-400'; }
                                                else if (rank.includes('Estudante')) { barColor = 'bg-slate-500'; textColor = 'text-slate-400'; }

                                                return (
                                                    <div key={rank} className="flex items-center gap-4">
                                                        <div className={`w-24 text-xs font-bold uppercase truncate text-right ${textColor}`} title={rank}>
                                                            {rank.split(' ')[0]}
                                                        </div>
                                                        <div className="flex-1 bg-slate-900/50 h-3 rounded-full overflow-hidden relative">
                                                            <div 
                                                                className={`h-full ${barColor} rounded-full transition-all duration-1000 relative`} 
                                                                style={{ width: `${percentage}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-white/10"></div>
                                                            </div>
                                                        </div>
                                                        <div className="w-12 text-right font-mono font-bold text-white text-sm">
                                                            {count}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-500 py-4 italic">Nenhuma patente registrada.</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* === ABA COMBATE === */}
                        {activeView === 'combat' && (
                            <div className="space-y-6">
                                {/* Destaques Individuais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden shadow-lg">
                                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none"></div>
                                        <div className="p-4 bg-red-900/30 rounded-full border border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                            <Heart size={32} fill="currentColor" className="animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Titã (Maior HP)</p>
                                            {stats.combat.maxHp.member ? (
                                                <>
                                                    <p className="text-xl font-bold text-white truncate">{stats.combat.maxHp.member.rpName || stats.combat.maxHp.member.name}</p>
                                                    <p className="text-sm text-slate-400 font-mono">
                                                        <span className="text-red-400 font-bold text-lg">{stats.combat.maxHp.value} HP</span> 
                                                        <span className="mx-2 text-slate-600">|</span> 
                                                        {ORG_CONFIG[stats.combat.maxHp.member.org]?.name}
                                                    </p>
                                                </>
                                            ) : <p className="text-slate-500 italic">Nenhum dado.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden shadow-lg">
                                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
                                        <div className="p-4 bg-blue-900/30 rounded-full border border-blue-500/30 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                            <Zap size={32} fill="currentColor" className="animate-[pulse_2s_infinite]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Sábio (Maior CP)</p>
                                            {stats.combat.maxCp.member ? (
                                                <>
                                                    <p className="text-xl font-bold text-white truncate">{stats.combat.maxCp.member.rpName || stats.combat.maxCp.member.name}</p>
                                                    <p className="text-sm text-slate-400 font-mono">
                                                        <span className="text-blue-400 font-bold text-lg">{stats.combat.maxCp.value} CP</span> 
                                                        <span className="mx-2 text-slate-600">|</span> 
                                                        {ORG_CONFIG[stats.combat.maxCp.member.org]?.name}
                                                    </p>
                                                </>
                                            ) : <p className="text-slate-500 italic">Nenhum dado.</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Seção de Médias */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                            <TrendingUp size={16}/> Estatísticas Médias da Vila
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                            <Target size={12} className="text-cyan-400"/>
                                            <span>Base: Nível 35+ ({stats.combat.countLevel35} ninjas)</span>
                                        </div>
                                    </div>
                                    
                                    {stats.combat.countLevel35 > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            
                                            {/* Coluna 1: Recursos Vitais (HP/CP) */}
                                            <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                                    <Droplets size={14}/> Recursos Vitais
                                                </h4>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: 'Vida (HP)', icon: Heart, color: 'text-red-400', barColor: 'bg-red-500', key: 'HP' },
                                                        { label: 'Chakra (CP)', icon: Zap, color: 'text-blue-400', barColor: 'bg-blue-500', key: 'CP' }
                                                    ].map(stat => {
                                                        const value = stats.combat.avgStats[stat.key];
                                                        const maxForThisStat = Math.max(stats.combat.maxValues[stat.key], 1);
                                                        const percentage = (value / maxForThisStat) * 100;

                                                        return (
                                                            <div key={stat.key} className="space-y-1">
                                                                <div className="flex justify-between text-xs font-bold text-slate-300">
                                                                    <div className="flex items-center gap-2">
                                                                        <stat.icon size={12} className={stat.color}/>
                                                                        {stat.label}
                                                                    </div>
                                                                    <span className="font-mono text-white">{value}</span>
                                                                </div>
                                                                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full ${stat.barColor} rounded-full transition-all duration-1000 relative`} 
                                                                        style={{ width: `${percentage}%` }}
                                                                    >
                                                                        <div className="absolute inset-0 bg-white/20"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Coluna 2: Atributos Base */}
                                            <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700/50">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                                    <Dumbbell size={14}/> Atributos de Combate
                                                </h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { label: 'Força', icon: Dumbbell, color: 'text-orange-400', barColor: 'bg-orange-500', key: 'Força' },
                                                        { label: 'Agilidade', icon: Wind, color: 'text-cyan-400', barColor: 'bg-cyan-500', key: 'Agilidade' },
                                                        { label: 'Fortitude', icon: ShieldCheck, color: 'text-green-400', barColor: 'bg-green-500', key: 'Fortitude' },
                                                        { label: 'Intelecto', icon: Brain, color: 'text-purple-400', barColor: 'bg-purple-500', key: 'Intelecto' },
                                                        { label: 'Controle', icon: Zap, color: 'text-yellow-400', barColor: 'bg-yellow-500', key: 'Chakra' }
                                                    ].map(stat => {
                                                        const value = stats.combat.avgStats[stat.key];
                                                        const maxForThisStat = Math.max(stats.combat.maxValues[stat.key], 1);
                                                        const percentage = (value / maxForThisStat) * 100;

                                                        return (
                                                            <div key={stat.key} className="flex items-center gap-3">
                                                                <div className="w-20 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                                                    <stat.icon size={10} className={stat.color}/>
                                                                    {stat.label}
                                                                </div>
                                                                <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full ${stat.barColor} rounded-full transition-all duration-1000`} 
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="w-8 text-right font-mono font-bold text-white text-xs">
                                                                    {value}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 italic bg-slate-900/20 rounded border border-dashed border-slate-700">
                                            Dados insuficientes (Nenhum ninja acima do nível 35 encontrado).
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* === ABA MAESTRIAS === */}
                        {activeView === 'masteries' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Distribuição Elementar (Estilo Barra Horizontal) */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2 w-full">
                                        <PieChart size={16}/> Distribuição Elementar
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {sortedMasteries.map(([name, count]) => {
                                            const percentage = Math.round((count / stats.totalMembers) * 100);
                                            const colorHex = ELEMENT_COLORS[name] || ELEMENT_COLORS['Pendente'];
                                            
                                            return (
                                                <div key={name} className="flex items-center gap-4">
                                                    <div className="w-24 text-xs font-bold text-slate-400 uppercase truncate text-right flex items-center justify-end gap-2">
                                                        {name}
                                                    </div>
                                                    <div className="flex-1 bg-slate-900/50 h-3 rounded-full overflow-hidden relative">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-1000 relative" 
                                                            style={{ 
                                                                width: `${percentage}%`,
                                                                backgroundColor: colorHex
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 bg-white/10"></div>
                                                        </div>
                                                    </div>
                                                    <div className="w-16 text-right font-mono font-bold text-white text-sm">
                                                        {count} <span className="text-xs text-slate-500">({percentage}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Lista de Combos */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <Layers size={16}/> Combos Populares
                                    </h3>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto scroll-custom pr-2">
                                        {sortedCombos.map(([combo, count], idx) => {
                                            const percent = Math.round((count / stats.totalMembers) * 100);
                                            return (
                                                <div key={idx} className="relative bg-slate-900/40 p-3 rounded border border-slate-700/50 overflow-hidden">
                                                    <div className="absolute inset-0 bg-cyan-500/5 w-full transform origin-left transition-transform duration-1000" style={{ transform: `scaleX(${percent / 100})` }}></div>
                                                    <div className="relative flex justify-between items-center z-10">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                                                            <span className={`text-sm font-bold ${combo === 'Cadastro Incompleto' ? 'text-yellow-500' : 'text-white'}`}>{combo}</span>
                                                        </div>
                                                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400 font-mono font-bold">{count}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === ABA ATIVIDADE === */}
                        {activeView === 'activity' && (
                            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                    <Activity size={16}/> Saúde da Comunidade
                                </h3>
                                
                                <div className="space-y-3">
                                    {['Lendário', 'Ativo', 'Regular', 'Adormecido', 'Fantasma'].map(tier => {
                                        const count = stats.activity[tier] || 0;
                                        const percentage = Math.round((count / stats.totalMembers) * 100) || 0;
                                        const colorStyle = activityColors[tier] || 'bg-slate-500 text-slate-100';
                                        const isSelected = selectedActivityTier === tier;
                                        const tierMembers = stats.membersByTier[tier] || [];

                                        if (count === 0) return null;

                                        return (
                                            <div key={tier} className="flex flex-col">
                                                <div 
                                                    onClick={(e) => toggleTierDetails(e, tier)}
                                                    className={`group relative flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:brightness-110 ${isSelected ? 'bg-slate-700 border-slate-500' : 'bg-slate-900/50 border-slate-700/50'}`}
                                                >
                                                    <div className={`absolute inset-0 opacity-10 rounded-lg ${colorStyle.split(' ')[0]} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <span className={`w-3 h-3 rounded-full ${colorStyle.split(' ')[0]} shadow-[0_0_8px_currentColor]`}></span>
                                                        <span className="text-sm font-bold text-slate-200">{tier}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <span className="font-mono text-cyan-400 font-bold">{count}</span>
                                                        {isSelected ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-600 group-hover:text-white"/>}
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div className="mt-2 pl-4 border-l-2 border-slate-700 space-y-2 animate-fade-in mb-2">
                                                        {tierMembers.map((m, idx) => {
                                                            const orgInfo = ORG_CONFIG[m.org] || { name: m.org, color: 'text-slate-500' };
                                                            return (
                                                                <div key={idx} className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs border border-slate-700/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-6 h-6 rounded bg-slate-700 flex items-center justify-center font-bold text-white uppercase text-[10px] ${orgInfo.color}`}>{m.name.charAt(0)}</div>
                                                                        <div>
                                                                            <p className="font-bold text-white">{m.name}</p>
                                                                            <p className="text-[10px] text-slate-400">{orgInfo.name} • {m.role} • Nvl. {m.level}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-cyan-400 font-bold">{Math.round(m.score)} pts</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummaryPanel;
