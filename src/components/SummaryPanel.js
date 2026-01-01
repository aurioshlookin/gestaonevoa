import React, { useMemo, useState } from 'react';
import { 
    BarChart3, PieChart, Zap, Activity, Users, Layers, Award, AlertCircle, 
    ChevronRight, TrendingUp, UserPlus, Crown, ChevronDown, ChevronUp, Info, 
    Flame, Swords, Heart, Dumbbell, Brain, Wind, ShieldCheck, Target, Medal
} from 'lucide-react';
import { MASTERIES, ORG_CONFIG, Icons } from '../config/constants.js';
import { getActivityStats, calculateStats } from '../utils/helpers.js';

const SummaryPanel = ({ members }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeView, setActiveView] = useState('general'); // 'general', 'combat', 'masteries', 'activity'
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
                avgStats: { Força: 0, Fortitude: 0, Intelecto: 0, Agilidade: 0, Chakra: 0 },
                countLevel35: 0,
                highestStat: { name: '', value: 0 } // Para escalar o gráfico
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

            // 2. Atividade Detalhada
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
                voice: activityInfo.details.voice,
                role: m.ninRole,
                level: m.level || 1
            });

            // 3. Estatísticas Gerais e Patentes
            data.totalLevel += parseInt(m.level || 1);
            const rank = m.ninRank || 'Desconhecido';
            data.ranks[rank] = (data.ranks[rank] || 0) + 1;
            
            if (m.joinDate && new Date(m.joinDate) >= oneWeekAgo) {
                data.newMembers++;
            }

            // 4. Atividade por Organização
            if (!data.orgActivity[m.org]) data.orgActivity[m.org] = { total: 0, count: 0 };
            data.orgActivity[m.org].total += activityInfo.total;
            data.orgActivity[m.org].count += 1;

            // 5. Combate e Atributos (Filtrado por Nível 35+)
            const mStats = m.stats || { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 };
            const derived = calculateStats(mStats, m.guildBonus);

            // Recordistas (considera todos os níveis para recorde absoluto)
            if (derived.hp > data.combat.maxHp.value) data.combat.maxHp = { value: derived.hp, member: m };
            if (derived.cp > data.combat.maxCp.value) data.combat.maxCp = { value: derived.cp, member: m };

            // Média (apenas nível 35+)
            if (parseInt(m.level || 1) >= 35) {
                data.combat.countLevel35++;
                data.combat.avgStats.Força += parseInt(mStats.Força || 5);
                data.combat.avgStats.Fortitude += parseInt(mStats.Fortitude || 5);
                data.combat.avgStats.Intelecto += parseInt(mStats.Intelecto || 5);
                data.combat.avgStats.Agilidade += parseInt(mStats.Agilidade || 5);
                data.combat.avgStats.Chakra += parseInt(mStats.Chakra || 5);
            }
        });

        // Médias Finais
        if (data.combat.countLevel35 > 0) {
            Object.keys(data.combat.avgStats).forEach(k => {
                const avg = Math.round(data.combat.avgStats[k] / data.combat.countLevel35);
                data.combat.avgStats[k] = avg;
                if (avg > data.combat.highestStat.value) {
                    data.combat.highestStat = { name: k, value: avg };
                }
            });
        }

        // Calcula Top Org
        let bestOrg = { id: null, avg: 0 };
        Object.entries(data.orgActivity).forEach(([orgId, info]) => {
            const avg = info.total / info.count;
            if (avg > bestOrg.avg) {
                bestOrg = { id: orgId, avg: Math.round(avg) };
            }
        });
        data.topOrg = bestOrg;

        // Ordenações
        Object.keys(data.membersByTier).forEach(tier => {
            data.membersByTier[tier].sort((a, b) => b.score - a.score);
        });

        return data;
    }, [members]);

    const getTop = (obj) => {
        const sorted = Object.entries(obj)
            .filter(([key]) => key !== 'Pendente' && key !== 'Cadastro Incompleto')
            .sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0] : ['-', 0];
    };

    const topOrgName = stats.topOrg.id ? (ORG_CONFIG[stats.topOrg.id]?.name || stats.topOrg.id) : "-";
    const avgLevel = stats.totalMembers > 0 ? Math.round(stats.totalLevel / stats.totalMembers) : 0;

    const sortedMasteries = Object.entries(stats.masteries).sort((a, b) => b[1] - a[1]);
    const sortedCombos = Object.entries(stats.combos).sort((a, b) => b[1] - a[1]);
    
    // Ordenação de Patentes
    const rankOrder = ['Kage', 'Sannin', 'Anbu', 'Jonin', 'Tokubetsu Jonin', 'Chunin', 'Genin', 'Estudante'];
    const sortedRanks = Object.entries(stats.ranks).sort((a, b) => {
        const indexA = rankOrder.indexOf(a[0]);
        const indexB = rankOrder.indexOf(b[0]);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
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

    // Helper para gerar gráfico de pizza CSS
    const PieChartVisual = ({ data, total }) => {
        let currentAngle = 0;
        const gradients = data.map(([key, value], idx) => {
            const percentage = (value / total) * 100;
            const angle = (value / total) * 360;
            
            // Cores
            let color = '#64748b'; // slate-500
            const mastery = MASTERIES.find(m => m.id === key);
            if (mastery) {
                 // Convertendo classes tailwind para hex aproximado (simplificado para demo)
                 if (mastery.color.includes('red')) color = '#ef4444';
                 else if (mastery.color.includes('blue')) color = '#3b82f6';
                 else if (mastery.color.includes('green')) color = '#22c55e';
                 else if (mastery.color.includes('yellow')) color = '#eab308';
                 else if (mastery.color.includes('orange')) color = '#f97316';
                 else if (mastery.color.includes('cyan')) color = '#06b6d4';
                 else if (mastery.color.includes('purple')) color = '#a855f7';
            }
            if (key === 'Pendente') color = '#334155'; // slate-700

            const segment = `${color} ${currentAngle}deg ${currentAngle + angle}deg`;
            currentAngle += angle;
            return segment;
        });

        return (
            <div 
                className="w-32 h-32 rounded-full relative shadow-xl"
                style={{ background: `conic-gradient(${gradients.join(', ')})` }}
            >
                <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-400">Total<br/>{total}</span>
                </div>
            </div>
        );
    };

    return (
        <div className={`glass-panel rounded-xl transition-all duration-300 ${isExpanded ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
            
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

                    {/* CONTEÚDO DAS ABAS */}
                    <div className="animate-fade-in">
                        
                        {/* === ABA GERAL === */}
                        {activeView === 'general' && (
                            <div className="space-y-6">
                                {/* KPIs Principais */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Users size={80} />
                                        </div>
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Efetivo Total</p>
                                            <Users size={16} className="text-blue-400"/>
                                        </div>
                                        <p className="text-3xl font-bold text-white relative z-10">{stats.totalMembers}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 relative z-10">Ninjas registrados</p>
                                    </div>

                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <TrendingUp size={80} />
                                        </div>
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Nível Médio</p>
                                            <TrendingUp size={16} className="text-emerald-400"/>
                                        </div>
                                        <p className="text-3xl font-bold text-white relative z-10">{avgLevel}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 relative z-10">Força da vila</p>
                                    </div>

                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <UserPlus size={80} />
                                        </div>
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Recrutas (7d)</p>
                                            <UserPlus size={16} className="text-cyan-400"/>
                                        </div>
                                        <p className="text-3xl font-bold text-white relative z-10 flex items-center gap-2">
                                            {stats.newMembers}
                                            {stats.newMembers > 0 && <span className="text-[10px] bg-cyan-900 text-cyan-300 px-1.5 py-0.5 rounded-full">+ Recentes</span>}
                                        </p>
                                    </div>

                                    <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Crown size={80} />
                                        </div>
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Org. Destaque</p>
                                            <Crown size={16} className="text-yellow-400"/>
                                        </div>
                                        <div className="flex flex-col relative z-10">
                                            <p className="text-lg font-bold text-white truncate" title={topOrgName}>{topOrgName}</p>
                                            <p className="text-[10px] text-slate-500">Média: <span className="text-yellow-400 font-bold">{stats.topOrg.avg} pts</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Gráfico de Colunas: Distribuição de Patentes */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
                                        <Medal size={16}/> Distribuição de Patentes
                                    </h3>
                                    <div className="flex items-end gap-2 h-40 pt-4">
                                        {sortedRanks.map(([rank, count]) => {
                                            const percentage = stats.totalMembers > 0 ? (count / stats.totalMembers) * 100 : 0;
                                            // Altura mínima de 10% para visualização
                                            const height = Math.max(percentage, 5); 
                                            
                                            let barColor = 'bg-slate-600';
                                            if (rank.includes('Kage')) barColor = 'bg-red-500';
                                            else if (rank.includes('Sannin')) barColor = 'bg-orange-500';
                                            else if (rank.includes('Anbu')) barColor = 'bg-purple-500';
                                            else if (rank.includes('Jonin')) barColor = 'bg-emerald-500';
                                            else if (rank.includes('Chunin')) barColor = 'bg-blue-500';
                                            else if (rank.includes('Genin')) barColor = 'bg-cyan-500';

                                            return (
                                                <div key={rank} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-xs px-2 py-1 rounded border border-slate-700 pointer-events-none whitespace-nowrap z-20">
                                                        {rank}: {count} ({Math.round(percentage)}%)
                                                    </div>
                                                    
                                                    {/* Valor */}
                                                    <span className="text-xs font-bold text-white mb-1 group-hover:scale-110 transition-transform">{count}</span>
                                                    
                                                    {/* Barra */}
                                                    <div className={`w-full rounded-t-sm ${barColor} opacity-80 group-hover:opacity-100 transition-all relative overflow-hidden`} style={{ height: `${height}%` }}>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                    </div>
                                                    
                                                    {/* Label Eixo X */}
                                                    <div className="h-6 flex items-center justify-center w-full mt-2">
                                                        <span className="text-[10px] text-slate-400 font-bold truncate w-full text-center" title={rank}>
                                                            {rank.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === ABA COMBATE === */}
                        {activeView === 'combat' && (
                            <div className="space-y-6">
                                {/* Destaques Individuais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none"></div>
                                        <div className="p-4 bg-red-900/30 rounded-full border border-red-500/30 text-red-500">
                                            <Heart size={32} fill="currentColor" className="animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Titã (Maior HP)</p>
                                            {stats.combat.maxHp.member ? (
                                                <>
                                                    <p className="text-xl font-bold text-white truncate max-w-[150px]">{stats.combat.maxHp.member.rpName || stats.combat.maxHp.member.name}</p>
                                                    <p className="text-sm text-slate-400 font-mono">
                                                        <span className="text-red-400 font-bold">{stats.combat.maxHp.value} HP</span> 
                                                        <span className="mx-2 text-slate-600">|</span> 
                                                        {ORG_CONFIG[stats.combat.maxHp.member.org]?.name}
                                                    </p>
                                                </>
                                            ) : <p className="text-slate-500 italic">Nenhum dado.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
                                        <div className="p-4 bg-blue-900/30 rounded-full border border-blue-500/30 text-blue-500">
                                            <Zap size={32} fill="currentColor" className="animate-[pulse_2s_infinite]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Sábio (Maior CP)</p>
                                            {stats.combat.maxCp.member ? (
                                                <>
                                                    <p className="text-xl font-bold text-white truncate max-w-[150px]">{stats.combat.maxCp.member.rpName || stats.combat.maxCp.member.name}</p>
                                                    <p className="text-sm text-slate-400 font-mono">
                                                        <span className="text-blue-400 font-bold">{stats.combat.maxCp.value} CP</span> 
                                                        <span className="mx-2 text-slate-600">|</span> 
                                                        {ORG_CONFIG[stats.combat.maxCp.member.org]?.name}
                                                    </p>
                                                </>
                                            ) : <p className="text-slate-500 italic">Nenhum dado.</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Gráfico de Atributos Médios */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                            <TrendingUp size={16}/> Média de Atributos da Vila
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                            <Target size={12} className="text-cyan-400"/>
                                            <span>Nível 35+ ({stats.combat.countLevel35} ninjas)</span>
                                        </div>
                                    </div>
                                    
                                    {stats.combat.countLevel35 > 0 ? (
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Força', icon: Dumbbell, color: 'text-orange-400', barColor: 'bg-orange-500', key: 'Força' },
                                                { label: 'Agilidade', icon: Wind, color: 'text-cyan-400', barColor: 'bg-cyan-500', key: 'Agilidade' },
                                                { label: 'Fortitude', icon: ShieldCheck, color: 'text-green-400', barColor: 'bg-green-500', key: 'Fortitude' },
                                                { label: 'Intelecto', icon: Brain, color: 'text-purple-400', barColor: 'bg-purple-500', key: 'Intelecto' },
                                                { label: 'Chakra', icon: Zap, color: 'text-blue-400', barColor: 'bg-blue-500', key: 'Chakra' }
                                            ].map(stat => {
                                                const value = stats.combat.avgStats[stat.key];
                                                const maxValue = Math.max(stats.combat.highestStat.value, 1); // Evita divisão por zero
                                                const percentage = (value / maxValue) * 100;

                                                return (
                                                    <div key={stat.key} className="flex items-center gap-4">
                                                        <div className="w-24 flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                                                            <stat.icon size={14} className={stat.color}/>
                                                            {stat.label}
                                                        </div>
                                                        <div className="flex-1 bg-slate-900/50 h-3 rounded-full overflow-hidden relative">
                                                            <div 
                                                                className={`h-full ${stat.barColor} rounded-full transition-all duration-1000`} 
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="w-12 text-right font-mono font-bold text-white text-sm">
                                                            {value}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500 italic bg-slate-900/20 rounded border border-dashed border-slate-700">
                                            Nenhum ninja acima do nível 35 encontrado para gerar estatísticas confiáveis.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* === ABA MAESTRIAS === */}
                        {activeView === 'masteries' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Gráfico de Pizza: Distribuição */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl flex flex-col items-center justify-center">
                                    <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2 w-full">
                                        <PieChart size={16}/> Distribuição Elementar
                                    </h3>
                                    
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <PieChartVisual data={sortedMasteries} total={stats.totalMembers} />
                                        
                                        {/* Legenda */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                            {sortedMasteries.slice(0, 8).map(([name, count]) => {
                                                const masteryConfig = MASTERIES.find(m => m.id === name);
                                                const percentage = Math.round((count / stats.totalMembers) * 100);
                                                const colorClass = name === 'Pendente' ? 'text-slate-500' : (masteryConfig?.color || 'text-slate-400');
                                                
                                                return (
                                                    <div key={name} className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${name === 'Pendente' ? 'bg-slate-500' : (masteryConfig?.color.replace('text-', 'bg-') || 'bg-slate-400')}`}></span>
                                                        <span className="text-slate-300 font-bold">{name}</span>
                                                        <span className="text-slate-500">({percentage}%)</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de Combos */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <Layers size={16}/> Combos Populares
                                    </h3>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto scroll-custom pr-2">
                                        {sortedCombos.slice(0, 10).map(([combo, count], idx) => {
                                            const percent = Math.round((count / stats.totalMembers) * 100);
                                            return (
                                                <div key={idx} className="relative bg-slate-900/40 p-3 rounded border border-slate-700/50 overflow-hidden group">
                                                    {/* Barra de fundo */}
                                                    <div className="absolute inset-0 bg-cyan-500/5 w-full transform origin-left transition-transform duration-1000" style={{ transform: `scaleX(${percent / 100})` }}></div>
                                                    
                                                    <div className="relative flex justify-between items-center z-10">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-500 w-5">#{idx + 1}</span>
                                                            <span className={`text-sm font-bold ${combo === 'Cadastro Incompleto' ? 'text-yellow-500' : 'text-white'}`}>
                                                                {combo}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-slate-500">{percent}%</span>
                                                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400 font-mono font-bold">
                                                                {count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {sortedCombos.length === 0 && <p className="text-xs text-slate-500">Nenhum combo registrado.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === ABA ATIVIDADE === */}
                        {activeView === 'activity' && (
                            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                    <Activity size={16}/> Saúde da Comunidade
                                    <span className="text-[10px] font-normal text-slate-500 ml-auto">(Clique nas barras para ver membros)</span>
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
                                                {/* Barra Clicável */}
                                                <div 
                                                    onClick={(e) => toggleTierDetails(e, tier)}
                                                    className={`group relative flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:brightness-110 ${isSelected ? 'bg-slate-700 border-slate-500' : 'bg-slate-900/50 border-slate-700/50'}`}
                                                >
                                                    <div className={`absolute inset-0 opacity-10 rounded-lg ${colorStyle.split(' ')[0]} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                                    
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <span className={`w-3 h-3 rounded-full ${colorStyle.split(' ')[0]} shadow-[0_0_8px_currentColor]`}></span>
                                                        <span className="text-sm font-bold text-slate-200">{tier}</span>
                                                        <span className="text-xs text-slate-500 font-mono hidden sm:inline">({percentage}%)</span>
                                                    </div>

                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <span className="font-mono text-cyan-400 font-bold">{count}</span>
                                                        {isSelected ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-600 group-hover:text-white"/>}
                                                    </div>
                                                </div>

                                                {/* Lista Detalhada */}
                                                {isSelected && (
                                                    <div className="mt-2 pl-4 border-l-2 border-slate-700 space-y-2 animate-fade-in mb-2">
                                                        {tierMembers.slice(0, 15).map((m, idx) => {
                                                            const orgInfo = ORG_CONFIG[m.org] || { name: m.org, color: 'text-slate-500' };
                                                            return (
                                                                <div key={idx} className="bg-slate-800/50 p-2 rounded flex justify-between items-center text-xs border border-slate-700/50 hover:bg-slate-800 transition-colors">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-6 h-6 rounded bg-slate-700 flex items-center justify-center font-bold text-white uppercase text-[10px] ${orgInfo.color || 'text-slate-400'}`}>
                                                                            {m.name.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-white">{m.name}</p>
                                                                            <p className="text-[10px] text-slate-400">{orgInfo.name} • {m.role} • Nvl. {m.level}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-cyan-400 font-bold">{Math.round(m.score)} pts</p>
                                                                        <p className="text-[9px] text-slate-500">{m.msgs} msgs</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {tierMembers.length > 15 && (
                                                            <p className="text-[10px] text-center text-slate-500 italic pt-1">
                                                                + {tierMembers.length - 15} outros membros...
                                                            </p>
                                                        )}
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
