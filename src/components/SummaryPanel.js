import React, { useMemo } from 'react';
import { BarChart3, PieChart, Zap, Activity, Users, Layers, Award, AlertCircle } from 'lucide-react';
import { MASTERIES, Icons } from '../config/constants.js';
import { getActivityStats } from '../utils/helpers.js';

const SummaryPanel = ({ members }) => {
    const stats = useMemo(() => {
        const data = {
            masteries: {},
            combos: {},
            activity: {},
            pendingMastery: 0, // Contador para sem maestria
            totalMembers: members.length
        };

        members.forEach(m => {
            // 1. Contagem por Maestria Individual e Pendentes
            if (m.masteries && m.masteries.length > 0) {
                m.masteries.forEach(mast => {
                    data.masteries[mast] = (data.masteries[mast] || 0) + 1;
                });
            } else {
                // Se não tiver maestria, conta como pendente
                data.masteries['Pendente'] = (data.masteries['Pendente'] || 0) + 1;
                data.pendingMastery += 1;
            }

            // 2. Contagem por Combinação (Combo)
            const comboKey = (m.masteries || []).length > 0 
                ? (m.masteries || []).slice().sort().join(' + ') 
                : 'Cadastro Incompleto';
            data.combos[comboKey] = (data.combos[comboKey] || 0) + 1;

            // 3. Contagem por Atividade
            const activityInfo = getActivityStats(m);
            const tier = activityInfo.tier; 
            data.activity[tier] = (data.activity[tier] || 0) + 1;
        });

        return data;
    }, [members]);

    const getTop = (obj) => {
        // Filtra "Pendente" e "Cadastro Incompleto" para não serem o "Top" destaque (opcional, mas recomendado)
        const sorted = Object.entries(obj)
            .filter(([key]) => key !== 'Pendente' && key !== 'Cadastro Incompleto')
            .sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0] : ['-', 0];
    };

    const topMastery = getTop(stats.masteries);
    const topCombo = getTop(stats.combos);

    const sortedMasteries = Object.entries(stats.masteries)
        .sort((a, b) => b[1] - a[1]);

    const activityColors = {
        'Lendário': 'bg-purple-500 text-purple-100',
        'Ativo': 'bg-emerald-500 text-emerald-100',
        'Regular': 'bg-blue-500 text-blue-100',
        'Adormecido': 'bg-yellow-500 text-yellow-100',
        'Fantasma': 'bg-red-500 text-red-100'
    };

    return (
        <div className="space-y-6 mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Relatório de Inteligência</h2>
            </div>

            {/* CARDS DE RESUMO (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Efetivo Total</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.totalMembers}</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                        <Users size={24} />
                    </div>
                </div>

                {/* NOVO CARD: Pendentes */}
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Pendentes</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-3xl font-bold text-white">{stats.pendingMastery}</p>
                            {stats.pendingMastery > 0 && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold">Atenção</span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Sem maestria definida</p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-lg">
                        <AlertCircle size={24} />
                    </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Maestria Dominante</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xl font-bold text-white truncate max-w-[100px]" title={topMastery[0]}>{topMastery[0]}</p>
                            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-cyan-400 font-mono">{topMastery[1]}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-orange-500/20 text-orange-400 rounded-lg">
                        <Zap size={24} />
                    </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Combo Comum</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-bold text-white truncate max-w-[120px]" title={topCombo[0]}>{topCombo[0]}</p>
                            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-purple-400 font-mono">{topCombo[1]}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                        <Layers size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GRÁFICO DE MAESTRIAS */}
                <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <PieChart size={16}/> Distribuição de Elementos & Estilos
                    </h3>
                    <div className="space-y-3">
                        {sortedMasteries.map(([name, count]) => {
                            const masteryConfig = MASTERIES.find(m => m.id === name);
                            // Se for "Pendente", usa cor de alerta (amarelo/laranja) ou cinza
                            const colorClass = name === 'Pendente' 
                                ? 'bg-yellow-600' 
                                : (masteryConfig ? masteryConfig.color.replace('text-', 'bg-') : 'bg-slate-500');
                            
                            const percentage = Math.round((count / stats.totalMembers) * 100);
                            
                            return (
                                <div key={name} className="relative group">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className={`font-bold ${name === 'Pendente' ? 'text-yellow-400' : 'text-slate-300'}`}>
                                            {name === 'Pendente' ? '⚠️ Pendente de Cadastro' : name}
                                        </span>
                                        <span className="text-slate-400">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${colorClass} ${name === 'Pendente' ? 'animate-pulse' : ''}`} 
                                            style={{ width: `${percentage}%`, transition: 'width 1s ease-in-out' }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PAINEL DE ATIVIDADE */}
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Activity size={16}/> Saúde da Comunidade
                    </h3>
                    <div className="space-y-3">
                        {['Lendário', 'Ativo', 'Regular', 'Adormecido', 'Fantasma'].map(tier => {
                            const count = stats.activity[tier] || 0;
                            const color = activityColors[tier] || 'bg-slate-500 text-slate-100';
                            
                            if (count === 0) return null;

                            return (
                                <div key={tier} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`}></span>
                                        <span className="text-sm font-bold text-slate-200">{tier}</span>
                                    </div>
                                    <span className="font-mono text-cyan-400 font-bold">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-700">
                        <div className="bg-yellow-900/20 p-3 rounded text-xs text-yellow-200/80 border border-yellow-700/30">
                            <Award size={14} className="inline mr-1 -mt-0.5"/>
                            <strong>Dica:</strong> Membros "Lendários" têm mais de 250 pontos de atividade recente.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryPanel;
