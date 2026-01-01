import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, Shield, Activity, AlertCircle } from 'lucide-react';
import { ORG_CONFIG, Icons } from '../config/constants.js';
import { getActivityStats } from '../utils/helpers.js';
import SummaryPanel from './SummaryPanel.js';

const DashboardTab = ({ members, roleConfig, multiOrgUsers, onTabChange }) => {
    const [expandedOrg, setExpandedOrg] = useState(null);

    const activityColors = {
        'Lendário': 'bg-purple-500',
        'Ativo': 'bg-emerald-500',
        'Regular': 'bg-blue-500',
        'Adormecido': 'bg-yellow-500',
        'Fantasma': 'bg-red-500'
    };

    return (
        <div className="animate-fade-in flex flex-col gap-8">
            
            {/* 1. PAINEL DE INTELIGÊNCIA */}
            <div className="w-full">
                <SummaryPanel members={members} />
            </div>

            {/* 2. ALERTAS */}
            {multiOrgUsers.length > 0 && (
                <div className="w-full bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 shadow-lg animate-pulse flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex items-center gap-3 text-yellow-400 font-bold min-w-fit">
                        <AlertTriangle size={24} /> 
                        <span>Conflitos de Organização Detectados</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {multiOrgUsers.map((u, idx) => (
                            <div key={idx} className="bg-slate-900/80 px-3 py-1 rounded border border-yellow-700/50 text-xs">
                                <span className="font-bold text-white mr-1">{u.name}:</span>
                                <span className="text-yellow-200">{u.orgs.join(", ")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. LISTA DE ORGANIZAÇÕES */}
            <div className="w-full">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg border-b border-slate-700 pb-2">
                    <Shield size={20} className="text-cyan-400"/> Organizações
                </h3>
                
                <div className="flex flex-wrap gap-6">
                    {Object.values(ORG_CONFIG).map((org) => {
                        const orgMembers = members.filter(m => m.org === org.id);
                        const count = orgMembers.length;
                        const percentage = (count / org.limit) * 100;
                        const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : Icons.Shield;
                        const isExpanded = expandedOrg === org.id;
                        
                        // Busca líder
                        const leader = orgMembers.find(m => m.isLeader);

                        // Atividade
                        const orgActivityStats = { 'Lendário': 0, 'Ativo': 0, 'Regular': 0, 'Adormecido': 0, 'Fantasma': 0 };
                        orgMembers.forEach(m => {
                            const stats = getActivityStats(m);
                            if (orgActivityStats[stats.tier] !== undefined) orgActivityStats[stats.tier]++;
                        });

                        return (
                            <div 
                                key={org.id} 
                                className={`glass-panel rounded-xl transition-all duration-300 flex flex-col ${
                                    isExpanded 
                                    ? 'w-full border-cyan-500/50 shadow-lg shadow-cyan-500/10 order-first' 
                                    : 'w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] border-slate-700 hover:border-slate-600 order-last'
                                }`}
                            >
                                {/* Cabeçalho do Card */}
                                <div 
                                    className="p-5 cursor-pointer flex items-center justify-between"
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
                                    <div className="px-6 pb-6 animate-fade-in border-t border-slate-700/50 pt-4 cursor-default">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Bloco 1: Liderança e Status */}
                                            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 h-full flex flex-col">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 border-b border-slate-700 pb-2">Comando</h4>
                                                {leader ? (
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600 text-lg">
                                                            {leader.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{leader.rpName || leader.name}</p>
                                                            <p className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded inline-block mt-0.5">{leader.ninRole}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic mb-4">Sem líder designado</p>
                                                )}
                                                
                                                <div className="flex justify-between text-sm bg-slate-900/50 p-2 rounded border border-slate-700/50 mt-auto">
                                                    <span className="text-slate-400">Vagas Livres:</span>
                                                    <span className={`font-bold ${org.limit - count <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                        {org.limit - count}
                                                    </span>
                                                </div>
                                                {!roleConfig[org.id] && (
                                                    <p className="text-[10px] text-red-400 flex items-center gap-1 mt-2 justify-end">
                                                        <AlertCircle size={10}/> Configurar cargos
                                                    </p>
                                                )}
                                            </div>

                                            {/* Bloco 2: Saúde da Organização */}
                                            <div className="lg:col-span-2 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                                                    <Activity size={12}/> Saúde da Organização
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                    {Object.entries(orgActivityStats).map(([tier, tierCount]) => {
                                                        const tierPercent = count > 0 ? Math.round((tierCount / count) * 100) : 0;
                                                        const opacityClass = tierCount === 0 ? 'opacity-40 grayscale' : '';
                                                        return (
                                                            <div key={tier} className={`bg-slate-900/60 p-2 rounded border border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden h-20 ${opacityClass}`}>
                                                                <div className={`absolute bottom-0 left-0 w-full h-1 ${activityColors[tier]}`}></div>
                                                                <span className="text-xl font-bold text-white z-10">{tierCount}</span>
                                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider z-10 text-center">{tier}</span>
                                                                <span className="text-[9px] text-slate-600 font-mono mt-1 z-10">{tierPercent}%</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4 pt-4 border-t border-slate-700/50">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onTabChange(org.id); }}
                                                className={`px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${org.bgColor} ${org.color} border ${org.border} hover:brightness-110 shadow-lg hover:shadow-${org.color.split('-')[1]}-500/20`}
                                            >
                                                Acessar Painel da Organização
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
