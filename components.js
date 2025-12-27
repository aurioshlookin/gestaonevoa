import React, { useState } from 'react';
import { 
    X, Crown, Calendar, Activity, Heart, Zap, Clock, AlertTriangle, 
    Settings, ShieldCheck, UserCog, Star, Trash2
} from 'lucide-react';

// Inicializa namespace
window.AppComponents = {};

// Acessa globais
const { ORG_CONFIG, STATS, MASTERIES } = window.AppConfig;
const { calculateMaxPoints, calculateStats, formatDateTime } = window.AppServices;

// Componente para ícones de ordenação
window.AppComponents.SortIcon = ({k, sortConfig, ArrowUp, ArrowDown, ArrowUpDown}) => {
    if (sortConfig.key !== k) return <ArrowUpDown size={14} className="opacity-30 ml-1"/>;
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="text-cyan-400"/> : <ArrowDown size={14} className="text-cyan-400"/>;
};

// MODAL DE EDIÇÃO DE MEMBRO
window.AppComponents.EditMemberModal = ({ isCreating, editForm, setEditForm, selectedMember, setSelectedMember, handleSaveEdit, discordRoles, canManageOrg, filteredRoster, searchTerm, setSearchTerm, isDropdownOpen, setIsDropdownOpen, handleSelectUser }) => {
    
    const maxPoints = calculateMaxPoints(editForm.level);
    const usedPoints = STATS.reduce((acc, stat) => acc + (editForm.stats[stat] - 5), 0);
    const remainingPoints = maxPoints - usedPoints;
    const finalVitals = calculateStats(editForm.stats, editForm.guildBonus);

    const toggleMastery = (masteryId) => {
        const current = editForm.masteries || [];
        if (current.includes(masteryId)) setEditForm({...editForm, masteries: current.filter(m => m !== masteryId)});
        else setEditForm({...editForm, masteries: [...current, masteryId]});
    };

    const updateStat = (stat, value) => {
        const val = Math.max(0, parseInt(value) || 0); 
        const newStats = { ...editForm.stats, [stat]: val };
        setEditForm({ ...editForm, stats: newStats });
    };

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col max-h-[95vh]">
                <div className="p-4 border-b border-slate-700 flex justify-between items-start bg-slate-900/50 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {isCreating ? "Novo Membro" : editForm.name}
                            {editForm.isLeader && <Crown size={20} className="text-yellow-400" />}
                        </h2>
                        <p className="text-slate-400 text-sm font-mono">{isCreating ? `Adicionando à ${ORG_CONFIG[selectedMember.org].name}` : `Ninja da ${ORG_CONFIG[selectedMember.org].name}`}</p>
                    </div>
                    <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="p-4 overflow-y-auto scroll-custom grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        {isCreating && (
                            <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/30">
                                <label className="text-sm font-bold text-cyan-400 mb-2 block">Selecionar Usuário do Discord</label>
                                <div className="relative">
                                    <input type="text" placeholder="Digite para buscar..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }} onFocus={() => setIsDropdownOpen(true)} />
                                    {isDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                            <div className="absolute z-20 w-full bg-slate-900 border border-slate-600 rounded-b-lg shadow-xl max-h-40 overflow-y-auto mt-1 scroll-custom">
                                                {filteredRoster.map(u => (
                                                    <div key={u.id} className="p-2 hover:bg-slate-800 cursor-pointer text-sm text-white" onClick={() => handleSelectUser(u)}>{u.displayName || u.username} <span className="text-slate-500 text-xs">(@{u.username})</span></div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {editForm.name && <p className="text-xs text-emerald-400 mt-2">Selecionado: {editForm.name}</p>}
                            </div>
                        )}
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-cyan-400">Nível:</label>
                                <input type="number" min="1" max="60" className="bg-slate-800 border border-slate-600 rounded w-16 p-1 text-center text-white font-bold" value={editForm.level} onChange={(e) => setEditForm({...editForm, level: e.target.value})} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                <input type="date" className="bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs" value={editForm.joinDate || ""} onChange={(e) => setEditForm({...editForm, joinDate: e.target.value})} />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-slate-300 cursor-pointer select-none" htmlFor="bonusToggle">Bônus (10%)</label>
                                <div onClick={() => setEditForm({...editForm, guildBonus: !editForm.guildBonus})} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${editForm.guildBonus ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${editForm.guildBonus ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-white font-bold flex items-center gap-2"><Activity size={16}/> Atributos</h3>
                                    {!isCreating && selectedMember.statsUpdatedAt && (<p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock size={10} /> Atualizado em: {formatDateTime(selectedMember.statsUpdatedAt)}</p>)}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${remainingPoints < 0 ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-400'}`}>Pontos: {remainingPoints} / {maxPoints}</span>
                            </div>
                            <div className="space-y-3">
                                {STATS.map(stat => (
                                    <div key={stat} className="flex items-center justify-between">
                                        <label className="text-sm text-slate-300 w-24">{stat}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="5" className="bg-slate-800 border border-slate-600 rounded w-20 p-1 text-center text-cyan-400 font-bold font-mono outline-none focus:border-cyan-500" value={editForm.stats[stat]} onChange={(e) => updateStat(stat, e.target.value)} />
                                        </div>
                                        {editForm.guildBonus && <span className="text-xs text-emerald-400 font-mono w-8 text-right">({Math.floor(editForm.stats[stat] * 1.1)})</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-center"><Heart className="mx-auto text-red-500 mb-2" /><span className="text-2xl font-bold text-white">{finalVitals.hp}</span><p className="text-xs text-red-400 uppercase mt-1">Vida (HP)</p></div>
                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-center"><Zap className="mx-auto text-blue-500 mb-2" /><span className="text-2xl font-bold text-white">{finalVitals.cp}</span><p className="text-xs text-blue-400 uppercase mt-1">Chakra (CP)</p></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-white font-bold mb-3">Cargos & Função</h3>
                            <div className="mb-4">
                                <label className="text-xs text-slate-400 mb-1 block">Cargo Nin Online</label>
                                <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none" value={editForm.ninRole} onChange={(e) => setEditForm({...editForm, ninRole: e.target.value})}>
                                    {ORG_CONFIG[selectedMember.org].internalRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs text-slate-400 mb-1 block">Cargo Específico Discord (Opcional)</label>
                                <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none text-sm" value={editForm.specificRoleId || ""} onChange={(e) => setEditForm({...editForm, specificRoleId: e.target.value})}>
                                    <option value="">Padrão da Organização</option>
                                    {discordRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-800 p-3 rounded border border-slate-600">
                                <input type="checkbox" id="leaderCheck" checked={editForm.isLeader} onChange={(e) => setEditForm({...editForm, isLeader: e.target.checked})} className="w-4 h-4 text-cyan-600 rounded bg-gray-700 border-gray-600"/>
                                <label htmlFor="leaderCheck" className="text-sm text-white font-bold cursor-pointer select-none flex items-center gap-2"><Crown size={14} className={editForm.isLeader ? "text-yellow-400" : "text-slate-500"}/> Líder da Organização?</label>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-white font-bold mb-4">Maestrias</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {MASTERIES.map(m => {
                                    const isActive = editForm.masteries.includes(m.id);
                                    return (<div key={m.id} onClick={() => toggleMastery(m.id)} className={`cursor-pointer p-3 rounded border flex items-center gap-3 transition-all ${isActive ? 'bg-slate-700 border-cyan-500/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'}`}><div className={`${isActive ? 'text-white' : m.color}`}>{React.createElement(m.icon, {size: 18})}</div><span className={`text-sm ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>{m.id}</span></div>);
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-slate-500">{remainingPoints < 0 ? "⚠️ Pontos excedidos!" : "Distribuição válida."}</span>
                    <div className="flex gap-3">
                        <button onClick={() => setSelectedMember(null)} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                        {canManageOrg(selectedMember.org) && (
                            <button onClick={handleSaveEdit} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-2 rounded font-bold shadow-lg shadow-cyan-500/20">{isCreating ? "Adicionar Membro" : "Salvar Alterações"}</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
window.AppComponents.DeleteModal = ({ setDeleteConfirmation, handleRemoveMember, id }) => (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in text-center">
            <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
            <p className="text-slate-400 text-sm mb-6">Tem certeza? Isso removerá o registro e os cargos.</p>
            <div className="flex justify-center gap-3">
                <button onClick={() => setDeleteConfirmation(null)} className="px-4 py-2 text-slate-300">Cancelar</button>
                <button onClick={() => handleRemoveMember(id)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold">Excluir</button>
            </div>
        </div>
    </div>
);

// MODAL DE SETTINGS (PERMISSÕES E CARGOS)
window.AppComponents.SettingsModal = ({ setShowSettings, settingsTab, setSettingsTab, roleConfig, setRoleConfig, leaderRoleConfig, setLeaderRoleConfig, secLeaderRoleConfig, setSecLeaderRoleConfig, accessConfig, setAccessConfig, discordRoles, discordRoster, vipSelection, setVipSelection, handleAddVip, handleRemoveVip, handleSaveConfig, canManageSettings, Icons }) => (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex border-b border-slate-700">
                <button onClick={() => setSettingsTab('roles')} className={`flex-1 p-4 font-bold text-sm ${settingsTab === 'roles' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white bg-slate-900/50'}`}>
                    <Settings size={16} className="inline mr-2"/> Cargos das Organizações
                </button>
                <button onClick={() => setSettingsTab('permissions')} className={`flex-1 p-4 font-bold text-sm ${settingsTab === 'permissions' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-white bg-slate-900/50'}`}>
                    <ShieldCheck size={16} className="inline mr-2"/> Controle de Acesso (RBAC)
                </button>
            </div>

            <div className="p-6 overflow-y-auto scroll-custom">
                {settingsTab === 'roles' && (
                    <div className="space-y-6">
                        {Object.values(ORG_CONFIG).map(org => (
                            <div key={org.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <h3 className={`text-sm uppercase font-bold ${org.color} mb-3 flex items-center gap-2`}>{React.createElement(Icons[org.icon], {size: 16})} {org.name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-slate-400">Cargo de Membro (Padrão)</label>
                                        <select className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-cyan-500" value={roleConfig[org.id] || ""} onChange={(e) => setRoleConfig({...roleConfig, [org.id]: e.target.value})}>
                                            <option value="">Selecione...</option>
                                            {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-yellow-400">Cargo de Líder</label>
                                            <select className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-yellow-500" value={leaderRoleConfig[org.id] || ""} onChange={(e) => setLeaderRoleConfig({...leaderRoleConfig, [org.id]: e.target.value})}>
                                                <option value="">Selecione...</option>
                                                {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-blue-400">Secundário</label>
                                            <select className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-blue-500" value={secLeaderRoleConfig[org.id] || ""} onChange={(e) => setSecLeaderRoleConfig({...secLeaderRoleConfig, [org.id]: e.target.value})}>
                                                <option value="">Selecione...</option>
                                                {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {settingsTab === 'permissions' && (
                    <div className="space-y-6">
                        <div className="bg-yellow-900/10 border border-yellow-600/30 p-4 rounded-lg mb-6">
                            <h3 className="text-yellow-400 font-bold flex items-center gap-2 mb-2"><ShieldCheck size={18}/> Área de Segurança</h3>
                            <p className="text-xs text-slate-400">Defina quais cargos do Discord têm permissão para gerenciar o painel. <br/><strong>Atenção:</strong> O Criador tem acesso total independente dos cargos.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <label className="text-sm font-bold text-purple-400 mb-2 block flex items-center gap-2"><UserCog size={16}/> Criador (Super Admin - Acesso Absoluto)</label>
                                <div className="relative">
                                    <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-purple-500" value={accessConfig.creatorId || ""} onChange={(e) => setAccessConfig({...accessConfig, creatorId: e.target.value})}>
                                        <option value="">Selecione o Usuário Criador...</option>
                                        {discordRoster.map(u => (<option key={u.id} value={u.id}>{u.displayName || u.username}</option>))}
                                    </select>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Este usuário pode editar tudo, inclusive estas configurações.</p>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <label className="text-sm font-bold text-amber-400 mb-2 block flex items-center gap-2"><Star size={16} fill="currentColor" /> VIPs (Acesso Total)</label>
                                <div className="flex gap-2 mb-3">
                                    <select className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-amber-500" value={vipSelection} onChange={(e) => setVipSelection(e.target.value)}>
                                        <option value="">Selecione um usuário para adicionar...</option>
                                        {discordRoster.filter(u => !(accessConfig.vipIds || []).includes(u.id)).map(u => (<option key={u.id} value={u.id}>{u.displayName || u.username}</option>))}
                                    </select>
                                    <button onClick={handleAddVip} disabled={!vipSelection} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed">Adicionar</button>
                                </div>
                                <div className="space-y-2 max-h-40 overflow-y-auto scroll-custom bg-slate-900/30 p-2 rounded">
                                    {(accessConfig.vipIds || []).length === 0 ? (<p className="text-xs text-slate-500 italic text-center py-2">Nenhum VIP configurado.</p>) : (
                                        (accessConfig.vipIds || []).map(vipId => {
                                            const vipUser = discordRoster.find(u => u.id === vipId);
                                            return (
                                                <div key={vipId} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                                                    <span className="text-sm text-white font-bold">{vipUser ? (vipUser.displayName || vipUser.username) : `ID: ${vipId}`}</span>
                                                    <button onClick={() => handleRemoveVip(vipId)} className="text-slate-400 hover:text-red-400 p-1" title="Remover VIP"><Trash2 size={14} /></button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <label className="text-sm font-bold text-red-400 mb-2 block">Cargo Kage (Admin Global)</label>
                                    <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500" value={accessConfig.kamiRoleId || ""} onChange={(e) => setAccessConfig({...accessConfig, kamiRoleId: e.target.value})}>
                                        <option value="">Selecione Cargo...</option>
                                        {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <label className="text-sm font-bold text-orange-400 mb-2 block">Cargo Conselho (Admin Global)</label>
                                    <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-orange-500" value={accessConfig.councilRoleId || ""} onChange={(e) => setAccessConfig({...accessConfig, councilRoleId: e.target.value})}>
                                        <option value="">Selecione Cargo...</option>
                                        {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <label className="text-sm font-bold text-blue-400 mb-2 block">Cargo Moderador (Apenas Visualização)</label>
                                <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500" value={accessConfig.moderatorRoleId || ""} onChange={(e) => setAccessConfig({...accessConfig, moderatorRoleId: e.target.value})}>
                                    <option value="">Selecione Cargo...</option>
                                    {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex justify-between items-center">
                <span className="text-xs text-slate-500">Alterações afetam o acesso imediatamente.</span>
                <div className="flex gap-3">
                    <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                    {canManageSettings && (
                        <button onClick={handleSaveConfig} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold">Salvar Configuração</button>
                    )}
                </div>
            </div>
        </div>
    </div>
);
