import React, { useState, useMemo, useEffect } from 'react';
import { Settings, ShieldCheck, UserCog, Star, Trash2, Eye, ChevronDown, ChevronUp, Database, RefreshCw, Activity, CheckCircle, Circle, X } from 'lucide-react';
import { ORG_CONFIG, Icons } from '../config/constants.js';

const SettingsModal = ({ 
    roleConfig, leaderRoleConfig, secLeaderRoleConfig, accessConfig, 
    discordRoles, discordRoster, onClose, onSave, canManageSettings, onSimulate,
    onSyncHistory 
}) => {
    const [localRoleConfig, setLocalRoleConfig] = useState(roleConfig || {});
    const [localLeaderRoleConfig, setLocalLeaderRoleConfig] = useState(leaderRoleConfig || {});
    const [localSecLeaderRoleConfig, setLocalSecLeaderRoleConfig] = useState(secLeaderRoleConfig || {});
    const [localAccessConfig, setLocalAccessConfig] = useState(accessConfig || {});
    
    // Estado para controlar expansão de organizações com mapeamento complexo
    const [expandedOrgs, setExpandedOrgs] = useState({});

    // ESTADOS DE SIMULAÇÃO
    const [simSelectedRoles, setSimSelectedRoles] = useState([]);
    const [simSearchTerm, setSimSearchTerm] = useState("");

    const [activeTab, setActiveTab] = useState('roles');
    const [vipSelection, setVipSelection] = useState("");

    // --- NOVA LÓGICA: IDENTIFICAR CARGOS CONFIGURADOS ---
    // Cria um Set com todos os IDs de cargos que são usados em alguma configuração
    const configuredRoleIds = useMemo(() => {
        const ids = new Set();
        
        // Adiciona cargos de Organizações (Membros, Líderes, Secundários)
        Object.values(localRoleConfig).forEach(id => id && ids.add(id));
        Object.values(localLeaderRoleConfig).forEach(id => id && ids.add(id));
        Object.values(localSecLeaderRoleConfig).forEach(id => id && ids.add(id));

        // Adiciona cargos de Permissões (Mizukami, Conselho, Moderador)
        if (localAccessConfig.kamiRoleId) ids.add(localAccessConfig.kamiRoleId);
        if (localAccessConfig.councilRoleId) ids.add(localAccessConfig.councilRoleId);
        if (localAccessConfig.moderatorRoleId) ids.add(localAccessConfig.moderatorRoleId);

        return ids;
    }, [localRoleConfig, localLeaderRoleConfig, localSecLeaderRoleConfig, localAccessConfig]);

    const handleAddVip = () => {
        if (!vipSelection) return;
        const newVipIds = [...new Set([...(localAccessConfig.vipIds || []), vipSelection])];
        setLocalAccessConfig({ ...localAccessConfig, vipIds: newVipIds });
        setVipSelection("");
    };

    const handleRemoveVip = (id) => {
        const newVipIds = (localAccessConfig.vipIds || []).filter(v => v !== id);
        setLocalAccessConfig({ ...localAccessConfig, vipIds: newVipIds });
    };

    const toggleOrgExpansion = (orgId) => {
        setExpandedOrgs(prev => ({...prev, [orgId]: !prev[orgId]}));
    };

    // LÓGICA DE SIMULAÇÃO
    const toggleSimRole = (roleId) => {
        setSimSelectedRoles(prev => 
            prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
        );
    };

    const handleStartSimulation = () => {
        // Cria um nome descritivo baseado nos cargos selecionados
        let simName = "Visitante Simulado";
        if (simSelectedRoles.length > 0) {
            const roleNames = simSelectedRoles
                .map(rid => discordRoles.find(r => r.id === rid)?.name)
                .filter(Boolean)
                .slice(0, 2); // Pega os 2 primeiros para não ficar gigante
            
            simName = roleNames.join(" & ") + (simSelectedRoles.length > 2 ? "..." : "");
        }

        onSimulate({ 
            id: 'simulated-user', 
            name: simName, 
            roles: simSelectedRoles 
        });
    };

    const handleStopSimulation = () => {
        onSimulate(null); // Envia null para parar a simulação
        // Não fechamos o modal para permitir nova escolha, mas o App.js pode recarregar
    };

    // FILTRO DE CARGOS PARA SIMULAÇÃO (APENAS CONFIGURADOS)
    const filteredSimRoles = useMemo(() => {
        return discordRoles
            .filter(r => configuredRoleIds.has(r.id)) // <--- FILTRO PRINCIPAL
            .filter(r => r.name.toLowerCase().includes(simSearchTerm.toLowerCase()));
    }, [discordRoles, simSearchTerm, configuredRoleIds]);

    const handleSave = () => {
        onSave({
            roleConfig: localRoleConfig,
            leaderRoleConfig: localLeaderRoleConfig,
            secLeaderRoleConfig: localSecLeaderRoleConfig,
            accessConfig: localAccessConfig
        });
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                <div className="flex border-b border-slate-700">
                    <button onClick={() => setActiveTab('roles')} className={`flex-1 p-4 font-bold text-sm ${activeTab === 'roles' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-400 hover:text-white bg-slate-900/50'}`}>
                        <Settings size={16} className="inline mr-2"/> Cargos
                    </button>
                    <button onClick={() => setActiveTab('permissions')} className={`flex-1 p-4 font-bold text-sm ${activeTab === 'permissions' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-white bg-slate-900/50'}`}>
                        <ShieldCheck size={16} className="inline mr-2"/> Acesso
                    </button>
                    <button onClick={() => setActiveTab('system')} className={`flex-1 p-4 font-bold text-sm ${activeTab === 'system' ? 'text-orange-400 border-b-2 border-orange-400 bg-slate-800' : 'text-slate-400 hover:text-white bg-slate-900/50'}`}>
                        <Activity size={16} className="inline mr-2"/> Sistema
                    </button>
                </div>

                <div className="p-6 overflow-y-auto scroll-custom">
                    {/* ABA ROLES (Preservada) */}
                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            {Object.values(ORG_CONFIG).map(org => {
                                const IconComp = (Icons && org.icon && Icons[org.icon]) ? Icons[org.icon] : (Icons?.Shield);
                                const isExpanded = expandedOrgs[org.id];

                                return (
                                    <div key={org.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                        <h3 className={`text-sm uppercase font-bold ${org.color} mb-3 flex items-center gap-2`}>
                                            {React.createElement(IconComp || 'span', {size: 16})} {org.name}
                                        </h3>
                                        
                                        {org.useInternalRoleMapping ? (
                                            <div>
                                                <div 
                                                    className="flex justify-between items-center cursor-pointer bg-slate-800 p-2 rounded border border-slate-600 mb-2"
                                                    onClick={() => toggleOrgExpansion(org.id)}
                                                >
                                                    <span className="text-xs text-slate-300">Configurar {org.internalRoles.length} Cargos Individuais</span>
                                                    {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </div>
                                                
                                                {isExpanded && (
                                                    <div className="grid grid-cols-1 gap-4 mt-3 pl-2 border-l-2 border-slate-700 animate-fade-in">
                                                        {org.internalRoles.map(internalRole => {
                                                            const configKey = `${org.id}_${internalRole}`;
                                                            return (
                                                                <div key={configKey} className="bg-slate-900/30 p-2 rounded border border-slate-700/50">
                                                                    <label className="text-xs text-cyan-400 font-bold block mb-2">{internalRole}</label>
                                                                    
                                                                    <div className={`grid ${org.allowSecondaryRole ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-[10px] text-slate-500 mb-1">Principal</span>
                                                                            <select 
                                                                                className="bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs outline-none focus:border-cyan-500"
                                                                                value={localRoleConfig[configKey] || ""}
                                                                                onChange={(e) => setLocalRoleConfig({...localRoleConfig, [configKey]: e.target.value})}
                                                                            >
                                                                                <option value="">-- Selecione --</option>
                                                                                {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                                                            </select>
                                                                        </div>
                                                                        {org.allowSecondaryRole && (
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[10px] text-slate-500 mb-1">Secundário</span>
                                                                                <select 
                                                                                    className="bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs outline-none focus:border-cyan-500"
                                                                                    value={localSecLeaderRoleConfig[configKey] || ""}
                                                                                    onChange={(e) => setLocalSecLeaderRoleConfig({...localSecLeaderRoleConfig, [configKey]: e.target.value})}
                                                                                >
                                                                                    <option value="">-- Selecione --</option>
                                                                                    {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                                                                </select>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-xs text-slate-400">Cargo de Membro</label>
                                                    <select className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none" value={localRoleConfig[org.id] || ""} onChange={(e) => setLocalRoleConfig({...localRoleConfig, [org.id]: e.target.value})}>
                                                        <option value="">Selecione...</option>
                                                        {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-xs text-yellow-400">Líder</label>
                                                        <select className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none" value={localLeaderRoleConfig[org.id] || ""} onChange={(e) => setLocalLeaderRoleConfig({...localLeaderRoleConfig, [org.id]: e.target.value})}>
                                                            <option value="">Selecione...</option>
                                                            {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-xs text-blue-400">Secundário</label>
                                                        <select className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none" value={localSecLeaderRoleConfig[org.id] || ""} onChange={(e) => setLocalSecLeaderRoleConfig({...localSecLeaderRoleConfig, [org.id]: e.target.value})}>
                                                            <option value="">Selecione...</option>
                                                            {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ABA PERMISSIONS (Preservada) */}
                    {activeTab === 'permissions' && (
                        <div className="space-y-6">
                            <div className="bg-yellow-900/10 border border-yellow-600/30 p-4 rounded-lg mb-6">
                                <h3 className="text-yellow-400 font-bold flex items-center gap-2 mb-2"><ShieldCheck size={18}/> Área de Segurança</h3>
                                <p className="text-xs text-slate-400">Defina quais cargos do Discord têm permissão para gerenciar o painel. <br/><strong>Atenção:</strong> O Criador tem acesso total independente dos cargos.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <label className="text-sm font-bold text-purple-400 mb-2 block flex items-center gap-2"><UserCog size={16}/> Criador (Super Admin)</label>
                                    <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none" value={localAccessConfig.creatorId || ""} onChange={(e) => setLocalAccessConfig({...localAccessConfig, creatorId: e.target.value})}>
                                        <option value="">Selecione...</option>
                                        {discordRoster.map(u => (<option key={u.id} value={u.id}>{u.displayName || u.username}</option>))}
                                    </select>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <label className="text-sm font-bold text-amber-400 mb-2 block flex items-center gap-2"><Star size={16} fill="currentColor" /> VIPs</label>
                                    <div className="flex gap-2 mb-3">
                                        <select className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none" value={vipSelection} onChange={(e) => setVipSelection(e.target.value)}>
                                            <option value="">Selecione...</option>
                                            {discordRoster.filter(u => !(localAccessConfig.vipIds || []).includes(u.id)).map(u => (<option key={u.id} value={u.id}>{u.displayName || u.username}</option>))}
                                        </select>
                                        <button onClick={handleAddVip} disabled={!vipSelection} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded font-bold disabled:opacity-50">Adicionar</button>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto scroll-custom bg-slate-900/30 p-2 rounded">
                                        {(localAccessConfig.vipIds || []).map(vipId => {
                                            const vipUser = discordRoster.find(u => u.id === vipId);
                                            return (<div key={vipId} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700"><span className="text-sm text-white font-bold">{vipUser ? (vipUser.displayName || vipUser.username) : `ID: ${vipId}`}</span><button onClick={() => handleRemoveVip(vipId)} className="text-slate-400 hover:text-red-400 p-1"><Trash2 size={14} /></button></div>);
                                        })}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"><label className="text-sm font-bold text-red-400 mb-2 block">Mizukami</label><select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none" value={localAccessConfig.kamiRoleId || ""} onChange={(e) => setLocalAccessConfig({...localAccessConfig, kamiRoleId: e.target.value})}><option value="">Selecione...</option>{discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}</select></div>
                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"><label className="text-sm font-bold text-orange-400 mb-2 block">Conselho</label><select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none" value={localAccessConfig.councilRoleId || ""} onChange={(e) => setLocalAccessConfig({...localAccessConfig, councilRoleId: e.target.value})}><option value="">Selecione...</option>{discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}</select></div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"><label className="text-sm font-bold text-blue-400 mb-2 block">Moderador</label><select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none" value={localAccessConfig.moderatorRoleId || ""} onChange={(e) => setLocalAccessConfig({...localAccessConfig, moderatorRoleId: e.target.value})}><option value="">Selecione...</option>{discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}</select></div>
                            </div>
                        </div>
                    )}

                    {/* ABA SYSTEM (Modificada para Seleção de Cargos) */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            {/* SIMULAÇÃO REFORMULADA */}
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                                <h4 className="text-white font-bold flex items-center gap-2 mb-2">
                                    <Eye size={18} className="text-cyan-400"/> Simulação de Cargos
                                </h4>
                                <p className="text-xs text-slate-400 mb-4">
                                    Selecione abaixo os cargos que deseja "possuir" durante a simulação. 
                                    <br/>
                                    <span className="text-cyan-300">Nota:</span> Apenas cargos configurados no painel aparecem aqui.
                                </p>
                                
                                <div className="mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="Filtrar cargos..." 
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm outline-none focus:border-cyan-500"
                                        value={simSearchTerm}
                                        onChange={(e) => setSimSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto scroll-custom p-2 bg-slate-900/50 rounded border border-slate-700">
                                    {filteredSimRoles.map(role => {
                                        const isSelected = simSelectedRoles.includes(role.id);
                                        return (
                                            <div 
                                                key={role.id}
                                                onClick={() => toggleSimRole(role.id)}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border ${isSelected ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                                            >
                                                {isSelected ? <CheckCircle size={16} className="text-cyan-400 shrink-0"/> : <Circle size={16} className="text-slate-600 shrink-0"/>}
                                                <span className="text-xs font-bold truncate" style={{color: role.color !== '#000000' ? role.color : '#e2e8f0'}}>
                                                    {role.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {filteredSimRoles.length === 0 && <p className="text-xs text-slate-500 p-2 text-center col-span-2">Nenhum cargo configurado encontrado.</p>}
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">
                                            {simSelectedRoles.length} selecionados
                                        </span>
                                        {simSelectedRoles.length > 0 && (
                                            <button onClick={() => setSimSelectedRoles([])} className="text-[10px] text-red-400 hover:underline">
                                                (Limpar)
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleStopSimulation}
                                            className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded text-xs font-bold"
                                        >
                                            Parar
                                        </button>
                                        <button 
                                            onClick={handleStartSimulation}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                                        >
                                            <Eye size={14}/> Iniciar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* MANUTENÇÃO (Preservada) */}
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                                <h4 className="text-white font-bold flex items-center gap-2 mb-2">
                                    <Database size={18} className="text-orange-400"/> Manutenção de Dados
                                </h4>
                                <p className="text-xs text-slate-400 mb-4">
                                    Ferramentas para forçar atualização de dados caso o Bot tenha ficado offline.
                                </p>
                                
                                <div className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700">
                                    <div>
                                        <span className="text-sm font-bold text-white block">Sincronizar Histórico (Texto)</span>
                                        <span className="text-[10px] text-slate-500">Lê as últimas 2 semanas de todos os canais. (Lento)</span>
                                    </div>
                                    <button 
                                        onClick={onSyncHistory}
                                        className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <RefreshCw size={14} /> Forçar Sync
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                        {activeTab === 'system' ? 'Ações de sistema têm efeito imediato ou visual.' : 'Alterações salvam ao clicar.'}
                    </span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Fechar</button>
                        {activeTab !== 'system' && canManageSettings && (
                            <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold">Salvar Configuração</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
