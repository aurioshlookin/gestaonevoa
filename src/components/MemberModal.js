import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Shield, User, Hash, Star, Calendar } from 'lucide-react';
import { ORG_CONFIG, MASTERIES, STATS } from '../config/constants.js';
import { calculateStats } from '../utils/helpers.js';

const MemberModal = ({ 
    member, orgId, isCreating, discordRoster, discordRoles, onClose, onSave, 
    canManage, isReadOnly, roleConfig, leaderRoleConfig, secLeaderRoleConfig 
}) => {
    // --- ESTADOS ---
    const [formData, setFormData] = useState({
        discordId: '',
        name: '', 
        rpName: '',
        org: orgId,
        ninRole: '',
        specificRoleId: '',
        isLeader: false,
        masteries: [],
        joinDate: new Date().toISOString().split('T')[0],
        codinome: '',
        stats: { ...STATS } 
    });

    const [statsPreview, setStatsPreview] = useState({ hp: 0, cp: 0 });

    // --- CARREGAR DADOS ---
    useEffect(() => {
        if (member) {
            setFormData({
                discordId: member.discordId || '',
                name: member.name || '',
                rpName: member.rpName || member.name || '',
                org: member.org || orgId,
                ninRole: member.ninRole || '',
                specificRoleId: member.specificRoleId || '',
                isLeader: member.isLeader || false,
                masteries: member.masteries || [],
                joinDate: member.joinDate ? member.joinDate.split('T')[0] : new Date().toISOString().split('T')[0],
                codinome: member.codinome || '',
                stats: member.stats ? { ...STATS, ...member.stats } : { ...STATS }
            });
        } else {
            // Padrões para criação
            setFormData(prev => ({ 
                ...prev, 
                org: orgId,
                ninRole: (orgId === 'lideres-clas' && member?.ninRole) ? member.ninRole : '', // Se vier pré-definido (botão definir)
                isLeader: (orgId === 'lideres-clas'), // Clã é sempre líder
            }));
        }
    }, [member, orgId]);

    // --- ATUALIZA PREVIEW DE STATUS ---
    useEffect(() => {
        const calculated = calculateStats(formData.stats);
        setStatsPreview(calculated);
    }, [formData.stats]);

    // --- HANDLERS ---
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStatChange = (stat, value) => {
        const val = parseInt(value) || 0;
        setFormData(prev => ({
            ...prev,
            stats: { ...prev.stats, [stat]: val }
        }));
    };

    const handleMasteryToggle = (masteryId) => {
        setFormData(prev => {
            const current = prev.masteries || [];
            if (current.includes(masteryId)) {
                return { ...prev, masteries: current.filter(m => m !== masteryId) };
            } else {
                if (current.length >= 3) return prev; 
                return { ...prev, masteries: [...current, masteryId] };
            }
        });
    };

    const handleDiscordUserSelect = (e) => {
        const selectedId = e.target.value;
        const selectedUser = discordRoster.find(u => u.id === selectedId);
        if (selectedUser) {
            setFormData(prev => ({
                ...prev,
                discordId: selectedUser.id,
                name: selectedUser.username,
                rpName: prev.rpName || selectedUser.displayName 
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // --- CONFIG DA ORG ---
    const orgConfig = ORG_CONFIG[orgId] || {};
    const roles = orgConfig.internalRoles || [];
    const isClanLeaders = orgId === 'lideres-clas';

    // Filtra usuários do Discord (pode ser otimizado para não listar quem já está na org)
    // Ordena alfabeticamente
    const sortedRoster = [...discordRoster].sort((a,b) => a.username.localeCompare(b.username));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
                
                {/* HEADER */}
                <div className={`p-6 border-b border-slate-700 flex justify-between items-center ${orgConfig.bgColor} bg-opacity-20`}>
                    <div className="flex items-center gap-3">
                        <User size={24} className={orgConfig.color ? `text-${orgConfig.color.split('-')[1]}-400` : 'text-white'} />
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {isCreating ? 'Adicionar Membro' : 'Editar Membro'}
                            </h2>
                            <p className="text-sm text-slate-400 opacity-80">{orgConfig.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* BODY (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form id="memberForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* SEÇÃO 1: IDENTIFICAÇÃO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Discord User */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1">
                                    <Hash size={12}/> Usuário Discord
                                </label>
                                {isCreating ? (
                                    <select 
                                        value={formData.discordId} 
                                        onChange={handleDiscordUserSelect}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                                        required
                                    >
                                        <option value="">Selecione um usuário...</option>
                                        {sortedRoster.map(u => (
                                            <option key={u.id} value={u.id}>{u.username} ({u.displayName})</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="w-full bg-slate-800/50 border border-slate-700 rounded p-2.5 text-slate-300 cursor-not-allowed">
                                        {formData.name || 'Desconhecido'}
                                    </div>
                                )}
                            </div>

                            {/* RP Name */}
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-1">
                                    <User size={12}/> Nome no RP
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.rpName} 
                                    onChange={(e) => handleChange('rpName', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                                    placeholder="Nome do Personagem"
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>

                        {/* SEÇÃO 2: CARGOS E FUNÇÕES */}
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-4">
                            <h3 className="text-sm font-bold text-cyan-400 uppercase flex items-center gap-2">
                                <Shield size={14}/> Dados da Organização
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Cargo Interno (Nin Role) */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Cargo / Patente</label>
                                    <select 
                                        value={formData.ninRole} 
                                        onChange={(e) => handleChange('ninRole', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none"
                                        required
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Selecione...</option>
                                        {roles.map((r, idx) => (
                                            <option key={idx} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cargo Discord (Opcional/Manual) */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Cargo no Discord (Sincronia)</label>
                                    <select 
                                        value={formData.specificRoleId} 
                                        onChange={(e) => handleChange('specificRoleId', e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none"
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Padrão da Organização</option>
                                        {discordRoles.map(r => (
                                            <option key={r.id} value={r.id} style={{color: r.color}}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Data de Entrada */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Data de Entrada</label>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-2.5 top-3 text-slate-500"/>
                                        <input 
                                            type="date"
                                            value={formData.joinDate}
                                            onChange={(e) => handleChange('joinDate', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 pl-8 text-white focus:border-cyan-500 focus:outline-none"
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                </div>

                                {/* Checkbox Líder (ESCONDIDO SE FOR CLÃ) */}
                                {!isClanLeaders && (
                                    <div className="flex items-center h-full pt-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border border-slate-600 flex items-center justify-center transition-colors ${formData.isLeader ? 'bg-yellow-500 border-yellow-500' : 'bg-slate-800 group-hover:border-slate-500'}`}>
                                                {formData.isLeader && <Star size={12} className="text-black fill-current" />}
                                            </div>
                                            <input 
                                                type="checkbox" 
                                                checked={formData.isLeader} 
                                                onChange={(e) => handleChange('isLeader', e.target.checked)}
                                                className="hidden"
                                                disabled={isReadOnly}
                                            />
                                            <span className={`text-sm font-bold ${formData.isLeader ? 'text-yellow-400' : 'text-slate-400'}`}>
                                                Líder da Organização
                                            </span>
                                        </label>
                                    </div>
                                )}
                                
                                {orgId === 'divisao-especial' && (
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs text-slate-400">Codinome ANBU</label>
                                        <input 
                                            type="text"
                                            value={formData.codinome}
                                            onChange={(e) => handleChange('codinome', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono focus:border-purple-500 focus:outline-none"
                                            placeholder="Ex: Corvo"
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEÇÃO 3: MAESTRIAS */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-slate-500">Elementos & Maestrias (Máx 3)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {MASTERIES.map(m => {
                                    const isSelected = formData.masteries.includes(m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => !isReadOnly && handleMasteryToggle(m.id)}
                                            className={`p-2 rounded text-xs font-bold border transition-all flex items-center justify-center gap-2 ${isSelected ? `${m.color} border-${m.color.split('-')[1]}-500 bg-opacity-20` : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                                            disabled={isReadOnly}
                                        >
                                            {m.id}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* SEÇÃO 4: ATRIBUTOS (STATS) */}
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase flex items-center gap-2">
                                    <AlertCircle size={14}/> Atributos de Combate
                                </h3>
                                <div className="flex gap-4 text-xs font-mono">
                                    <span className="text-red-400 font-bold">HP: {statsPreview.hp}</span>
                                    <span className="text-blue-400 font-bold">CP: {statsPreview.cp}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['tai', 'nin', 'gen', 'inte'].map(stat => (
                                    <div key={stat} className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500">{stat.toUpperCase()}</label>
                                        <input 
                                            type="number" 
                                            value={formData.stats[stat]} 
                                            onChange={(e) => handleStatChange(stat, e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-white focus:border-emerald-500 focus:outline-none"
                                            min="0"
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                ))}
                                {['for', 'vel', 'sel', 'res'].map(stat => (
                                    <div key={stat} className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-500">{stat.toUpperCase()}</label>
                                        <input 
                                            type="number" 
                                            value={formData.stats[stat]} 
                                            onChange={(e) => handleStatChange(stat, e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-white focus:border-emerald-500 focus:outline-none"
                                            min="0"
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>

                {/* FOOTER */}
                {!isReadOnly && (
                    <div className="p-6 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            form="memberForm"
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-transform hover:scale-105"
                        >
                            <Save size={18} /> Salvar Membro
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberModal;
