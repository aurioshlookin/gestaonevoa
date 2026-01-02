import React, { useMemo } from 'react';
import { ORG_CONFIG, Icons } from '../config/constants.js';
import { Users, Crown, Star, TrendingUp, Activity, AlertCircle } from 'lucide-react';

const DashboardTab = ({ members, roleConfig, multiOrgUsers, onTabChange }) => {
    
    // --- CÁLCULOS ESTATÍSTICOS ---
    const stats = useMemo(() => {
        const totalMembers = members.length;
        const activeLeaders = members.filter(m => m.isLeader).length;
        
        // Calcula ocupação das orgs
        const orgsData = Object.values(ORG_CONFIG).map(org => {
            const count = members.filter(m => m.org === org.id).length;
            const limit = org.limit || 999; // 999 para infinito nos cálculos de sort
            const occupancy = org.limit ? (count / org.limit) * 100 : 0;
            return { ...org, count, occupancy };
        });

        const mostPopulated = [...orgsData].sort((a, b) => b.count - a.count).slice(0, 3);
        const totalSlots = Object.values(ORG_CONFIG).reduce((acc, org) => acc + (org.limit || 0), 0);
        // Se totalSlots for 0 (tudo infinito), evita divisão por zero
        const globalOccupancy = totalSlots > 0 ? Math.round((totalMembers / totalSlots) * 100) : 0;

        return { totalMembers, activeLeaders, mostPopulated, globalOccupancy, orgsData };
    }, [members]);

    const leadersList = useMemo(() => {
        return members.filter(m => m.isLeader).map(l => ({
            name: l.name,
            orgName: ORG_CONFIG[l.org]?.name || l.org,
            avatar: ORG_CONFIG[l.org]?.icon || 'Shield'
        }));
    }, [members]);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            
            {/* --- SEÇÃO DE RESUMO (SUMMARY) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total de Membros */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={64} />
                    </div>
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total de Ninjas</p>
                        <p className="text-3xl font-black text-white">{stats.totalMembers}</p>
                    </div>
                </div>

                {/* Líderes Ativos */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Crown size={64} />
                    </div>
                    <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-xl">
                        <Crown size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Líderes em Comando</p>
                        <p className="text-3xl font-black text-white">{stats.activeLeaders} <span className="text-sm text-slate-500 font-normal">/ {Object.keys(ORG_CONFIG).length}</span></p>
                    </div>
                </div>

                {/* Ocupação Global (Apenas se houver limites definidos) */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} />
                    </div>
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Vagas Ocupadas</p>
                        <p className="text-3xl font-black text-white">
                            {stats.totalSlots > 0 ? `${stats.globalOccupancy}%` : 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Maior Organização */}
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-lg flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={64} />
                    </div>
                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Maior Organização</p>
                        <p className="text-lg font-bold text-white truncate max-w-[150px]">
                            {stats.mostPopulated[0]?.name || 'Nenhuma'}
                        </p>
                        <p className="text-xs text-purple-300">
                            {stats.mostPopulated[0]?.count || 0} membros
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* --- CARDS DAS ORGANIZAÇÕES (Principal) --- */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(ORG_CONFIG).map(org => {
                        const orgMembers = members.filter(m => m.org === org.id);
                        const count = orgMembers.length;
                        const limit = org.limit;
                        const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : Icons.Shield;
                        
                        // Cálculo de cor de progresso
                        let progressColor = 'bg-emerald-500';
                        let percentage = 0;
                        let progressLabel = 'Livre';
                        
                        if (limit) {
                            percentage = (count / limit) * 100;
                            if (percentage >= 100) { progressColor = 'bg-red-500'; progressLabel = 'Cheio'; }
                            else if (percentage >= 80) { progressColor = 'bg-yellow-500'; progressLabel = 'Alto'; }
                        } else {
                            progressLabel = '∞';
                        }

                        return (
                            <div 
                                key={org.id}
                                onClick={() => onTabChange(org.id)}
                                className={`group relative overflow-hidden rounded-2xl border ${org.border} ${org.bgColor} p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-${org.color.split('-')[1]}-900/20 flex flex-col justify-between min-h-[180px]`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl bg-slate-900/60 backdrop-blur-sm ${org.color} shadow-lg`}>
                                            {React.createElement(IconComp, { size: 28 })}
                                        </div>
                                        {limit !== null && (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded bg-black/40 border border-white/10 ${percentage >= 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {progressLabel}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className={`text-xl font-bold text-white mb-1 group-hover:${org.color} transition-colors`}>{org.name}</h3>
                                    
                                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                                        <Users size={14} className="text-slate-500"/>
                                        <span className="font-mono">
                                            <strong className="text-white">{count}</strong>
                                            {limit !== null && <span className="text-slate-500"> / {limit}</span>}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    {/* BARRA DE PROGRESSO */}
                                    {limit !== null && (
                                        <div className="w-full h-1.5 bg-slate-900/50 rounded-full overflow-hidden mt-4 mb-3">
                                            <div 
                                                className={`h-full ${progressColor} transition-all duration-700 ease-out`} 
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* LÍDER ATUAL */}
                                    {orgMembers.find(m => m.isLeader) ? (
                                        <div className="pt-3 border-t border-white/10 flex items-center gap-2 animate-fade-in">
                                            <Crown size={14} className="text-yellow-500" />
                                            <span className="text-xs text-yellow-100 font-medium truncate">
                                                {orgMembers.find(m => m.isLeader).name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="pt-3 border-t border-white/5 flex items-center gap-2 opacity-50">
                                            <AlertCircle size={14} />
                                            <span className="text-xs italic">Sem líder designado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- COLUNA LATERAL (Info Extra) --- */}
                <div className="space-y-6">
                    
                    {/* Lista Rápida de Líderes */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Crown size={16} className="text-yellow-500"/> Hierarquia Atual
                        </h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto scroll-custom pr-2">
                            {leadersList.length > 0 ? leadersList.map((leader, idx) => {
                                const IconL = Icons[leader.avatar] || Icons.Shield;
                                return (
                                    <div key={idx} className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                                        <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                            <IconL size={14} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-white truncate">{leader.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{leader.orgName}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-xs text-slate-500 italic text-center py-4">Nenhum líder registrado.</p>
                            )}
                        </div>
                    </div>

                    {/* Multi-Org Users (Se houver) */}
                    {multiOrgUsers.length > 0 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                <Star size={16} /> Multi-Funções
                            </h4>
                            <div className="space-y-3 max-h-[250px] overflow-y-auto scroll-custom pr-2">
                                {multiOrgUsers.map((u, idx) => (
                                    <div key={idx} className="bg-slate-900/80 p-3 rounded border border-slate-700">
                                        <span className="text-xs font-bold text-white block mb-2">{u.name}</span>
                                        <div className="flex flex-wrap gap-1">
                                            {u.orgs.map((o, i) => (
                                                <span key={i} className="text-[9px] px-1.5 py-0.5 bg-cyan-900/30 text-cyan-200 border border-cyan-700/50 rounded">
                                                    {o}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
