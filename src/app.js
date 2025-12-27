import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { AlertTriangle, ShieldCheck } from 'lucide-react';

// --- IMPORTAÇÕES LOCAIS ---
import { db } from './config/firebase.js';
import { ORG_CONFIG } from './config/constants.js';

// --- COMPONENTES ---
import Header from './components/Header.js';
import LoginScreen from './components/LoginScreen.js';
import MemberModal from './components/MemberModal.js';
import SettingsModal from './components/SettingsModal.js';
import DashboardTab from './components/DashboardTab.js';
import OrganizationTab from './components/OrganizationTab.js';
import HistoryTab from './components/HistoryTab.js';
import MonitoringTab from './components/MonitoringTab.js';

const App = () => {
    // Configurações
    const DISCORD_CLIENT_ID = "1453817939265589452"; 
    const GUILD_ID = "1410456333391761462"; 

    // Estados Globais
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notification, setNotification] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    
    // Dados do Banco
    const [members, setMembers] = useState([]);
    const [discordRoster, setDiscordRoster] = useState([]);
    const [discordRoles, setDiscordRoles] = useState([]);
    
    // Configurações do Sistema
    const [roleConfig, setRoleConfig] = useState({});
    const [leaderRoleConfig, setLeaderRoleConfig] = useState({});
    const [secLeaderRoleConfig, setSecLeaderRoleConfig] = useState({});
    const [accessConfig, setAccessConfig] = useState({ kamiRoleId: '', councilRoleId: '', moderatorRoleId: '', creatorId: '', vipIds: [] });

    // Estado do Modal de Membro
    const [selectedMember, setSelectedMember] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingOrgId, setEditingOrgId] = useState(null);

    const hasLoggedAccess = useRef(false);

    // --- EFEITOS (Data Fetching) ---
    useEffect(() => {
        const unsubMembers = onSnapshot(collection(db, "membros"), (snap) => setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))), () => setLoading(false));
        const unsubRoster = onSnapshot(doc(db, "server", "roster"), (doc) => { if (doc.exists()) setDiscordRoster(doc.data().users || []); });
        const unsubRoles = onSnapshot(doc(db, "server", "roles"), (doc) => { if (doc.exists()) setDiscordRoles(doc.data().list || []); });
        const unsubConfig = onSnapshot(doc(db, "server", "config"), (doc) => { 
            if (doc.exists()) {
                const data = doc.data();
                setRoleConfig(data.roleMapping || {});
                setLeaderRoleConfig(data.leaderRoleMapping || {});
                setSecLeaderRoleConfig(data.secLeaderRoleMapping || {});
                setAccessConfig({
                    kamiRoleId: data.accessConfig?.kamiRoleId || '',
                    councilRoleId: data.accessConfig?.councilRoleId || '',
                    moderatorRoleId: data.accessConfig?.moderatorRoleId || '',
                    creatorId: data.accessConfig?.creatorId || '',
                    vipIds: data.accessConfig?.vipIds || []
                });
            }
        });
        return () => { unsubMembers(); unsubRoster(); unsubRoles(); unsubConfig(); };
    }, []);

    // --- SCROLL LOCK CORRIGIDO ---
    useEffect(() => {
        // Verifica se qualquer modal está aberto para travar o scroll
        const isModalOpen = selectedMember || isCreating || showSettings || deleteConfirmation;
        
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        
        // Cleanup para garantir que o scroll volte ao normal se o componente desmontar
        return () => { 
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }, [selectedMember, isCreating, showSettings, deleteConfirmation]);

    // --- LOGIN ---
    useEffect(() => { 
        const f = new URLSearchParams(window.location.hash.slice(1)); 
        let accessToken = f.get('access_token');
        if (!accessToken) accessToken = localStorage.getItem('discord_access_token');
        else { localStorage.setItem('discord_access_token', accessToken); window.history.pushState({}, document.title, window.location.pathname); }

        if (accessToken) { 
            setLoading(true);
            fetch('https://discord.com/api/users/@me', {headers:{Authorization:`Bearer ${accessToken}`}})
            .then(r => r.ok ? r.json() : Promise.reject("Token inválido"))
            .then(userData => {
                fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {headers:{Authorization:`Bearer ${accessToken}`}})
                .then(r => r.ok ? r.json() : { roles: [] }) 
                .then(memberData => { setUser({ ...userData, roles: memberData.roles || [] }); setLoading(false); });
            })
            .catch(() => { localStorage.removeItem('discord_access_token'); setUser(null); setLoading(false); });
        } else { setLoading(false); }
    }, []);

    const handleLogin = () => { 
        const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=identify%20guilds.members.read`; 
    };

    const handleLogout = () => { localStorage.removeItem('discord_access_token'); setUser(null); };

    // --- LOGS & MONITORAMENTO ---
    const logAction = async (action, target, details, org = null) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "audit_logs"), {
                action, target, details, executor: user.username || user.displayName, executorId: user.id, org: org || 'Sistema', timestamp: new Date().toISOString()
            });
        } catch (e) { console.error("Erro ao gerar log:", e); }
    };

    useEffect(() => {
        if (!user) { hasLoggedAccess.current = false; return; }
        if (!hasLoggedAccess.current) {
            addDoc(collection(db, "access_logs"), {
                userId: user.id, username: user.username || user.displayName, action: 'Acessou o Painel', timestamp: new Date().toISOString()
            }).then(() => { hasLoggedAccess.current = true; }).catch(console.error);
        }
        const heartbeat = () => setDoc(doc(db, "online_status", user.id), {
            username: user.username || user.displayName, userId: user.id, avatar: user.avatar, lastSeen: new Date().toISOString()
        }, { merge: true }).catch(console.error);
        heartbeat();
        const interval = setInterval(heartbeat, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // --- PERMISSÕES ---
    const checkPermission = (action, contextOrgId = null) => {
        if (!user) return false;
        if (user.id === accessConfig.creatorId) return true;
        if (accessConfig.vipIds && accessConfig.vipIds.includes(user.id)) return true;
        const userRoles = user.roles || [];
        if (userRoles.includes(accessConfig.kamiRoleId) || userRoles.includes(accessConfig.councilRoleId)) return true;
        if (action === 'MANAGE_SETTINGS') return false;
        if (action === 'EDIT_MEMBER' || action === 'ADD_MEMBER' || action === 'DELETE_MEMBER') {
            if (userRoles.includes(accessConfig.moderatorRoleId)) return false;
            if (contextOrgId) {
                const leaderRoleId = leaderRoleConfig[contextOrgId];
                if (leaderRoleId && userRoles.includes(leaderRoleId)) return true;
            }
        }
        return false;
    };

    const canManageOrg = (orgId) => checkPermission('EDIT_MEMBER', orgId);
    const canManageSettings = checkPermission('MANAGE_SETTINGS');
    
    const canViewHistory = useMemo(() => {
        if (!user) return false;
        if (user.id === accessConfig.creatorId || (accessConfig.vipIds && accessConfig.vipIds.includes(user.id))) return true;
        const userRoles = user.roles || [];
        if (userRoles.includes(accessConfig.kamiRoleId) || userRoles.includes(accessConfig.councilRoleId) || userRoles.includes(accessConfig.moderatorRoleId)) return true;
        return Object.values(leaderRoleConfig).some(roleId => userRoles.includes(roleId));
    }, [user, accessConfig, leaderRoleConfig]);

    const canAccessPanel = useMemo(() => {
        if (!user) return false;
        if (user.id === accessConfig.creatorId || (accessConfig.vipIds && accessConfig.vipIds.includes(user.id))) return true;
        const userRoles = user.roles || [];
        const allowedRoles = new Set();
        if (accessConfig.kamiRoleId) allowedRoles.add(accessConfig.kamiRoleId);
        if (accessConfig.councilRoleId) allowedRoles.add(accessConfig.councilRoleId);
        if (accessConfig.moderatorRoleId) allowedRoles.add(accessConfig.moderatorRoleId);
        Object.values(roleConfig).forEach(id => { if(id) allowedRoles.add(id); });
        Object.values(leaderRoleConfig).forEach(id => { if(id) allowedRoles.add(id); });
        Object.values(secLeaderRoleConfig).forEach(id => { if(id) allowedRoles.add(id); });
        return userRoles.some(roleId => allowedRoles.has(roleId));
    }, [user, accessConfig, roleConfig, leaderRoleConfig, secLeaderRoleConfig]);

    const getUserRoleLabel = useMemo(() => {
        if (!user) return "";
        let roles = [];
        if (user.id === accessConfig.creatorId) roles.push("Criador");
        if (accessConfig.vipIds && accessConfig.vipIds.includes(user.id)) roles.push("VIP");
        if (user.roles.includes(accessConfig.kamiRoleId)) roles.push("Kage");
        if (user.roles.includes(accessConfig.councilRoleId)) roles.push("Conselho");
        if (user.roles.includes(accessConfig.moderatorRoleId)) roles.push("Moderador");
        Object.entries(leaderRoleConfig).forEach(([orgId, roleId]) => { if (user.roles.includes(roleId)) roles.push(`Líder ${ORG_CONFIG[orgId]?.name || ''}`); });
        if (roles.length === 0) return "Visitante";
        return roles.join(" & ");
    }, [user, accessConfig, leaderRoleConfig]);

    // --- HELPERS E CÁLCULOS ---
    const showNotification = (msg, type) => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };
    
    const multiOrgUsers = useMemo(() => {
        const memberMap = {};
        members.forEach(m => {
            if (!memberMap[m.discordId]) memberMap[m.discordId] = { name: m.name, orgs: [] };
            const orgName = ORG_CONFIG[m.org]?.name || m.org;
            if (!memberMap[m.discordId].orgs.includes(orgName)) memberMap[m.discordId].orgs.push(orgName);
        });
        return Object.values(memberMap).filter(u => u.orgs.length > 1);
    }, [members]);

    // --- ACTIONS: MEMBROS ---
    const openCreateModal = () => { setIsCreating(true); setSelectedMember(null); setEditingOrgId(activeTab); };
    const openEditModal = (member) => { setIsCreating(false); setSelectedMember(member); setEditingOrgId(member.org); };

    const handleSaveMember = async (formData) => {
        const orgId = isCreating ? editingOrgId : selectedMember.org;
        if (!checkPermission(isCreating ? 'ADD_MEMBER' : 'EDIT_MEMBER', orgId)) return showNotification('Sem permissão.', 'error');
        
        // Validações
        if (!formData.name || !formData.discordId || !formData.ninRole) return showNotification('Campos obrigatórios!', 'error');
        if (isCreating && members.filter(m => m.org === orgId).length >= ORG_CONFIG[orgId].limit) return showNotification('Limite atingido!', 'error');

        // Resolve cargo discord
        let finalRoleId = formData.specificRoleId || roleConfig[orgId];
        let finalRoleName = "Membro";
        if (finalRoleId) {
            const r = discordRoles.find(role => role.id === finalRoleId);
            if (r) finalRoleName = r.name;
        }

        // Resolve conflito de liderança
        if (formData.isLeader) {
            const currentLeader = members.find(m => m.org === orgId && m.isLeader === true && m.discordId !== formData.discordId);
            if (currentLeader) {
                let newRole = currentLeader.ninRole;
                if (orgId === 'unidade-medica' && currentLeader.ninRole === 'Diretor Médico') newRole = 'Residente Chefe';
                await updateDoc(doc(db, "membros", currentLeader.id), { isLeader: false, ninRole: newRole });
            }
        }
        
        let finalNinRole = formData.ninRole;
        if (formData.isLeader && orgId === 'unidade-medica') finalNinRole = 'Diretor Médico';

        const payload = {
            ...formData, org: orgId, role: finalRoleName, specificRoleId: finalRoleId, ninRole: finalNinRole,
            status: 'Ativo', updatedAt: new Date().toISOString(), statsUpdatedAt: new Date().toISOString()
        };

        try {
            const docId = isCreating ? `${formData.discordId}_${orgId}` : selectedMember.id;
            if (isCreating) await setDoc(doc(db, "membros", docId), payload);
            else await updateDoc(doc(db, "membros", docId), payload);
            
            logAction(isCreating ? "Adicionar Membro" : "Editar Membro", formData.name, `Level: ${formData.level}`, orgId);
            showNotification('Salvo!', 'success');
            setSelectedMember(null); setIsCreating(false);
        } catch (e) { showNotification('Erro: ' + e.message, 'error'); }
    };

    const handleDeleteMember = async (id) => {
        if (!checkPermission('DELETE_MEMBER', activeTab)) return showNotification('Sem permissão.', 'error');
        try {
            const memberToRemove = members.find(m => m.id === id);
            await deleteDoc(doc(db, "membros", String(id)));
            logAction("Remover Membro", memberToRemove ? memberToRemove.name : "Desconhecido", "Removido", activeTab);
            showNotification('Removido.', 'success'); setDeleteConfirmation(null);
        } catch (e) { showNotification(`Erro: ${e.message}`, 'error'); setDeleteConfirmation(null); }
    };

    const handleToggleLeader = async (member) => {
        if (!checkPermission('EDIT_MEMBER', member.org)) return showNotification('Sem permissão.', 'error');
        try {
            const orgId = member.org; const newStatus = !member.isLeader;
            if (newStatus) {
                const currentLeader = members.find(m => m.org === orgId && m.isLeader === true);
                if (currentLeader && currentLeader.id !== member.id) {
                    let newRole = currentLeader.ninRole;
                    if (orgId === 'unidade-medica' && currentLeader.ninRole === 'Diretor Médico') newRole = 'Residente Chefe';
                    await updateDoc(doc(db, "membros", currentLeader.id), { isLeader: false, ninRole: newRole });
                }
                let newRoleL = member.ninRole; if (orgId === 'unidade-medica') newRoleL = 'Diretor Médico';
                await updateDoc(doc(db, "membros", member.id), { isLeader: true, ninRole: newRoleL });
            } else { await updateDoc(doc(db, "membros", member.id), { isLeader: false }); }
            logAction("Alterar Liderança", member.name, newStatus ? "Promovido" : "Removido", orgId);
            showNotification('Alterado.', 'success');
        } catch (e) { showNotification('Erro.', 'error'); }
    };

    const handleSaveConfig = async (newConfig) => {
        if (!canManageSettings) return showNotification('Apenas Admins.', 'error');
        try {
            await setDoc(doc(db, "server", "config"), newConfig, { merge: true });
            logAction("Configurações", "Sistema", "Atualizado");
            showNotification('Salvo!', 'success'); setShowSettings(false);
        } catch (e) { showNotification('Erro ao salvar.', 'error'); }
    };

    // --- RENDER ---
    if (!user) return <LoginScreen onLogin={handleLogin} />;

    if (!canAccessPanel) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-mono">
            <div className="max-w-md w-full bg-slate-800 border border-red-500/30 p-8 rounded-2xl text-center shadow-2xl">
                <ShieldCheck size={48} className="mx-auto text-red-500 mb-6" />
                <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
                <p className="text-slate-400 mb-6">Você não possui permissão. Contate um administrador.</p>
                <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">Voltar / Logout</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-slate-200 font-mono">
            {/* Componentes Globais */}
            {notification && (
                <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg text-white z-50 animate-bounce-in ${notification.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                    {notification.msg}
                </div>
            )}

            {/* Modais */}
            {(selectedMember || isCreating) && (
                <MemberModal 
                    member={selectedMember} 
                    orgId={editingOrgId}
                    isCreating={isCreating}
                    discordRoster={discordRoster}
                    discordRoles={discordRoles}
                    onClose={() => { setSelectedMember(null); setIsCreating(false); }}
                    onSave={handleSaveMember}
                    canManage={checkPermission('EDIT_MEMBER', editingOrgId)}
                />
            )}

            {showSettings && (
                <SettingsModal 
                    roleConfig={roleConfig}
                    leaderRoleConfig={leaderRoleConfig}
                    secLeaderRoleConfig={secLeaderRoleConfig}
                    accessConfig={accessConfig}
                    discordRoles={discordRoles}
                    discordRoster={discordRoster}
                    onClose={() => setShowSettings(false)}
                    onSave={handleSaveConfig}
                    canManageSettings={canManageSettings}
                />
            )}

            {deleteConfirmation && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in text-center">
                        <AlertTriangle className="mx-auto text-yellow-400 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-400 text-sm mb-6">Tem certeza?</p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setDeleteConfirmation(null)} className="px-4 py-2 text-slate-300">Cancelar</button>
                            <button onClick={() => handleDeleteMember(deleteConfirmation)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold">Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Layout Principal */}
            <Header 
                user={user}
                userRoleLabel={getUserRoleLabel}
                loading={loading}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                canViewHistory={canViewHistory}
                canManageSettings={canManageSettings}
                onOpenSettings={() => setShowSettings(true)}
                onLogout={handleLogout}
            />

            <main className="container mx-auto px-6 py-8">
                {activeTab === 'dashboard' ? (
                    <DashboardTab 
                        members={members}
                        roleConfig={roleConfig}
                        multiOrgUsers={multiOrgUsers}
                        onTabChange={setActiveTab}
                    />
                ) : activeTab === 'history' ? (
                    <HistoryTab onBack={() => setActiveTab('dashboard')} />
                ) : activeTab === 'access' ? (
                    <MonitoringTab onBack={() => setActiveTab('dashboard')} />
                ) : (
                    <OrganizationTab 
                        orgId={activeTab}
                        members={members}
                        discordRoles={discordRoles}
                        leaderRoleConfig={leaderRoleConfig}
                        canManage={canManageOrg(activeTab)}
                        onOpenCreate={openCreateModal}
                        onEditMember={openEditModal}
                        onDeleteMember={setDeleteConfirmation}
                        onToggleLeader={handleToggleLeader}
                        onBack={() => setActiveTab('dashboard')}
                    />
                )}
            </main>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
