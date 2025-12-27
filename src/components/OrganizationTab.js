import React, { useState } from 'react';
import { BookOpen, ChevronUp, ChevronDown, UserPlus, ArrowUp, ArrowDown, ArrowUpDown, AlertCircle, Crown, Trash2 } from 'lucide-react';
import { ORG_CONFIG, MASTERIES, Icons } from '../config/constants.js';
import { getActivityStats, formatDate, getMemberOrgsInfo } from '../utils/helpers.js';

const OrganizationTab = ({ 
    orgId, members, discordRoles, leaderRoleConfig, canManage, 
    onOpenCreate, onEditMember, onDeleteMember, onToggleLeader,
    onBack // Prop para voltar ao dashboard
}) => {
    const [showRoleDetails, setShowRoleDetails] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'ascending' });

    const orgConfig = ORG_CONFIG[orgId];
    // Garante array seguro
    const safeMembers = Array.isArray(members) ? members : [];
    const orgMembers = safeMembers.filter(m => m.org === orgId);
    
    const getRoleRank = (member) => { const roles = orgConfig.internalRoles || []; return roles.indexOf(member.ninRole); };
    
    const requestSort = (key) => {
        setSortConfig({ 
            key, 
            direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' 
        });
    };

    const sortedMembers = [...orgMembers].sort((a, b) => {
        if (sortConfig.key === 'rank' || sortConfig.key === 'ninRole') {
            if (orgId === 'sete-laminas') {
                if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
                const dateA = new Date(a.joinDate || '9999-12-31').getTime();
                const dateB = new Date(b.joinDate || '9999-12-31').getTime();
                return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
            }
            if (['unidade-medica', 'forca-policial', 'divisao-especial'].includes(orgId)) {
                if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
                const rankA = getRoleRank(a);
                const rankB = getRoleRank(b);
                if (rankA !== rankB) return sortConfig.direction === 'ascending' ? rankB - rankA : rankA - rankB;
                const dateA = new Date(a.joinDate || '9999-12-31').getTime();
                const dateB = new Date(b.joinDate || '9999-12-31').getTime();
                return dateA - dateB;
            }
            const rankA = getRoleRank(a);
            const rankB = getRoleRank(b);
            if (rankA !== rankB) return sortConfig.direction === 'ascending' ? rankA - rankB : rankB - rankA;
            return (b.isLeader ? 1 : 0) - (a.isLeader ? 1 : 0);
        }
        
        if (sortConfig.key === 'activity') {
            const actA = getActivityStats(a).total;
            const actB = getActivityStats(b).total;
            return sortConfig.direction === 'ascending' ? actA - actB : actB - actA;
        }

        let av = a[sortConfig.key];
        let bv = b[sortConfig.key];
        
        if (sortConfig.key === 'joinDate') {
            const dateA = new Date(av || '1970-01-01');
            const dateB = new Date(bv || '1970-01-01');
            return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }

        if (typeof av === 'boolean') { av = av ? 1 : 0; bv = bv ? 1 : 0; }
        else if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
        if (av == null) av = ''; if (bv == null) bv = '';

        return av < bv ? (sortConfig.direction === 'ascending' ? -1 : 1) : (sortConfig.direction === 'ascending' ? 1 : -1);
    });

    const SortIcon = ({k}) => sortConfig.key !== k ? <ArrowUpDown size={14} className="opacity-30 ml-1"/> : (sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="text-cyan-400"/> : <ArrowDown size={14} className="text-cyan-400"/>);

    // Fallback seguro usando Icons ou ícone padrão
    const IconComp = (Icons && orgConfig?.icon && Icons[orgConfig.icon]) ? Icons[orgConfig.icon] : Icons.Shield;
    const ArrowLeftIcon = (Icons && Icons.ArrowLeft) ? Icons.ArrowLeft : ArrowUpDown; // Fallback se ArrowLeft não carregar

    return (
        <div className="animate-fade-in">
            {/* Header com Botão de Voltar */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="p-2 hover:bg-slate-700 rounded transition-colors text-white flex items-center gap-2"
                        title="Voltar ao Painel"
                    >
                        <ArrowLeftIcon size={20} />
                        <span className="hidden md:inline">Voltar</span>
                    </button>
                    
                    <div className={`p-3 rounded-lg ${orgConfig.bgColor} ${orgConfig.color}`}>
                        {React.createElement(IconComp)}
                    </div>
                    <h2 className="text-3xl font-bold mist-title text-white">{orgConfig.name}</h2>
                </div>
                <span className={`text-2xl font-bold ${orgMembers.length >= orgConfig.limit ? 'text-red-400' : 'text-emerald-400'}`}>
                    {orgMembers.length} / {orgConfig.limit}
                </span>
            </div>

            {orgConfig.roleDetails && (
                <div className="mb-6">
                    <button onClick={() => setShowRoleDetails(!showRoleDetails)} className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-3 flex justify-between items-center transition-all text-slate-300 hover:text-white">
                        <span className="font-bold flex items-center gap-2"><BookOpen size={18}/> Hierarquia & Cargos</span>
                        {showRoleDetails ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </button>
                    {showRoleDetails && (
                        <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded-lg p-4 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                            {orgConfig.roleDetails.map((role, idx) => (
                                <div key={idx} className="flex flex-col border-l-2 border-slate-600 pl-3">
                                    <span className="text-sm font-bold text-cyan-400">{role.name}</span>
                                    <span className="text-xs text-slate-400">{role.desc}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {canManage && (
                <div className="mb-6 flex justify-end">
                    <button onClick={onOpenCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                        <UserPlus size={20} /> Adicionar Novo Membro
                    </button>
                </div>
            )}

            <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('role')}>Cargo <SortIcon k="role"/></th>
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('name')}>Nome <SortIcon k="name"/></th>
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('ninRole')}>Nin <SortIcon k="ninRole"/></th>
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('joinDate')}>Entrada <SortIcon k="joinDate"/></th>
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('activity')}>Atividade <SortIcon k="activity"/></th>
                            <th className="p-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('isLeader')}>Líder <SortIcon k="isLeader"/></th>
                            {canManage && <th className="p-4 text-right">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {sortedMembers.map((member) => {
                            const leaderRoleId = leaderRoleConfig[member.org];
                            const leaderRoleName = member.isLeader && leaderRoleId ? discordRoles.find(r => r.id === leaderRoleId)?.name : null;
                            const memberMasteries = member.masteries || [];
                            const activity = getActivityStats(member);
                            
                            // Uso correto da função restaurada
                            const orgInfo = (typeof getMemberOrgsInfo !== 'undefined') ? getMemberOrgsInfo(safeMembers, member.discordId) : null;

                            return (
                                <tr 
                                    key={member.id} 
                                    className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${member.isLeader ? 'bg-yellow-900/10' : ''}`} 
                                    onClick={() => { if(canManage) onEditMember(member); }}
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${orgConfig.border} ${orgConfig.color} bg-opacity-10`}>{member.role}</span>
                                            {leaderRoleName && <span className="px-2 py-1 rounded text-xs font-bold border border-yellow-500/50 text-yellow-400 bg-yellow-900/20">{leaderRoleName}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white flex items-center gap-2">
                                                {member.name}
                                                {orgInfo && (
                                                    <div className="text-yellow-400 cursor-help relative group" title={`Membro de: ${orgInfo.names}`} onClick={(e) => e.stopPropagation()}>
                                                        <AlertCircle size={14} />
                                                    </div>
                                                )}
                                            </span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {memberMasteries.map(m => {
                                                    const mData = MASTERIES.find(mastery => mastery.id === m);
                                                    if (!mData) return null;
                                                    // Fallback seguro usando Icons ou o próprio objeto se disponível
                                                    const IconM = (typeof mData.icon === 'object') 
                                                        ? mData.icon 
                                                        : ((Icons && Icons[mData.icon]) ? Icons[mData.icon] : Icons.Activity);
                                                        
                                                    return (
                                                        <div key={m} className={`flex items-center gap-1 ${mData.color} bg-slate-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-${mData.color.split('-')[1]}-500/20`}>
                                                            {React.createElement(IconM, {size: 12})}
                                                            <span>{m}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-slate-300 text-sm">{member.ninRole}</span></td>
                                    <td className="p-4"><span className="text-slate-300 text-sm font-mono">{formatDate(member.joinDate)}</span></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2" title={`Últimas 2 semanas: ${activity.details.msgs} msgs / ${activity.details.voice} voz`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${activity.color} shadow-lg shadow-${activity.color}/50`}>
                                                <span className="text-lg">{activity.icon}</span>
                                            </div>
                                            <div className="flex flex-col w-24">
                                                <span className="text-[10px] uppercase font-bold text-slate-400">{activity.tier}</span>
                                                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                                                    <div className={`h-full ${activity.color}`} style={{ width: activity.width }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {canManage ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onToggleLeader(member); }} 
                                                className={`p-2 rounded-full transition-all ${member.isLeader ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-yellow-400'}`} 
                                                title={member.isLeader ? "Remover Liderança" : "Promover a Líder"}
                                            >
                                                <Crown size={18} fill={member.isLeader ? "currentColor" : "none"} />
                                            </button>
                                        ) : (
                                            member.isLeader && <Crown size={18} className="text-yellow-400 inline-block" fill="currentColor"/>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => onDeleteMember(member.id)} className="text-slate-500 hover:text-red-400 p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrganizationTab;
