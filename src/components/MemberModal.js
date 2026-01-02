import React, { useState, useEffect } from 'react';
import { X, Crown, Calendar, Activity, Clock, Heart, Zap, User, VenetianMask } from 'lucide-react';
import { ORG_CONFIG, STATS, MASTERIES, Icons } from '../config/constants.js';
import { calculateMaxPoints, calculateStats, formatDateTime } from '../utils/helpers.js';

const MemberModal = ({ 
    member, orgId, isCreating, discordRoster, discordRoles, 
    onClose, onSave, canManage, isReadOnly,
    roleConfig, leaderRoleConfig, secLeaderRoleConfig,
    allMembers = [] 
}) => {
    // Inicializa o estado com os dados do membro ou valores padrão
    const orgDef = ORG_CONFIG[orgId];
    const isPromotions = orgId === 'promocoes';
    const isClanLeaders = orgId === 'lideres-clas'; 
    const isInternalMapping = orgDef?.useInternalRoleMapping;

    const [form, setForm] = useState({
        name: member?.name || '',
        rpName: member?.rpName || '',
        codinome: member?.codinome || '',
        discordId: member?.discordId || '',
        org: orgId,
        ninRole: member?.ninRole || orgDef?.internalRoles?.[0] || 'Membro',
        specificRoleId: member?.specificRoleId || '',
        isLeader: isClanLeaders ? true : (member?.isLeader || false),
        level: member?.level || 1,
        guildBonus: member?.guildBonus || false,
        masteries: member?.masteries || [],
        stats: member?.stats || { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 },
        joinDate: member?.joinDate || new Date().toISOString().split('T')[0],
        // Campos de Histórico (Invisíveis no formulário, mas preservados)
        dailyMessages: member?.dailyMessages || {},
        dailyVoice: member?.dailyVoice || {},
        activityStats: member?.activityStats || {}
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const maxPoints = calculateMaxPoints(form.level);
    const usedPoints = STATS.reduce((acc, stat) => acc + ((form.stats[stat] || 5) - 5), 0);
    const remainingPoints = maxPoints - usedPoints;
    const finalVitals = calculateStats(form.stats, form.guildBonus);
    
    const isAnbu = orgId === 'divisao-especial';

    // --- LÓGICA DE FILTRAGEM DE CARGOS ---
    const allowedRoleIds = new Set([
        roleConfig?.[orgId],
        leaderRoleConfig?.[orgId],
        secLeaderRoleConfig?.[orgId]
    ].filter(id => id));

    if (isInternalMapping && orgDef?.internalRoles) {
        orgDef.internalRoles.forEach(r => {
            const key = `${orgId}_${r}`;
            if (roleConfig?.[key]) allowedRoleIds.add(roleConfig[key]);
            if (leaderRoleConfig?.[key]) allowedRoleIds.add(leaderRoleConfig[key]);
            if (secLeaderRoleConfig?.[key]) allowedRoleIds.add(secLeaderRoleConfig[key]);
        });
    }

    const filteredRoles = (discordRoles || []).filter(r => {
        if (allowedRoleIds.size === 0) return true; 
        return allowedRoleIds.has(r.id) || r.id === form.specificRoleId;
    });

    const filteredRoster = (discordRoster || []).filter(u => 
        (u.displayName || u.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- UNIFICAÇÃO DE DADOS AO SELECIONAR USUÁRIO ---
    const handleSelectUser = (user) => {
        if (isReadOnly) return;
        
        // Tenta encontrar este usuário em outras organizações
        const existingData = allMembers.find(m => m.discordId === user.id);

        setForm(prev => ({ 
            ...prev, 
            name: user.displayName || user.username, 
            discordId: user.id,
            
            // Prioriza dados existentes se houver
            rpName: existingData?.rpName || prev.rpName || user.displayName || user.username,
            
            // Unifica Status, Maestrias, Nível e Bônus
            stats: existingData?.stats || prev.stats,
            masteries: existingData?.masteries || prev.masteries,
            level: existingData?.level || prev.level,
            guildBonus: existingData?.guildBonus !== undefined ? existingData.guildBonus : prev.guildBonus,
            codinome: existingData?.codinome || prev.codinome,

            // --- NOVO: Copia o histórico de atividade ---
            dailyMessages: existingData?.dailyMessages || prev.dailyMessages || {},
            dailyVoice: existingData?.dailyVoice || prev.dailyVoice || {},
            activityStats: existingData?.activityStats || prev.activityStats || {}
        }));

        setSearchTerm(user.displayName || user.username);
        setIsDropdownOpen(false);
    };

    const handleInternalRoleChange = (e) => {
        const newRole = e.target.value;
        let newSpecificRoleId = form.specificRoleId;

        if (isInternalMapping) {
            const configKey = `${orgId}_${newRole}`;
            const mappedRole = roleConfig?.[configKey];
            if (mappedRole) {
                newSpecificRoleId = mappedRole;
            }
        }

        setForm({ ...form, ninRole: newRole, specificRoleId: newSpecificRoleId });
    };

    const handleSpecificRoleChange = (e) => {
        const newRoleId = e.target.value;
        let updatedForm = { ...form, specificRoleId: newRoleId };

        if (isInternalMapping) {
            const matchingInternalRole = orgDef?.internalRoles.find(
                roleName => roleConfig?.[`${orgId}_${roleName}`] === newRoleId
            );

            if (matchingInternalRole) {
                updatedForm.ninRole = matchingInternalRole;
            } else {
                const roleObj = discordRoles.find(r => r.id === newRoleId);
                if (roleObj) updatedForm.ninRole = roleObj.name;
            }
        }
        setForm(updatedForm);
    };

    const updateStat = (stat, value) => {
        if (isReadOnly) return;
        const val = Math.max(0, parseInt(value) || 0);
        setForm({ ...form, stats: { ...form.stats, [stat]: val } });
    };

    const toggleMastery = (masteryId) => {
        if (isReadOnly) return;
        const current = form.masteries || [];
        if (current.includes(masteryId)) {
            setForm({ ...form, masteries: current.filter(m => m !== masteryId) });
        } else {
            if (current.length >= 2) return; 
            setForm({ ...form, masteries: [...current, masteryId] });
        }
    };

    const handleSave = () => {
        if (!isReadOnly) onSave(form);
    };

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-start bg-slate-900/50 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {isCreating ? "Novo Membro" : (form.rpName || form.name)}
                            {form.isLeader && <Crown size={20} className="text-yellow-400" />}
                            {isReadOnly && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded ml-2">Somente Leitura</span>}
                        </h2>
                        <p className="text-slate-400 text-sm font-mono">
                            {isCreating ? `Adicionando à ${orgDef?.name}` : `Ninja da ${orgDef?.name}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="p-4 overflow-y-auto scroll-custom grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Coluna Esquerda */}
                    <div className="space-y-4">
                        {isCreating && !isReadOnly && (
                            <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/30">
                                <label className="text-sm font-bold text-cyan-400 mb-2 block">Vincular Discord</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar usuário..." 
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 outline-none" 
                                        value={searchTerm} 
                                        onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }} 
                                        onFocus={() => setIsDropdownOpen(true)} 
                                        disabled={isReadOnly}
                                    />
                                    {isDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                            <div className="absolute z-20 w-full bg-slate-900 border border-slate-600 rounded-b-lg shadow-xl max-h-40 overflow-y-auto mt-1 scroll-custom">
                                                {filteredRoster.map(u => (
                                                    <div key={u.id} className="p-2 hover:bg-slate-800 cursor-pointer text-sm text-white" onClick={() => handleSelectUser(u)}>
                                                        {u.displayName || u.username} <span className="text-slate-500 text-xs">(@{u.username})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {form.name && <p className="text-xs text-emerald-400 mt-2">Vinculado: {form.name}</p>}
                            </div>
                        )}

                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
                            <div>
                                <label className="text-sm font-bold text-white mb-1 block flex items-center gap-2">
                                    <User size={14} className="text-cyan-400"/> Nome do Personagem (RP)
                                </label>
                                <input 
                                    type="text" 
                                    className={`w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder={form.name || "Nome no jogo"}
                                    value={form.rpName} 
                                    onChange={(e) => setForm({...form, rpName: e.target.value})} 
                                    disabled={isReadOnly}
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Este nome substituirá o do Discord na tabela.</p>
                            </div>
                            {isAnbu && (
                                <div>
                                    <label className="text-sm font-bold text-purple-400 mb-1 block flex items-center gap-2"><VenetianMask size={14}/> Codinome (ANBU)</label>
                                    <input 
                                        type="text" 
                                        className={`w-full bg-slate-800 border border-purple-500/50 rounded p-2 text-white outline-none focus:border-purple-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="Ex: Corvo"
                                        value={form.codinome} 
                                        onChange={(e) => setForm({...form, codinome: e.target.value})} 
                                        disabled={isReadOnly}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-cyan-400">Nível:</label>
                                <input type="number" min="1" max="60" className={`bg-slate-800 border border-slate-600 rounded w-16 p-1 text-center text-white font-bold ${isReadOnly ? 'opacity-50' : ''}`} value={form.level} onChange={(e) => setForm({...form, level: e.target.value})} disabled={isReadOnly} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                <input type="date" className={`bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs ${isReadOnly ? 'opacity-50' : ''}`} value={form.joinDate} onChange={(e) => setForm({...form, joinDate: e.target.value})} disabled={isReadOnly} />
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-slate-300 cursor-pointer select-none">Bônus (10%)</label>
                                <div onClick={() => !isReadOnly && setForm({...form, guildBonus: !form.guildBonus})} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${form.guildBonus ? 'bg-cyan-600' : 'bg-slate-700'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${form.guildBonus ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-white font-bold flex items-center gap-2"><Activity size={16}/> Atributos</h3>
                                    {!isCreating && member?.statsUpdatedAt && (<p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock size={10} /> Atualizado: {formatDateTime(member.statsUpdatedAt)}</p>)}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${remainingPoints < 0 ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-400'}`}>Pontos: {remainingPoints} / {maxPoints}</span>
                            </div>
                            <div className="space-y-3">
                                {(STATS || []).map(stat => (
                                    <div key={stat} className="flex items-center justify-between">
                                        <label className="text-sm text-slate-300 w-24">{stat}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="5" className={`bg-slate-800 border border-slate-600 rounded w-20 p-1 text-center text-cyan-400 font-bold font-mono outline-none focus:border-cyan-500 ${isReadOnly ? 'opacity-50' : ''}`} value={form.stats[stat] || 5} onChange={(e) => updateStat(stat, e.target.value)} disabled={isReadOnly} />
                                        </div>
                                        {form.guildBonus && <span className="text-xs text-emerald-400 font-mono w-8 text-right">({Math.floor((form.stats[stat] || 5) * 1.1)})</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-center"><Heart className="mx-auto text-red-500 mb-2" /><span className="text-2xl font-bold text-white">{finalVitals.hp}</span></div>
                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-center"><Zap className="mx-auto text-blue-500 mb-2" /><span className="text-2xl font-bold text-white">{finalVitals.cp}</span></div>
                        </div>
                    </div>

                    {/* Coluna Direita: Cargos e Maestrias */}
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-white font-bold mb-3">Cargos & Função</h3>
                            
                            {!isPromotions && (
                                <div className="mb-4">
                                    <label className="text-xs text-slate-400 mb-1 block">Cargo Nin Online / Patente</label>
                                    <select 
                                        className={`w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none ${isReadOnly ? 'opacity-50' : ''}`} 
                                        value={form.ninRole} 
                                        onChange={handleInternalRoleChange} 
                                        disabled={isReadOnly}
                                    >
                                        {orgDef?.internalRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="text-xs text-slate-400 mb-1 block">
                                    Cargo Específico Discord {isPromotions ? '' : '(Opcional)'}
                                </label>
                                <select 
                                    className={`w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none text-sm ${isReadOnly ? 'opacity-50' : ''}`} 
                                    value={form.specificRoleId} 
                                    onChange={handleSpecificRoleChange} 
                                    disabled={isReadOnly}
                                >
                                    {!isPromotions && <option value="">Padrão da Organização</option>}
                                    {filteredRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>

                            {/* Checkbox de líder (Escondido se for Clã) */}
                            {!isPromotions && !isClanLeaders && (
                                <div className="flex items-center gap-3 bg-slate-800 p-3 rounded border border-slate-600">
                                    <input type="checkbox" id="leaderCheck" checked={form.isLeader} onChange={(e) => setForm({...form, isLeader: e.target.checked})} disabled={isReadOnly} className={`w-4 h-4 text-cyan-600 rounded bg-gray-700 border-gray-600 ${isReadOnly ? 'opacity-50' : ''}`}/>
                                    <label htmlFor="leaderCheck" className="text-sm text-white font-bold cursor-pointer select-none flex items-center gap-2"><Crown size={14} className={form.isLeader ? "text-yellow-400" : "text-slate-500"}/> Líder da Organização?</label>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="text-white font-bold mb-4">Maestrias (Máx 2)</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {MASTERIES.map(m => {
                                    const isActive = form.masteries.includes(m.id);
                                    let IconComp = Activity;
                                    if (typeof m.icon === 'function' || typeof m.icon === 'object') {
                                        IconComp = m.icon;
                                    } else if (typeof Icons !== 'undefined' && Icons && Icons[m.icon]) {
                                        IconComp = Icons[m.icon];
                                    }

                                    return (
                                        <div key={m.id} onClick={() => toggleMastery(m.id)} className={`cursor-pointer p-3 rounded border flex items-center gap-3 transition-all ${isActive ? 'bg-slate-700 border-cyan-500/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50'} ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                            <div className={`${isActive ? 'text-white' : m.color}`}>
                                                {React.createElement(IconComp, {size: 18})}
                                            </div>
                                            <span className={`text-sm ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>{m.id}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                        {isReadOnly ? "Modo de Visualização (Somente Leitura)" : `${remainingPoints < 0 ? "⚠️ Pontos excedidos!" : "Distribuição válida."}`}
                    </span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">{isReadOnly ? "Fechar" : "Cancelar"}</button>
                        {canManage && !isReadOnly && (
                            <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-2 rounded font-bold shadow-lg shadow-cyan-500/20">
                                {isCreating ? "Adicionar Membro" : "Salvar Alterações"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
