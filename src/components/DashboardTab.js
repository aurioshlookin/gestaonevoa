import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, ChevronRight, Shield, Activity } from 'lucide-react';
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
        <div className="animate-fade-in space-y-8">
            
            {/* PAINEL DE INTELIGÊNCIA (GLOBAL) */}
            <SummaryPanel members={members} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUNA ESQUERDA: ALERTAS DE CONFLITOS */}
                <div className="space-y-6">
                    
                    {/* Alertas de Conflito */}
                    {multiOrgUsers.length > 0 ? (
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
                    ) : (
                        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 text-center">
                            <h3 className="text-slate-500 font-bold flex items-center justify-center gap-2 mb-2">
                                <Shield size={20} /> Sistema Estável
                            </h3>
                            <p className="text-xs text-slate-600">Nenhum conflito de organização detectado.</p>
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
