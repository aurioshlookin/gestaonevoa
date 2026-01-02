import React, { useState, useEffect } from 'react';
import { X, Save, User, Shield, Zap, AlertCircle } from 'lucide-react';
import { STATS, MASTERIES, ORG_CONFIG } from '../config/constants.js';

const MemberModal = ({ 
    member, orgId, isCreating, discordRoster, discordRoles, 
    onClose, onSave, canManage, isReadOnly,
    roleConfig, leaderRoleConfig, secLeaderRoleConfig 
}) => {
    const orgDef = ORG_CONFIG[orgId];
    const isPromotions = orgId === 'promocoes';
    const isInternalMapping = orgDef?.useInternalRoleMapping;

    // Estado inicial do formulário
    const [formData, setFormData] = useState({
        name: '',
        rpName: '',
        discordId: '',
        ninRole: 'Membro',
        codinome: '',
        specificRoleId: '',
        isLeader: false,
        stats: { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 },
        masteries: [],
        level: 1
    });

    // Carrega dados se for edição
    useEffect(() => {
        if (member) {
            setFormData({
                ...member,
                stats: member.stats || { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 },
                masteries: member.masteries || [],
                rpName: member.rpName || '',
                codinome: member.codinome || '',
                // Garante que ninRole tenha valor válido
                ninRole: member.ninRole || (isPromotions ? orgDef.internalRoles[0] : 'Membro')
            });
        } else {
            // Padrões para criação
            setFormData(prev => ({
                ...prev,
                ninRole: isPromotions ? orgDef.internalRoles[0] : 'Membro'
            }));
        }
    }, [member, orgId, isPromotions, orgDef]);

    // Handler para selecionar usuário do Discord (Autopreencher)
    const handleDiscordSelection = (e) => {
        const userId = e.target.value;
        const discordUser = discordRoster.find(u => u.id === userId);
        if (discordUser) {
            setFormData({
                ...formData,
                name: discordUser.username,
                discordId: discordUser.id,
                // Tenta preencher RP Name se tiver display name
                rpName: discordUser.displayName !== discordUser.username ? discordUser.displayName : formData.rpName
            });
        }
    };

    // Handler para mudança de Patente (Promoções/Clãs)
    const handleInternalRoleChange = (e) => {
        const newRole = e.target.value;
        
        // Busca o ID do cargo do Discord configurado para essa patente
        // Ex: roleConfig['promocoes_Chunin']
        const configKey = `${orgId}_${newRole}`;
        const mappedDiscordRoleId = roleConfig[configKey];

        setFormData(prev => ({
            ...prev,
            ninRole: newRole,
            specificRoleId: mappedDiscordRoleId || prev.specificRoleId // Atualiza o cargo do Discord
        }));
    };

    const handleStatChange = (stat, val) => {
        setFormData(prev => ({ ...prev, stats: { ...prev.stats, [stat]: parseInt(val) || 0 } }));
    };

    const toggleMastery = (masteryId) => {
        setFormData(prev => {
            const current = prev.masteries || [];
            return {
                ...prev,
                masteries: current.includes(masteryId) 
                    ? current.filter(m => m !== masteryId)
                    : [...current, masteryId]
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!orgDef) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-600 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Cabeçalho */}
                <div className={`p-4 border-b border-slate-700 flex justify-between items-center ${orgDef.bgColor}`}>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {isCreating ? 'Adicionar Novo Membro' : 'Editar Ficha'}
                        <span className="text-xs font-normal opacity-70 bg-black/30 px-2 py-1 rounded">
                            {orgDef.name}
                        </span>
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo com Scroll */}
                <div className="p-6 overflow-y-auto scroll-custom flex-1">
                    <form id="member-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* 1. Identificação */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-cyan-400 uppercase border-b border-slate-700 pb-1 flex items-center gap-2">
                                <User size={16}/> Identificação
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isCreating && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Selecionar do Discord</label>
                                        <select 
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-cyan-500"
                                            onChange={handleDiscordSelection}
                                            disabled={isReadOnly}
                                        >
                                            <option value="">-- Selecione Usuário --</option>
                                            {discordRoster.map(u => (
                                                <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Discord ID *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.discordId}
                                        onChange={e => setFormData({...formData, discordId: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-300 text-sm font-mono"
                                        readOnly={!isCreating || isReadOnly} 
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Nome Discord</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                                        readOnly={isReadOnly}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Nome do Personagem (RP)</label>
                                    <input 
                                        type="text" 
                                        value={formData.rpName}
                                        onChange={e => setFormData({...formData, rpName: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white placeholder-slate-600"
                                        placeholder="Nome On-Game"
                                        readOnly={isReadOnly}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Hierarquia e Cargo */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-yellow-400 uppercase border-b border-slate-700 pb-1 flex items-center gap-2">
                                <Shield size={16}/> Hierarquia
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isInternalMapping ? (
                                    // SELETOR ESPECÍFICO PARA PROMOÇÕES E CLÃS
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Patente / Função *</label>
                                        <select 
                                            value={formData.ninRole}
                                            onChange={handleInternalRoleChange}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-yellow-500"
                                            disabled={isReadOnly}
                                        >
                                            {orgDef.internalRoles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            * Selecionar aqui atualiza o cargo do Discord automaticamente.
                                        </p>
                                    </div>
                                ) : (
                                    // CAMPO DE CARGO TEXTO PARA ORGS NORMAIS
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Cargo na Organização</label>
                                        <input 
                                            type="text" 
                                            value={formData.ninRole}
                                            onChange={e => setFormData({...formData, ninRole: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
                                            placeholder="Ex: Capitão, Médico..."
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                )}

                                {/* Se for Org Normal, mostra seletor de cargo do discord manual */}
                                {!isInternalMapping && (
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Cargo Discord (Vinculado)</label>
                                        <select 
                                            value={formData.specificRoleId || ''} 
                                            onChange={e => setFormData({...formData, specificRoleId: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-300 text-sm"
                                            disabled={isReadOnly}
                                        >
                                            <option value="">Usar Padrão da Org</option>
                                            {discordRoles.map(r => <option key={r.id} value={r.id} style={{color:r.color}}>{r.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Checkbox de Líder (Oculto para Promoções) */}
                                {!isPromotions && (
                                    <div className="flex items-center mt-6">
                                        <input 
                                            type="checkbox" 
                                            id="isLeader"
                                            checked={formData.isLeader}
                                            onChange={e => setFormData({...formData, isLeader: e.target.checked})}
                                            disabled={isReadOnly}
                                            className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-yellow-500 focus:ring-yellow-500"
                                        />
                                        <label htmlFor="isLeader" className="ml-2 text-sm text-yellow-100 font-bold">Definir como Líder</label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Atributos */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-red-400 uppercase border-b border-slate-700 pb-1 flex items-center gap-2">
                                <Zap size={16}/> Atributos de Combate
                            </h3>
                            
                            <div className="grid grid-cols-5 gap-2">
                                {STATS.map(stat => (
                                    <div key={stat} className="text-center">
                                        <label className="block text-[10px] text-slate-400 uppercase mb-1">{stat}</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            value={formData.stats[stat]}
                                            onChange={e => handleStatChange(stat, e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-center text-white font-bold"
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Maestrias */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-blue-400 uppercase border-b border-slate-700 pb-1">Maestrias</h3>
                            <div className="flex flex-wrap gap-2">
                                {MASTERIES.map(m => {
                                    const Icon = m.icon;
                                    const isSelected = formData.masteries.includes(m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => toggleMastery(m.id)}
                                            disabled={isReadOnly}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                isSelected 
                                                ? `bg-slate-700 border-${m.color.split('-')[1]}-500 text-white shadow shadow-${m.color.split('-')[1]}-500/20` 
                                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                                            }`}
                                        >
                                            <Icon size={12} className={isSelected ? m.color : 'text-slate-500'} />
                                            {m.id}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Rodapé */}
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                    {canManage && (
                        <button 
                            onClick={handleSubmit} 
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                        >
                            <Save size={16} /> Salvar Ficha
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberModal;
