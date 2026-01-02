import React, { useState } from 'react';
import { Settings, ShieldCheck, UserCog, Star, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { ORG_CONFIG, Icons } from '../config/constants.js';

const SettingsModal = ({ 
    roleConfig, leaderRoleConfig, secLeaderRoleConfig, accessConfig, 
    discordRoles, discordRoster, onClose, onSave, canManageSettings, onSimulate 
}) => {
    const [localRoleConfig, setLocalRoleConfig] = useState(roleConfig || {});
    const [localLeaderRoleConfig, setLocalLeaderRoleConfig] = useState(leaderRoleConfig || {});
    const [localSecLeaderRoleConfig, setLocalSecLeaderRoleConfig] = useState(secLeaderRoleConfig || {});
    const [localAccessConfig, setLocalAccessConfig] = useState(accessConfig || {});
    
    // Estado para controlar expansão de organizações com mapeamento complexo
    const [expandedOrgs, setExpandedOrgs] = useState({});

    const [activeTab, setActiveTab] = useState('roles');
    const [vipSelection, setVipSelection] = useState("");

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
                    <button onClick={() => setActiveTab('simulation')} className={`flex-1 p-4 font-bold text-sm ${activeTab === 'simulation' ? 'text-orange-400 border-b-2 border-orange-400 bg-slate-800' : 'text-slate-400 hover:text-white bg-slate-900/50'}`}>
                        <Eye size={16} className="inline mr-2"/> Simulação
                    </button>
                </div>

                <div className="p-6 overflow-y-auto scroll-custom">
                    {/* ABA ROLES */}
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
                                            // LÓGICA PARA MAPEAMENTO POR FUNÇÃO INTERNA (Clãs e Promoções)
                                            <div>
                                                <div 
                                                    className="flex justify-between items-center cursor-pointer bg-slate-800 p-2 rounded border border-slate-600 mb-2"
                                                    onClick={() => toggleOrgExpansion(org.id)}
                                                >
                                                    <span className="text-xs text-slate-300">Configurar {org.internalRoles.length} Cargos Individuais</span>
                                                    {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                                </div>
                                                
                                                {isExpanded && (
                                                    <div className="grid grid-cols-1 gap-3 mt-3 pl-2 border-l-2 border-slate-700 animate-fade-in">
                                                        {org.internalRoles.map(internalRole => {
                                                            // A chave no banco será "orgId_internalRole" (ex: lideres-clas_Líder Yagyu)
                                                            const configKey = `${org.id}_${internalRole}`;
                                                            return (
                                                                <div key={configKey} className="flex flex-col gap-1">
                                                                    <label className="text-xs text-cyan-400 font-bold">{internalRole}</label>
                                                                    <select 
                                                                        className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-xs outline-none focus:border-cyan-500"
                                                                        value={localRoleConfig[configKey] || ""}
                                                                        onChange={(e) => setLocalRoleConfig({...localRoleConfig, [configKey]: e.target.value})}
                                                                    >
                                                                        <option value="">-- Selecione Cargo do Discord --</option>
                                                                        {discordRoles.map(r => <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>)}
                                                                    </select>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-slate-500 mt-2 italic">
                                                    * Esta organização usa mapeamento específico. Cada função interna corresponde a um cargo diferente no Discord.
                                                </p>
                                            </div>
                                        ) : (
                                            // LÓGICA PADRÃO (Organizações com hierarquia simples)
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

                    {/* ABA PERMISSIONS */}
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

                    {/* ABA SIMULATION */}
                    {activeTab === 'simulation' && (
                         <div className="space-y-6">
                            <div className="bg-orange-900/10 border border-orange-600/30 p-4 rounded-lg mb-6">
                                <h3 className="text-orange-400 font-bold flex items-center gap-2 mb-2"><Eye size={18}/> Modo Simulação</h3>
                                <p className="text-xs text-slate-400">
                                    Visualize o painel como se você tivesse outros cargos. 
                                    <br/><span className="text-red-400 font-bold">Nota:</span> Enquanto simula, você não poderá editar nada.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-white mb-2">Simular Estado:</h4>
                                <button 
                                    onClick={() => onSimulate({ name: 'Visitante (Sem cargos)', roles: [] })}
                                    className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex justify-between items-center"
                                >
                                    <span className="text-slate-300">Visitante (Acesso Negado)</span>
                                    <Eye size={16} className="text-slate-500"/>
                                </button>
                            </div>

                            <div className="space-y-2 mt-4">
                                <h4 className="text-sm font-bold text-white mb-2">Simular Cargo Específico:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {[
                                        { id: localAccessConfig.kamiRoleId, label: 'Mizukami (Admin)' },
                                        { id: localAccessConfig.councilRoleId, label: 'Conselho (Admin)' },
                                        { id: localAccessConfig.moderatorRoleId, label: 'Moderador' },
                                        ...Object.entries(localRoleConfig).map(([org, id]) => {
                                            // Melhora a label para cargos mapeados internamente
                                            const orgName = ORG_CONFIG[org] ? ORG_CONFIG[org].name : org;
                                            return { id, label: `${orgName}` };
                                        }),
                                        ...Object.entries(localLeaderRoleConfig).map(([org, id]) => ({ id, label: `Líder ${ORG_CONFIG[org]?.name}` }))
                                    ].filter(r => r.id).map((role, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => onSimulate({ name: role.label, roles: [role.id] })}
                                            className="text-left p-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 rounded transition-colors text-xs text-slate-300 hover:text-white truncate"
                                        >
                                            {role.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                         </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                        {activeTab === 'simulation' ? 'A simulação ativa uma visualização somente leitura.' : 'Alterações salvam ao clicar.'}
                    </span>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Fechar</button>
                        {activeTab !== 'simulation' && canManageSettings && (
                            <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold">Salvar Configuração</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
