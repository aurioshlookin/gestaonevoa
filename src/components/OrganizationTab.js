import React, { useState } from 'react';
import { 
    BookOpen, ChevronUp, ChevronDown, UserPlus, ArrowUp, ArrowDown, ArrowUpDown, 
    AlertCircle, Crown, Trash2, ArrowLeft, RotateCcw, VenetianMask, RefreshCw 
} from 'lucide-react';
import { ORG_CONFIG, MASTERIES, Icons } from '../config/constants.js';
import { getActivityStats, formatDate, getMemberOrgsInfo } from '../utils/helpers.js';

// Helper para renderizar ícone do cargo
const RoleIcon = ({ roleId, discordRoles, fallbackText }) => {
    if (!discordRoles) return <span className="text-slate-300 text-sm">{fallbackText}</span>;
    
    // Tenta achar o role pelo ID
    const role = discordRoles.find(r => r.id === roleId);
    
    // Se achou e tem ícone
    if (role) {
        return (
            <div className="flex items-center gap-1.5" title={role.name}>
                {role.icon ? (
                    <img src={role.icon} alt="" className="w-5 h-5 object-contain" />
                ) : role.unicodeEmoji ? (
                    <span className="text-base leading-none">{role.unicodeEmoji}</span>
                ) : null}
                <span className="text-slate-300 text-sm" style={{ color: role.color !== '#000000' ? role.color : undefined }}>
                    {fallbackText || role.name}
                </span>
            </div>
        );
    }

    // Fallback se não achou cargo ou sem ID
    return <span className="text-slate-300 text-sm">{fallbackText}</span>;
};

