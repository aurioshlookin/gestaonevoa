import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, ChevronRight, UserPlus, CheckCircle, Shield, Users, Activity, BarChart, PieChart } from 'lucide-react';
import { ORG_CONFIG, Icons } from '../config/constants.js';
import { getActivityStats } from '../utils/helpers.js';
import SummaryPanel from './SummaryPanel.js';

const DashboardTab = ({ members, roleConfig, multiOrgUsers, onTabChange }) => {
    const [expandedOrg, setExpandedOrg] = useState(null);

    // Cálculos de Cadastro (Pendentes vs Concluídos)
    const cadastroStats = useMemo(() => {
        const totalSlots = Object.values(ORG_CONFIG).reduce((acc, org) => acc + org.limit, 0);
        const totalRegistered = members.length;
        const totalPending = totalSlots - totalRegistered;
        const occupancyRate = Math.round((totalRegistered / totalSlots) * 100);

        // Detalhamento por Organização para o card de recrutamento
        const orgDetails = Object.values(ORG_CONFIG).map(org => {
            const count = members.filter(m => m.org === org.id).length;
            const free = org.limit - count;
            const percent = Math.round((count / org.limit) * 100);
            
            let statusColor = 'text-emerald-400';
            let barColor = 'bg-emerald-500';
            let statusText = 'Disponível';

            if (free === 0) {
                statusColor = 'text-red-400';
                barColor = 'bg-red-500';
                statusText = 'Lotado';
            } else if (free <= 2) {
                statusColor = 'text-yellow-400';
                barColor = 'bg-yellow-500';
                statusText = 'Crítico';
            }

            return { ...org, count, free, percent, statusColor, barColor, statusText };
        });
        
        return { totalRegistered, totalPending, totalSlots, occupancyRate, orgDetails };
    }, [members]);

    const activityColors = {
        'Lendário': 'bg-purple-500',
        'Ativo': 'bg-emerald-500',
        'Regular': 'bg-blue-500',
        'Adormecido': 'bg-yellow-500',
        'Fantasma': 'bg-red-500'
    };

    return (
        <div className="animate-fade-in space-y-8">
            
            {/* PAINEL DE INTELIGÊNCIA (GLOBAL) */}
            <SummaryPanel members={members} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUNA ESQUERDA: RELATÓRIO DE CADASTRO E CONFLITOS */}
                <div className="space-y-6">
                    
                    {/* CENTRAL DE RECRUTAMENTO (Card Reformulado) */}
                    <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col gap-6">
                        
                        {/* Cabeçalho */}
                        <div>
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Users size={20} className="text-cyan-400"/> Central de Recrutamento
                            </h3>
                            
                            {/* Barra Global */}
                            <div className="flex items-center justify-between mb-2 text-sm">
                                <span className="text-slate-400">Ocupação Global da Vila</span>
                                <span className="text-white font-bold">{cadastroStats.occupancyRate}%</span>
                            </div>
                            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-1000 relative" 
                                    style={{ width: `${cadastroStats.occupancyRate}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Grid de KPIs */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white">{cadastroStats.totalRegistered}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ninjas Ativos</span>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-cyan-400">{cadastroStats.totalPending}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vagas Abertas</span>
                            </div>
                        </div>

                        {/* Detalhamento por Setor (Lista Visual) */}
                        <div className="space-y-3 pt-2 border-t border-slate-700/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Disponibilidade por Setor</h4>
                            
                            {cadastroStats.orgDetails.map(org => {
                                const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : Icons.Shield;
                                return (
                                    <div key={org.id} className="group relative bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                                        <div className="flex justify-between items-center mb-2 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <IconComp size={14} className="text-slate-400" />
                                                <span className="text-sm font-bold text-slate-200">{org.name}</span>
                                            </div>
                                            <span className={`text-xs font-bold ${org.statusColor} bg-slate-800 px-2 py-0.5 rounded border border-slate-700`}>
                                                {org.free} vagas
                                            </span>
                                        </div>
                                        
                                        {/* Barra de Progresso Mini */}
                                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative z-10">
                                            <div className={`h-full ${org.barColor} transition-all`} style={{ width: `${org.percent}%` }}></div>
                                        </div>

                                        {/* Fundo Hover */}
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${org.barColor} rounded-lg`}></div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rodapé Informativo */}
                        <div className="text-[10px] text-slate-500 text-center italic mt-auto">
                            Dados atualizados em tempo real.
                        </div>
                    </div>

                    {/* Alertas de Conflito (Mantido) */}
                    {multiOrgUsers.length > 0 && (
                        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6 shadow-lg animate-pulse">
                            <h3 className="text-yellow-400 font-bold flex items-center gap-2 mb-4">
                                <AlertTriangle size={20} /> Conflitos de Organização
                            </h3>
                            <div className="space-y-3">
                                {multiOrgUsers.map((u, idx) => (
                                    <div key={idx} className="bg-slate-800/50 p-3 rounded border border-yellow-700/20 flex flex-col">
                                        <span className="font-bold text-white">{u.name}</span>
                                        <span className="text-xs text-slate-400 mt-1">
                                            Membro de: <span className="text-yellow-200">{u.orgs.join(", ")}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA: CARDS DAS ORGANIZAÇÕES */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <Shield size={20} className="text-cyan-400"/> Organizações Ativas
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {Object.values(ORG_CONFIG).map((org) => {
                            const orgMembers = members.filter(m => m.org === org.id);
                            const count = orgMembers.length;
                            const percentage = (count / org.limit) * 100;
                            const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : Icons.Shield;
                            const isExpanded = expandedOrg === org.id;
                            
                            // Busca líder
                            const leader = orgMembers.find(m => m.isLeader);

                            // Cálculo de Atividade da Organização
                            const orgActivityStats = {
                                'Lendário': 0, 'Ativo': 0, 'Regular': 0, 'Adormecido': 0, 'Fantasma': 0
                            };
                            
                            orgMembers.forEach(m => {
                                const stats = getActivityStats(m);
                                if (orgActivityStats[stats.tier] !== undefined) {
                                    orgActivityStats[stats.tier]++;
                                }
                            });

                            return (
                                <div key={org.id} className={`glass-panel rounded-xl transition-all duration-300 ${isExpanded ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                    {/* Cabeçalho do Card (Clicável) */}
                                    <div 
                                        className="p-6 cursor-pointer flex items-center justify-between"
                                        onClick={() => setExpandedOrg(isExpanded ? null : org.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${org.bgColor} ${org.color}`}>
                                                {React.createElement(IconComp)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{org.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${org.color.replace('text', 'bg')}`} style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-mono">{count}/{org.limit}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                            <ChevronRight className="text-slate-500" />
                                        </div>
                                    </div>

                                    {/* Detalhes Expandidos */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 animate-fade-in border-t border-slate-700/50 pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {/* Bloco 1: Liderança */}
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Liderança</h4>
                                                    {leader ? (
                                                        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600">
                                                                {leader.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{leader.rpName || leader.name}</p>
                                                                <p className="text-xs text-slate-400">{leader.ninRole}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500 italic">Sem líder designado</p>
                                                    )}
                                                    
                                                    {/* Bloco Status Extra */}
                                                    <div className="mt-4">
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Vagas</h4>
                                                        <div className="flex justify-between text-sm bg-slate-800/30 p-2 rounded border border-slate-700/50">
                                                            <span className="text-slate-400">Disponíveis:</span>
                                                            <span className="text-white font-bold">{org.limit - count}</span>
                                                        </div>
                                                        {!roleConfig[org.id] && (
                                                            <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
                                                                <AlertCircle size={12}/> Configuração pendente
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Bloco 2: Atividade da Organização */}
                                                <div className="lg:col-span-2">
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                                        <Activity size={12}/> Atividade da Organização
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.entries(orgActivityStats).map(([tier, tierCount]) => {
                                                            const tierPercent = count > 0 ? Math.round((tierCount / count) * 100) : 0;
                                                            if (tierCount === 0) return null; 

                                                            return (
                                                                <div key={tier} className="bg-slate-800/40 p-2 rounded border border-slate-700/50 flex flex-col relative overflow-hidden">
                                                                    <div className={`absolute bottom-0 left-0 h-1 ${activityColors[tier]}`} style={{ width: `${tierPercent}%` }}></div>
                                                                    <div className="flex justify-between items-center z-10">
                                                                        <span className="text-xs text-slate-300 font-bold">{tier}</span>
                                                                        <span className="text-xs font-mono text-white">{tierPercent}%</span>
                                                                    </div>
                                                                    <span className="text-[10px] text-slate-500 z-10">{tierCount} membros</span>
                                                                </div>
                                                            );
                                                        })}
                                                        {count === 0 && <p className="text-xs text-slate-500 italic col-span-2">Nenhum membro registrado.</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onTabChange(org.id); }}
                                                className={`w-full mt-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${org.bgColor} ${org.color} border ${org.border} hover:brightness-110 shadow-lg`}
                                            >
                                                Gerenciar Organização
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
