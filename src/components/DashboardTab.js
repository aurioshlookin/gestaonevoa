import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { ORG_CONFIG, Icons } from '../config/constants.js';
import SummaryPanel from './SummaryPanel.js'; // Importando o novo painel

const DashboardTab = ({ members, roleConfig, multiOrgUsers, onTabChange }) => {
    return (
        <div className="animate-fade-in space-y-8">
            
            {/* PAINEL DE RESUMO E ESTATÍSTICAS (NOVO) */}
            <SummaryPanel members={members} />

            {/* ALERTAS DE CONFLITO */}
            {multiOrgUsers.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6">
                    <h3 className="text-yellow-400 font-bold flex items-center gap-2 mb-4">
                        <AlertTriangle size={20} /> Conflitos de Organização
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            
            {/* CARDS DAS ORGANIZAÇÕES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-grid">
                {Object.values(ORG_CONFIG).map((org) => {
                    const count = members.filter(m => m.org === org.id).length;
                    const percentage = (count / org.limit) * 100;
                    const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : Icons.Shield;
                    
                    return (
                        <div 
                            key={org.id} 
                            onClick={() => onTabChange(org.id)} 
                            className={`glass-panel p-6 rounded-xl cursor-pointer hover:scale-105 transition-all hover:shadow-lg hover:shadow-cyan-500/10 ${org.border} border-t-4`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-lg ${org.bgColor} ${org.color}`}>
                                    <IconComp />
                                </div>
                                <span className="text-2xl font-bold font-mono">{count}/{org.limit}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-1">{org.name}</h3>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                                <div className={`h-full transition-all duration-500 ${org.color.replace('text', 'bg')}`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            {!roleConfig[org.id] && (
                                <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
                                    <AlertCircle size={10}/> Cargo não configurado
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashboardTab;