const OrganizationTab = ({ 
    orgId, members, discordRoles, leaderRoleConfig, roleConfig, canManage, 
    onOpenCreate, onEditMember, onDeleteMember, onToggleLeader,
    onBack
}) => {
    const [showRoleDetails, setShowRoleDetails] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'ascending' });

    const orgConfig = ORG_CONFIG[orgId];
    const safeMembers = Array.isArray(members) ? members : [];
    const orgMembers = safeMembers.filter(m => m.org === orgId);
    
    const isAnbu = orgId === 'divisao-especial';
    
    // Configurações visuais específicas
    const isClanLeaders = orgId === 'lideres-clas';
    // Oculta coluna de líder para Promoções e Líderes de Clã (pois lá a liderança é implícita no cargo)
    const showLeaderColumn = orgId !== 'promocoes' && !isClanLeaders;

    // Helper para abrir modal com cargo do Discord correto
    const handleOpenClanAction = (ninRole) => {
        // Tenta encontrar o ID do cargo do Discord mapeado para este cargo interno
        // A chave no roleConfig geralmente é "orgId_ninRole" para mapeamentos internos
        const mappingKey = `${orgId}_${ninRole}`;
        const mappedDiscordRoleId = roleConfig && roleConfig[mappingKey];
        
        onOpenCreate({ 
            ninRole: ninRole, 
            isLeader: true,
            specificRoleId: mappedDiscordRoleId || "" // Preenche se achar, senão vazio
        });
    };

    // --- LÓGICA ESPECÍFICA PARA LISTAGEM DE CLÃS (TABELA FIXA) ---
    // Se for Lideres de Clã, usamos a lista de cargos interna para garantir que todos apareçam (mesmo vagos)
    // Isso permite mostrar o botão "Definir Líder" onde não tem ninguém.
    const displayList = isClanLeaders 
        ? orgConfig.internalRoles.map(role => {
            const member = orgMembers.find(m => m.ninRole === role);
            return member || { id: `vago-${role}`, ninRole: role, isVacant: true };
        })
        : orgMembers; // Para outras orgs, usa a lista normal de membros

    // --- LÓGICA PADRÃO PARA TODAS ORGS ---

    const getRoleRank = (member) => { const roles = orgConfig.internalRoles || []; return roles.indexOf(member.ninRole); };
    
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                direction = 'descending';
            } else if (sortConfig.direction === 'descending') {
                setSortConfig({ key: 'rank', direction: 'ascending' }); 
                return;
            }
        }
        setSortConfig({ key, direction });
    };

    const resetSort = () => {
        setSortConfig({ key: 'rank', direction: 'ascending' });
    };

    // Ordenação (Aplicada apenas se NÃO for ClanLeaders, pois eles seguem a ordem fixa dos cargos)
    const sortedMembers = isClanLeaders ? displayList : [...displayList].sort((a, b) => {
        const sortByRank = () => {
            if (orgId === 'sete-laminas') {
                if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
                const dateA = new Date(a.joinDate || '9999-12-31').getTime();
                const dateB = new Date(b.joinDate || '9999-12-31').getTime();
                return dateA - dateB;
            }
            if (['unidade-medica', 'forca-policial', 'divisao-especial'].includes(orgId)) {
                if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1;
                const rankA = getRoleRank(a);
                const rankB = getRoleRank(b);
                if (rankA !== rankB) return rankB - rankA; 
                const dateA = new Date(a.joinDate || '9999-12-31').getTime();
                const dateB = new Date(b.joinDate || '9999-12-31').getTime();
                return dateA - dateB;
            }
            const rankA = getRoleRank(a);
            const rankB = getRoleRank(b);
            if (rankA !== rankB) return rankB - rankA;
            return (b.isLeader ? 1 : 0) - (a.isLeader ? 1 : 0);
        };

        if (sortConfig.key === 'rank' || sortConfig.key === 'ninRole') {
            const res = sortByRank();
            return sortConfig.direction === 'ascending' ? res : -res;
        }
        
        if (sortConfig.key === 'activity') {
            const actA = getActivityStats(a).total;
            const actB = getActivityStats(b).total;
            return sortConfig.direction === 'ascending' ? actA - actB : actB - actA;
        }

        let av = a[sortConfig.key];
        let bv = b[sortConfig.key];
        
        if (sortConfig.key === 'name') {
            av = a.rpName || a.name;
            bv = b.rpName || b.name;
        }

        if (sortConfig.key === 'codinome') {
            av = a.codinome || '';
            bv = b.codinome || '';
        }

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

    const SortIcon = ({k}) => {
        if (sortConfig.key !== k) return <ArrowUpDown size={14} className="opacity-30 ml-1 inline"/>;
        return sortConfig.direction === 'ascending' 
            ? <ArrowUp size={14} className="text-cyan-400 inline"/> 
            : <ArrowDown size={14} className="text-cyan-400 inline"/>;
    };

    const IconComp = (Icons && orgConfig?.icon && Icons[orgConfig.icon]) ? Icons[orgConfig.icon] : Icons.Shield;
    const ArrowLeftIcon = (Icons && Icons.ArrowLeft) ? Icons.ArrowLeft : ArrowUpDown;

    return (
        <div className="animate-fade-in">
            {/* Header Padrão */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm group"
                    >
                        <ArrowLeftIcon size={18} className="group-hover:-translate-x-1 transition-transform"/>
                        <span>Voltar</span>
                    </button>
                    
                    <div className={`p-3 rounded-lg ${orgConfig.bgColor} ${orgConfig.color}`}>
                        {React.createElement(IconComp)}
                    </div>
                    <h2 className="text-3xl font-bold mist-title text-white">{orgConfig.name}</h2>
                </div>
                {orgConfig.limit > 0 && (
                    <span className={`text-2xl font-bold ${orgMembers.length >= orgConfig.limit ? 'text-red-400' : 'text-emerald-400'}`}>
                        {orgMembers.length} / {orgConfig.limit}
                    </span>
                )}
            </div>

            <div className="flex justify-between items-end mb-4">
                <div className="flex gap-2">
                    {orgConfig.roleDetails && (
                        <button onClick={() => setShowRoleDetails(!showRoleDetails)} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                            <BookOpen size={16}/> Cargos {showRoleDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                    )}
                    <button onClick={resetSort} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors" title="Resetar Ordenação">
                        <RotateCcw size={16}/> Resetar Ordem
                    </button>
                </div>

                {/* BOTÃO ADICIONAR MEMBRO (Oculto para Líderes de Clã) */}
                {canManage && !isClanLeaders && (
                    <button onClick={() => onOpenCreate()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 text-sm">
                        <UserPlus size={18} /> Adicionar Membro
                    </button>
                )}
            </div>

            {showRoleDetails && (
                <div className="mb-6 bg-slate-900/50 border border-slate-700 rounded-lg p-4 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orgConfig.roleDetails.map((role, idx) => (
                        <div key={idx} className="flex flex-col border-l-2 border-slate-600 pl-3">
                            <span className="text-sm font-bold text-cyan-400">{role.name}</span>
                            <span className="text-xs text-slate-400">{role.desc}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                        <tr>
                            {/* Ajuste de Colunas: Se for Clã, a primeira coluna é fixa "Cargo do Clã" */}
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => !isClanLeaders && requestSort('role')}>
                                {isClanLeaders ? 'Cargo / Clã' : <>Cargo <SortIcon k="role"/></>}
                            </th>

                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => !isClanLeaders && requestSort('name')}>Nome <SortIcon k="name"/></th>
                            
                            {isAnbu && (
                                <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('codinome')}>
                                    Codinome <SortIcon k="codinome"/>
                                </th>
                            )}

                            {/* Se for Clã, não precisa de coluna NinRole separada pois já é o cargo principal */}
                            {!isClanLeaders && <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('ninRole')}>Nin <SortIcon k="ninRole"/></th>}
                            
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => !isClanLeaders && requestSort('joinDate')}>Entrada <SortIcon k="joinDate"/></th>
                            <th className="p-4 cursor-pointer hover:text-white" onClick={() => !isClanLeaders && requestSort('activity')}>Atividade <SortIcon k="activity"/></th>
                            
                            {showLeaderColumn && (
                                <th className="p-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('isLeader')}>Líder <SortIcon k="isLeader"/></th>
                            )}
                            
                            {canManage && <th className="p-4 text-right">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {sortedMembers.map((member) => {
                            // Se for vago (apenas para Clãs)
                            if (member.isVacant) {
                                return (
                                    <tr key={member.id} className="hover:bg-slate-800/30 bg-slate-900/10 border-l-4 border-l-slate-700/50">
                                        <td className="p-4">
                                            <span className="font-bold text-slate-500">{member.ninRole}</span>
                                        </td>
                                        <td className="p-4" colSpan={isAnbu ? 4 : 3}>
                                            <span className="text-slate-600 italic flex items-center gap-2">
                                                <AlertCircle size={14}/> Cargo Vago
                                            </span>
                                        </td>
                                        {canManage && (
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleOpenClanAction(member.ninRole)}
                                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 ml-auto shadow-sm"
                                                >
                                                    <UserPlus size={14}/> Definir Líder
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            }

                            const leaderRoleId = leaderRoleConfig[member.org];
                            const leaderRoleName = member.isLeader && leaderRoleId ? discordRoles.find(r => r.id === leaderRoleId)?.name : null;
                            const memberMasteries = member.masteries || [];
                            const activity = getActivityStats(member);
                            const orgInfo = getMemberOrgsInfo(safeMembers, member.discordId);

                            // Encontrar o Role ID correto para exibir o ícone
                            let displayRoleId = member.specificRoleId;
                            
                            // Se for clã, tenta achar o cargo específico mapeado
                            if (isClanLeaders && !displayRoleId) {
                                displayRoleId = roleConfig[`${orgId}_${member.ninRole}`];
                            }

                            return (
                                <tr 
                                    key={member.id} 
                                    className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${member.isLeader ? 'bg-yellow-900/10' : ''}`} 
                                    onClick={() => onEditMember(member)} 
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            {isClanLeaders ? (
                                                // LISTA DE CLÃS: Tenta mostrar ícone do cargo do clã
                                                <RoleIcon roleId={displayRoleId} discordRoles={discordRoles} fallbackText={member.ninRole} />
                                            ) : (
                                                // OUTRAS ORGS:
                                                <>
                                                    <div className={`px-2 py-1 rounded text-xs font-bold border ${orgConfig.border} ${orgConfig.color} bg-opacity-10 inline-flex items-center gap-1`}>
                                                        {/* Ícone para o cargo de membro comum (se houver roleId configurado na org) */}
                                                        <RoleIcon roleId={displayRoleId} discordRoles={discordRoles} fallbackText={member.role} />
                                                    </div>
                                                    {leaderRoleName && (
                                                        <div className="px-2 py-1 rounded text-xs font-bold border border-yellow-500/50 text-yellow-400 bg-yellow-900/20 inline-flex items-center gap-1 mt-1">
                                                            <RoleIcon roleId={leaderRoleId} discordRoles={discordRoles} fallbackText={leaderRoleName} />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white flex items-center gap-2">
                                                {member.rpName || member.name}
                                                {orgInfo && (
                                                    <div className="text-yellow-400 cursor-help relative group" title={`Membro de: ${orgInfo.names}`} onClick={(e) => e.stopPropagation()}>
                                                        <AlertCircle size={14} />
                                                    </div>
                                                )}
                                            </span>
                                            {member.rpName && member.rpName !== member.name && (
                                                <span className="text-[10px] text-slate-500">Discord: {member.name}</span>
                                            )}

                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {memberMasteries.map(m => {
                                                    const mData = MASTERIES.find(mastery => mastery.id === m);
                                                    if (!mData) return null;
                                                    const IconM = (typeof mData.icon === 'object') ? mData.icon : ((Icons && Icons[mData.icon]) ? Icons[mData.icon] : Icons.Activity);
                                                    
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

                                    {isAnbu && (
                                        <td className="p-4">
                                            {member.codinome ? (
                                                <span className="text-purple-400 font-mono flex items-center gap-1">
                                                    <VenetianMask size={12}/> {member.codinome}
                                                </span>
                                            ) : <span className="text-slate-600">-</span>}
                                        </td>
                                    )}

                                    {!isClanLeaders && <td className="p-4"><span className="text-slate-300 text-sm">{member.ninRole}</span></td>}
                                    
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
                                    
                                    {showLeaderColumn && (
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
                                    )}

                                    {canManage && (
                                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                {/* BOTÃO TROCAR LÍDER (Apenas para Líderes de Clã) */}
                                                {isClanLeaders && (
                                                    <button 
                                                        onClick={() => handleOpenClanAction(member.ninRole)} 
                                                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/20 rounded transition-colors"
                                                        title="Trocar Líder"
                                                    >
                                                        <RefreshCw size={16} />
                                                    </button>
                                                )}

                                                <button onClick={() => onDeleteMember(member.id)} className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-900/20 rounded transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
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
