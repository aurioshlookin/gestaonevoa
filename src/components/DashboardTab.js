import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, ChevronRight, UserPlus, CheckCircle, XCircle, Shield, Users } from 'lucide-react';
import { ORG_CONFIG, Icons } from '../config/constants.js';
import SummaryPanel from './SummaryPanel.js';

const DashboardTab = ({ members, roleConfig, multiOrgUsers, onTabChange }) => {
    const [expandedOrg, setExpandedOrg] = useState(null);

    // Cálculos de Cadastro (Pendentes vs Concluídos)
    // Assumindo que 'members' são os cadastrados e 'discordRoster' (não passado aqui, mas podemos inferir)
    // Como não temos discordRoster aqui, faremos um resumo baseado nos dados disponíveis
    const cadastroStats = useMemo(() => {
        const totalSlots = Object.values(ORG_CONFIG).reduce((acc, org) => acc + org.limit, 0);
        const totalRegistered = members.length;
        const totalPending = totalSlots - totalRegistered; // Vagas restantes
        
        return { totalRegistered, totalPending, totalSlots };
    }, [members]);

    return (
        <div className="animate-fade-in space-y-8">
            
            {/* PAINEL DE INTELIGÊNCIA (MANTIDO) */}
            <SummaryPanel members={members} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUNA ESQUERDA: RELATÓRIO DE CADASTRO E CONFLITOS */}
                <div className="space-y-6">
                    {/* Relatório de Cadastro */}
                    <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-lg">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Users size={20} className="text-cyan-400"/> Status do Recrutamento
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2 text-sm">
                            <span className="text-slate-400">Vagas Preenchidas</span>
                            <span className="text-white font-bold">{cadastroStats.totalRegistered}</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-1000" 
                                style={{ width: `${(cadastroStats.totalRegistered / cadastroStats.totalSlots) * 100}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-emerald-900/20 p-3 rounded-lg border border-emerald-500/20 text-center">
                                <CheckCircle size={24} className="mx-auto text-emerald-500 mb-1"/>
                                <span className="block text-2xl font-bold text-white">{cadastroStats.totalRegistered}</span>
                                <span className="text-xs text-emerald-400 uppercase font-bold">Cadastrados</span>
                            </div>
                            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/30 text-center">
                                <UserPlus size={24} className="mx-auto text-slate-400 mb-1"/>
                                <span className="block text-2xl font-bold text-white">{cadastroStats.totalPending}</span>
                                <span className="text-xs text-slate-400 uppercase font-bold">Vagas Livres</span>
                            </div>
                        </div>
                    </div>

                    {/* Alertas de Conflito */}
                    {multiOrgUsers.length > 0 && (
                        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6">
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
                            const count = members.filter(m => m.org === org.id).length;
                            const percentage = (count / org.limit) * 100;
                            const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : Icons.Shield;
                            const isExpanded = expandedOrg === org.id;
                            
                            // Busca líder
                            const leader = members.find(m => m.org === org.id && m.isLeader);

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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Status</h4>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">Vagas Disponíveis:</span>
                                                            <span className="text-white font-bold">{org.limit - count}</span>
                                                        </div>
                                                        {!roleConfig[org.id] && (
                                                            <p className="text-xs text-red-400 flex items-center gap-1 mt-2">
                                                                <AlertCircle size={12}/> Configuração pendente
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onTabChange(org.id); }}
                                                className={`w-full mt-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${org.bgColor} ${org.color} border ${org.border} hover:brightness-110`}
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
