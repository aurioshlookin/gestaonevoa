import React, { useState, useMemo } from 'react';
import { 
    ArrowLeft, UserPlus, Search, Shield, Trash2, Edit, Crown, 
    Activity, Zap, Users, BarChart3, ChevronUp, ChevronDown 
} from 'lucide-react';
import { ORG_CONFIG, Icons, STATS } from '../config/constants.js';
import { getActivityStats } from '../utils/helpers.js';

const OrganizationTab = ({ 
    orgId, members, discordRoles, leaderRoleConfig, 
    canManage, onOpenCreate, onEditMember, onDeleteMember, onToggleLeader, onBack 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'desc' });

    const org = ORG_CONFIG[orgId];
    const orgMembers = members.filter(m => m.org === orgId);
    const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : Icons.Shield;

    // --- ESTATÍSTICAS AVANÇADAS ---
    const orgStats = useMemo(() => {
        if (orgMembers.length === 0) return null;

        const totalMembers = orgMembers.length;
        const totalLevel = orgMembers.reduce((acc, m) => acc + (m.level || 1), 0);
        const avgLevel = Math.round(totalLevel / totalMembers);
        
        // Cálculo de Atividade Média (0-5)
        const totalActivityScore = orgMembers.reduce((acc, m) => acc + getActivityStats(m).score, 0);
        const avgActivity = (totalActivityScore / totalMembers).toFixed(1);

        // Poder Total (Soma dos Stats principais)
        const totalPower = orgMembers.reduce((acc, m) => {
            const statsSum = Object.values(m.stats || {}).reduce((a, b) => a + (parseInt(b)||0), 0);
            return acc + statsSum;
        }, 0);

        // Distribuição de Cargos
        const rolesDist = orgMembers.reduce((acc, m) => {
            const role = m.ninRole || 'Membro';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        return { totalMembers, avgLevel, avgActivity, totalPower, rolesDist };
    }, [orgMembers]);

    // --- FILTRO E ORDENAÇÃO ---
    const sortedMembers = useMemo(() => {
        let sortableItems = [...orgMembers];
        
        // 1. Filtro
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            sortableItems = sortableItems.filter(m => 
                m.name.toLowerCase().includes(lowerTerm) ||
                (m.rpName && m.rpName.toLowerCase().includes(lowerTerm)) ||
                (m.ninRole && m.ninRole.toLowerCase().includes(lowerTerm))
            );
        }

        // 2. Ordenação
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                if (sortConfig.key === 'name') {
                    aValue = a.rpName || a.name;
                    bValue = b.rpName || b.name;
                } else if (sortConfig.key === 'role') {
                    // Tenta ordenar pela hierarquia interna se disponível
                    const roles = org.internalRoles || [];
                    aValue = roles.indexOf(a.ninRole);
                    bValue = roles.indexOf(b.ninRole);
                    // Se não estiver na lista (ex: Membro genérico), joga pro final
                    if (aValue === -1) aValue = 999;
                    if (bValue === -1) bValue = 999;
                } else if (sortConfig.key === 'activity') {
                    aValue = getActivityStats(a).score;
                    bValue = getActivityStats(b).score;
                } else if (sortConfig.key === 'stats') {
                    aValue = Object.values(a.stats || {}).reduce((x, y) => x + (parseInt(y)||0), 0);
                    bValue = Object.values(b.stats || {}).reduce((x, y) => x + (parseInt(y)||0), 0);
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [orgMembers, searchTerm, sortConfig, org.internalRoles]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return <div className="w-4 h-4 opacity-0 group-hover:opacity-30"><ChevronDown size={14}/></div>;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>;
    };

    // Ocultar coluna de líder para Promoções
    const showLeaderColumn = orgId !== 'promocoes';

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* --- HEADER COM BANNER --- */}
            <div className={`relative overflow-hidden rounded-2xl border ${org.border} ${org.bgColor} p-8 shadow-2xl`}>
                <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10">
                    <ArrowLeft size={20} />
                </button>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-0">
                    <div className={`p-6 rounded-2xl bg-slate-900/50 ${org.color} shadow-inner border border-white/5`}>
                        {React.createElement(IconComp, { size: 64 })}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-4xl font-black text-white uppercase tracking-wider drop-shadow-md">{org.name}</h2>
                        <p className="text-slate-200 mt-2 text-lg font-light max-w-2xl">{org.roleDetails?.[0]?.desc || "Gestão e administração da organização."}</p>
                        
                        {/* Mini Stats no Header */}
                        {orgStats && (
                            <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                                <div className="px-3 py-1 bg-black/30 rounded-full border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
                                    <Users size={12} className="text-cyan-400"/> {orgStats.totalMembers} Membros
                                </div>
                                <div className="px-3 py-1 bg-black/30 rounded-full border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
                                    <Activity size={12} className="text-emerald-400"/> Atividade: {orgStats.avgActivity}/5.0
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CARDS DE ESTATÍSTICAS --- */}
            {orgStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Zap size={20}/></div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Poder Total</p>
                            <p className="text-xl font-bold text-white">{orgStats.totalPower}</p>
                        </div>
                    </div>
                    <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 shadow-lg flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><BarChart3 size={20}/></div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Nível Médio</p>
                            <p className="text-xl font-bold text-white">Lvl {orgStats.avgLevel}</p>
                        </div>
                    </div>
                    {/* Barra de Distribuição de Cargos */}
                    <div className="md:col-span-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1"><Shield size={12}/> Distribuição</p>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden bg-slate-700">
                            {Object.entries(orgStats.rolesDist).map(([role, count], idx) => {
                                const colors = ['bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500'];
                                const pct = (count / orgStats.totalMembers) * 100;
                                return (
                                    <div key={role} className={colors[idx % colors.length]} style={{ width: `${pct}%` }} title={`${role}: ${count}`} />
                                );
                            })}
                        </div>
                        <div className="flex gap-3 mt-2 overflow-x-auto pb-1 scroll-custom">
                            {Object.entries(orgStats.rolesDist).map(([role, count], idx) => (
                                <span key={role} className="text-[9px] text-slate-400 whitespace-nowrap">
                                    <span className="font-bold text-white">{count}</span> {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- BARRA DE CONTROLE --- */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg backdrop-blur-sm sticky top-2 z-20">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou cargo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                </div>
                {canManage && (
                    <button 
                        onClick={onOpenCreate}
                        className="w-full md:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:scale-105"
                    >
                        <UserPlus size={18} /> Adicionar
                    </button>
                )}
            </div>

            {/* --- TABELA DE MEMBROS --- */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                                <th 
                                    className="p-4 font-bold cursor-pointer hover:text-white hover:bg-slate-800 transition-colors group"
                                    onClick={() => requestSort('name')}
                                >
                                    <div className="flex items-center gap-1">Membro / RP {getSortIcon('name')}</div>
                                </th>
                                <th 
                                    className="p-4 font-bold text-center cursor-pointer hover:text-white hover:bg-slate-800 transition-colors group"
                                    onClick={() => requestSort('role')}
                                >
                                    <div className="flex items-center justify-center gap-1">Patente {getSortIcon('role')}</div>
                                </th>
                                <th 
                                    className="p-4 font-bold text-center cursor-pointer hover:text-white hover:bg-slate-800 transition-colors group"
                                    onClick={() => requestSort('activity')}
                                >
                                    <div className="flex items-center justify-center gap-1">Atividade {getSortIcon('activity')}</div>
                                </th>
                                <th 
                                    className="p-4 font-bold text-center cursor-pointer hover:text-white hover:bg-slate-800 transition-colors group"
                                    onClick={() => requestSort('stats')}
                                >
                                    <div className="flex items-center justify-center gap-1">Stats {getSortIcon('stats')}</div>
                                </th>
                                {showLeaderColumn && <th className="p-4 font-bold text-center">Liderança</th>}
                                {canManage && <th className="p-4 font-bold text-right">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {sortedMembers.length > 0 ? sortedMembers.map(member => {
                                const activity = getActivityStats(member);
                                return (
                                    <tr key={member.id} className="hover:bg-slate-700/40 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{member.rpName || member.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono">{member.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded bg-slate-900 border border-slate-600 text-xs font-mono ${member.isLeader ? 'text-yellow-300 border-yellow-900/50' : 'text-cyan-300'}`}>
                                                {member.ninRole || member.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex gap-1 mb-1 bg-slate-900/50 p-1 rounded-full">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i < activity.score ? 'bg-emerald-500 scale-110 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                                                    ))}
                                                </div>
                                                <span className={`text-[9px] uppercase font-bold ${
                                                    activity.tier === 'Lendário' ? 'text-purple-400' : 
                                                    activity.tier === 'Ativo' ? 'text-emerald-400' : 'text-slate-500'
                                                }`}>
                                                    {activity.tier}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="text-xs text-slate-400 flex justify-center gap-2 font-mono bg-slate-900/30 py-1 rounded">
                                                <span className="text-red-400 font-bold" title="Força">{member.stats?.Força || 0}</span>
                                                <span className="text-slate-600">|</span>
                                                <span className="text-emerald-400 font-bold" title="Agilidade">{member.stats?.Agilidade || 0}</span>
                                                <span className="text-slate-600">|</span>
                                                <span className="text-blue-400 font-bold" title="Chakra">{member.stats?.Chakra || 0}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Botão de Liderança (Condicional) */}
                                        {showLeaderColumn && (
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => canManage && onToggleLeader(member)}
                                                    disabled={!canManage}
                                                    className={`p-2 rounded-full transition-all ${
                                                        member.isLeader 
                                                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:scale-110 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                                        : 'text-slate-600 hover:text-slate-400 opacity-50 hover:opacity-100'
                                                    }`}
                                                    title={member.isLeader ? "Remover Liderança" : "Promover a Líder"}
                                                >
                                                    <Crown size={18} fill={member.isLeader ? "currentColor" : "none"} />
                                                </button>
                                            </td>
                                        )}

                                        {canManage && (
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <button 
                                                        onClick={() => onEditMember(member)}
                                                        className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteMember(member.id)}
                                                        className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                                        <Search size={32} className="opacity-20"/>
                                        <p>Nenhum membro encontrado com os filtros atuais.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrganizationTab;
