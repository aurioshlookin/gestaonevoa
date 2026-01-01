import React, { useMemo, useState } from 'react';
import { 
    BarChart3, PieChart, Zap, Activity, Users, Layers, Award, AlertCircle, 
    ChevronRight, TrendingUp, UserPlus, Crown, ChevronDown, ChevronUp, Info, 
    Flame, Swords, Heart, Dumbbell, Brain, Wind, ShieldCheck
} from 'lucide-react';
import { MASTERIES, ORG_CONFIG, Icons } from '../config/constants.js';
import { getActivityStats, calculateStats } from '../utils/helpers.js';

const SummaryPanel = ({ members }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeView, setActiveView] = useState('general'); // 'general', 'masteries', 'activity', 'combat'
    const [selectedActivityTier, setSelectedActivityTier] = useState(null);

    const stats = useMemo(() => {
        const data = {
            masteries: {},
            combos: {},
            activity: {},
            membersByTier: {},
            pendingMastery: 0,
            totalMembers: members.length,
            totalLevel: 0,
            newMembers: 0, // Últimos 7 dias
            orgActivity: {},
            combat: {
                maxHp: { value: 0, member: null },
                maxCp: { value: 0, member: null },
                avgStats: { Força: 0, Fortitude: 0, Intelecto: 0, Agilidade: 0, Chakra: 0 }
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
                role: m.ninRole
            });

            // 3. Estatísticas Gerais
            data.totalLevel += parseInt(m.level || 1);
            
            if (m.joinDate && new Date(m.joinDate) >= oneWeekAgo) {
                data.newMembers++;
            }

            // 4. Atividade por Organização
            if (!data.orgActivity[m.org]) data.orgActivity[m.org] = { total: 0, count: 0 };
            data.orgActivity[m.org].total += activityInfo.total;
            data.orgActivity[m.org].count += 1;

            // 5. Combate e Atributos
            const mStats = m.stats || { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 };
            const derived = calculateStats(mStats, m.guildBonus);

            if (derived.hp > data.combat.maxHp.value) data.combat.maxHp = { value: derived.hp, member: m };
            if (derived.cp > data.combat.maxCp.value) data.combat.maxCp = { value: derived.cp, member: m };

            data.combat.avgStats.Força += mStats.Força || 5;
            data.combat.avgStats.Fortitude += mStats.Fortitude || 5;
            data.combat.avgStats.Intelecto += mStats.Intelecto || 5;
            data.combat.avgStats.Agilidade += mStats.Agilidade || 5;
            data.combat.avgStats.Chakra += mStats.Chakra || 5;
        });

        // Médias
        if (data.totalMembers > 0) {
            Object.keys(data.combat.avgStats).forEach(k => {
                data.combat.avgStats[k] = Math.round(data.combat.avgStats[k] / data.totalMembers);
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

    const topMastery = getTop(stats.masteries);
    const topCombo = getTop(stats.combos);
    const avgLevel = stats.totalMembers > 0 ? Math.round(stats.totalLevel / stats.totalMembers) : 0;
    const topOrgName = stats.topOrg.id ? (ORG_CONFIG[stats.topOrg.id]?.name || stats.topOrg.id) : "-";

    const sortedMasteries = Object.entries(stats.masteries).sort((a, b) => b[1] - a[1]);
    const sortedCombos = Object.entries(stats.combos).sort((a, b) => b[1] - a[1]);

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

                    {/* CONTEÚDO DAS ABAS */}
                    <div className="animate-fade-in">
                        
                        {/* === ABA GERAL === */}
                        {activeView === 'general' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Efetivo</p>
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
                                    <p className="text-3xl font-bold text-white flex items-center gap-2">
                                        {stats.newMembers} 
                                        {stats.newMembers > 0 && <span className="text-[10px] bg-cyan-900 text-cyan-300 px-1 rounded">Novos</span>}
                                    </p>
                                </div>

                                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Org. Destaque</p>
                                        <Crown size={16} className="text-yellow-400"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-lg font-bold text-white truncate" title={topOrgName}>{topOrgName}</p>
                                        <p className="text-[10px] text-slate-500">Média: {stats.topOrg.avg} pts</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === ABA COMBATE === */}
                        {activeView === 'combat' && (
                            <div className="space-y-6">
                                {/* Destaques Individuais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Maior HP */}
                                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none"></div>
                                        <div className="p-4 bg-red-900/30 rounded-full border border-red-500/30 text-red-500">
                                            <Heart size={32} fill="currentColor" className="animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Titã da Vitalidade (Maior HP)</p>
                                            {stats.combat.maxHp.member ? (
                                                <>
                                                    <p className="text-2xl font-bold text-white">{stats.combat.maxHp.member.rpName || stats.combat.maxHp.member.name}</p>
                                                    <p className="text-sm text-slate-400 font-mono">
                                                        <span className="text-red-400 font-bold">{stats.combat.maxHp.value} HP</span> 
                                                        <span className="mx-2">•</span> 
                                                        {ORG_CONFIG[stats.combat.maxHp.member.org]?.name}
                                                    </p>
                                                </>
                                            ) : <p className="text-slate-500 italic">Nenhum dado.</p>}
                                        </div>
                                    </div>

                                    {/* Maior Chakra */}
                                    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden">
                                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
                                        <div className="p-4 bg-blue-900/30 rounded-full border border-blue-500/30 text-blue-500">
                                            <Zap size={32} fill="currentColor" className="animate-[pulse_2s_infinite]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Mestre de Chakra (Maior CP)</p>
                                            {stats.combat.maxCp.member ? (
                                                <>
                                                    <p className="text-2xl font-bold text-white">{stats.combat.maxCp.member.rpName || stats.combat.maxCp.member.name}</p>
                                                    <p className="text-sm text-slate-400 font-mono">
                                                        <span className="text-blue-400 font-bold">{stats.combat.maxCp.value} CP</span> 
                                                        <span className="mx-2">•</span> 
                                                        {ORG_CONFIG[stats.combat.maxCp.member.org]?.name}
                                                    </p>
                                                </>
                                            ) : <p className="text-slate-500 italic">Nenhum dado.</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Média de Atributos da Vila */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
                                        <TrendingUp size={16}/> Média de Atributos da Vila
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {[
                                            { label: 'Força', icon: Dumbbell, color: 'text-orange-400', key: 'Força' },
                                            { label: 'Agilidade', icon: Wind, color: 'text-cyan-400', key: 'Agilidade' },
                                            { label: 'Fortitude', icon: ShieldCheck, color: 'text-green-400', key: 'Fortitude' },
                                            { label: 'Intelecto', icon: Brain, color: 'text-purple-400', key: 'Intelecto' },
                                            { label: 'Chakra', icon: Zap, color: 'text-blue-400', key: 'Chakra' }
                                        ].map(stat => (
                                            <div key={stat.key} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center text-center hover:bg-slate-800 transition-colors">
                                                <stat.icon size={20} className={`${stat.color} mb-2`}/>
                                                <span className="text-2xl font-bold text-white mb-1">{stats.combat.avgStats[stat.key]}</span>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === ABA MAESTRIAS === */}
                        {activeView === 'masteries' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Distribuição de Elementos */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <PieChart size={16}/> Distribuição Elementar
                                    </h3>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto scroll-custom pr-2">
                                        {sortedMasteries.map(([name, count]) => {
                                            const masteryConfig = MASTERIES.find(m => m.id === name);
                                            const colorClass = name === 'Pendente' 
                                                ? 'bg-yellow-600' 
                                                : (masteryConfig ? masteryConfig.color.replace('text-', 'bg-') : 'bg-slate-500');
                                            
                                            const percentage = Math.round((count / stats.totalMembers) * 100);
                                            
                                            return (
                                                <div key={name} className="relative group">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className={`font-bold ${name === 'Pendente' ? 'text-yellow-400' : 'text-slate-300'}`}>
                                                            {name}
                                                        </span>
                                                        <span className="text-slate-400">{count} ({percentage}%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${colorClass}`} 
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Combos Populares */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <Layers size={16}/> Combos Populares
                                    </h3>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto scroll-custom pr-2">
                                        {sortedCombos.slice(0, 10).map(([combo, count], idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-3 rounded border border-slate-700/50">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                                                    <span className={`text-sm font-bold ${combo === 'Cadastro Incompleto' ? 'text-yellow-500' : 'text-white'}`}>
                                                        {combo}
                                                    </span>
                                                </div>
                                                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400 font-mono font-bold">
                                                    {count}
                                                </span>
                                            </div>
                                        ))}
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
                                                                            <p className="text-[10px] text-slate-400">{orgInfo.name} • {m.role}</p>
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
                                <div className="mt-6 pt-4 border-t border-slate-700">
                                    <div className="bg-yellow-900/20 p-3 rounded text-xs text-yellow-200/80 border border-yellow-700/30">
                                        <Award size={14} className="inline mr-1 -mt-0.5"/>
                                        <strong>Critério Lendário:</strong> Acima de 250 pontos recentes.
                                    </div>
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
