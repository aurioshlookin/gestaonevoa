import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { AlertTriangle, ShieldCheck } from 'lucide-react';

// --- IMPORTAÇÕES LOCAIS ---
import { db } from './config/firebase.js';
import { ORG_CONFIG, STATS } from './config/constants.js';

// --- COMPONENTES ---
import Header from './components/Header.js';
import LoginScreen from './components/LoginScreen.js';
import MemberModal from './components/MemberModal.js';
import SettingsModal from './components/SettingsModal.js';
import DashboardTab from './components/DashboardTab.js';
import OrganizationTab from './components/OrganizationTab.js';
import MonitoringTab from './components/MonitoringTab.js';

// --- SISTEMA DE DEBUG DE ERROS ---
window.addEventListener('error', (event) => {
    const errorBox = document.getElementById('debug-error-box') || document.createElement('div');
    errorBox.id = 'debug-error-box';
    errorBox.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:auto; max-height:50vh; overflow:auto; background:rgba(150,0,0,0.95); color:white; padding:20px; z-index:99999; font-family:monospace; border-bottom: 2px solid red;';
    errorBox.innerHTML += `
        <div style="margin-bottom:10px; border-bottom:1px solid #ffcccc; padding-bottom:5px;">
            <strong>⚠️ Erro Global Detectado:</strong><br/>
            ${event.message}<br/>
            <small style="opacity:0.8">${event.filename}:${event.lineno}</small>
        </div>
    `;
    document.body.appendChild(errorBox);
    console.error("Global Error:", event);
});

class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { 
        this.setState({ error }); 
        console.error("React Error:", error, errorInfo); 
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-red-400 p-8 flex flex-col items-center justify-center font-mono">
                    <h1 className="text-2xl font-bold mb-4">Algo deu errado na interface</h1>
                    <p className="bg-black p-4 rounded text-sm mb-4">{this.state.error?.toString()}</p>
                    <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded">Recarregar Página</button>
                </div>
            );
        }
        return this.props.children; 
    }
}

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
        try {
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
        } catch (err) {
            console.error("Erro ao conectar com Firebase:", err);
            setNotification({ msg: "Erro de conexão com banco de dados.", type: "error" });
        }
    }, []);

    // --- SCROLL LOCK ---
    useEffect(() => {
        const isModalOpen = selectedMember || isCreating || showSettings || deleteConfirmation;
        if (isModalOpen) {
            document.body.style.setProperty('overflow', 'hidden', 'important');
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
        } else {
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
        }
        return () => { 
            document.body.style.removeProperty('overflow');
            document.documentElement.style.removeProperty('overflow');
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
                .then(memberData => { 
                    const userRoles = memberData.roles || [];
                    setUser({ ...userData, roles: userRoles }); 
                    setLoading(false); 
                });
            })
            .catch(() => { localStorage.removeItem('discord_access_token'); setUser(null); setLoading(false); });
        } else { setLoading(false); }
    }, []);

    const handleLogin = () => { 
        const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=identify%20guilds.members.read`; 
    };

    const handleLogout = () => { localStorage.removeItem('discord_access_token'); setUser(null); };

    // --- MONITORAMENTO DETALHADO DE NAVEGAÇÃO ---
    useEffect(() => {
        if (!user || loading) return;
        
        let pageName = activeTab;
        if (activeTab === 'dashboard') pageName = 'Painel Inicial';
        else if (activeTab === 'access') pageName = 'Monitoramento';
        else if (ORG_CONFIG[activeTab]) pageName = ORG_CONFIG[activeTab].name;

        if (pageName && activeTab !== 'history') {
            addDoc(collection(db, "access_logs"), {
                userId: user.id,
                username: user.username || user.displayName,
                action: `Navegou: ${pageName}`,
                timestamp: new Date().toISOString()
            }).catch(err => console.error("Erro ao logar navegação:", err));
        }
    }, [activeTab, user, loading]);

    useEffect(() => {
        if (!user) return;
        const heartbeat = () => setDoc(doc(db, "online_status", user.id), {
            username: user.username || user.displayName, userId: user.id, avatar: user.avatar, lastSeen: new Date().toISOString()
        }, { merge: true }).catch(console.error);
        heartbeat();
        const interval = setInterval(heartbeat, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const logAction = async (action, target, details, org = null) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "audit_logs"), {
                action, target, details, executor: user.username || user.displayName, executorId: user.id, org: org || 'Sistema', timestamp: new Date().toISOString()
            });
        } catch (e) { console.warn("Falha ao salvar log (ação principal ok):", e); }
    };

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
    
    // CORREÇÃO: useMemo definido ANTES do return para estar disponível no render
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

    // --- FUNÇÃO DE SALVAMENTO COM LOG DETALHADO (DIFF) ---
    const handleSaveMember = async (formData) => {
        try {
            const orgId = isCreating ? editingOrgId : selectedMember.org;
            if (!checkPermission(isCreating ? 'ADD_MEMBER' : 'EDIT_MEMBER', orgId)) return showNotification('Sem permissão.', 'error');
            
            if (!formData.name || !formData.discordId || !formData.ninRole) return showNotification('Campos obrigatórios!', 'error');
            if (isCreating && members.filter(m => m.org === orgId).length >= ORG_CONFIG[orgId].limit) return showNotification('Limite atingido!', 'error');

            let finalRoleId = formData.specificRoleId || roleConfig[orgId];
            let finalRoleName = "Membro";
            if (finalRoleId) {
                const r = discordRoles.find(role => role.id === finalRoleId);
                if (r) finalRoleName = r.name;
            }

            let detailsLog = "";
            if (isCreating) {
                detailsLog = `Criado: ${formData.rpName || formData.name} (${formData.ninRole})`;
            } else {
                const changes = [];
                const safeVal = (v) => v || '';
                if (safeVal(selectedMember.name) !== safeVal(formData.name)) changes.push(`Discord: ${selectedMember.name}->${formData.name}`);
                if (safeVal(selectedMember.rpName) !== safeVal(formData.rpName)) changes.push(`Nome RP: ${selectedMember.rpName || '(vazio)'}->${formData.rpName}`);
                if (safeVal(selectedMember.codinome) !== safeVal(formData.codinome)) changes.push(`Codinome: ${selectedMember.codinome || '(vazio)'}->${formData.codinome}`);
                if (selectedMember.level != formData.level) changes.push(`Nível: ${selectedMember.level}->${formData.level}`);
                if (selectedMember.ninRole !== formData.ninRole) changes.push(`Cargo: ${selectedMember.ninRole}->${formData.ninRole}`);
                if (selectedMember.isLeader !== formData.isLeader) changes.push(`Líder: ${selectedMember.isLeader ? 'S' : 'N'}->${formData.isLeader ? 'S' : 'N'}`);
                
                const statsChanged = STATS.filter(s => selectedMember.stats[s] != formData.stats[s]);
                if (statsChanged.length > 0) {
                    const statsDiff = statsChanged.map(s => `${s}: ${selectedMember.stats[s]}->${formData.stats[s]}`).join(', ');
                    changes.push(`Stats [${statsDiff}]`);
                }

                const oldMasteries = (selectedMember.masteries || []).sort().join(',');
                const newMasteries = (formData.masteries || []).sort().join(',');
                if (oldMasteries !== newMasteries) changes.push(`Maestrias alteradas`);

                detailsLog = changes.length > 0 ? changes.join(' | ') : "Edição (sem alterações detectadas)";
            }

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

            const docId = isCreating ? `${formData.discordId}_${orgId}` : selectedMember.id;
            
            if (isCreating) await setDoc(doc(db, "membros", docId), payload);
            else await updateDoc(doc(db, "membros", docId), payload);
            
            setSelectedMember(null); 
            setIsCreating(false);
            showNotification('Salvo com sucesso!', 'success');

            logAction(isCreating ? "Adicionar Membro" : "Editar Membro", formData.name, detailsLog, orgId);
            
        } catch (e) { 
            console.error(e);
            showNotification('Erro ao salvar: ' + e.message, 'error'); 
        }
    };

    const handleDeleteMember = async (id) => {
        if (!checkPermission('DELETE_MEMBER', activeTab)) return showNotification('Sem permissão.', 'error');
        try {
            const memberToRemove = members.find(m => m.id === id);
            await deleteDoc(doc(db, "membros", String(id)));
            setDeleteConfirmation(null);
            showNotification('Removido.', 'success');
            logAction("Remover Membro", memberToRemove ? memberToRemove.name : "Desconhecido", "Removido da organização", activeTab);
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
            showNotification('Liderança alterada.', 'success');
            logAction("Alterar Liderança", member.name, newStatus ? "Promovido a Líder" : "Removido da Liderança", orgId);
        } catch (e) { showNotification('Erro.', 'error'); }
    };

    const handleSaveConfig = async (newConfig) => {
        if (!canManageSettings) return showNotification('Apenas Admins.', 'error');
        try {
            await setDoc(doc(db, "server", "config"), newConfig, { merge: true });
            setShowSettings(false);
            showNotification('Salvo!', 'success');
            logAction("Configurações", "Sistema", "Atualizado");
        } catch (e) { showNotification('Erro ao salvar.', 'error'); }
    };

    // --- RENDER ---
    if (!user) return <ErrorBoundary><LoginScreen onLogin={handleLogin} /></ErrorBoundary>;

    if (!canAccessPanel) return (
        <ErrorBoundary>
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-mono">
                <div className="max-w-md w-full bg-slate-800 border border-red-500/30 p-8 rounded-2xl text-center shadow-2xl">
                    <ShieldCheck size={48} className="mx-auto text-red-500 mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
                    <p className="text-slate-400 mb-6">Você não possui permissão. Contate um administrador.</p>
                    <button onClick={() => {alert("Seus Cargos ID: " + user.roles.join("\n")); console.log("Cargos:", user.roles);}} className="text-xs text-slate-500 hover:text-slate-300 underline mb-4 block mx-auto">Ver meus IDs de Cargo</button>
                    <button onClick={handleLogout} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">Voltar / Logout</button>
                </div>
            </div>
        </ErrorBoundary>
    );

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-slate-200 font-mono">
                {notification && <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg text-white z-50 animate-bounce-in ${notification.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>{notification.msg}</div>}

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
                        <DashboardTab members={members} roleConfig={roleConfig} multiOrgUsers={multiOrgUsers} onTabChange={setActiveTab} />
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
        </ErrorBoundary>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<ErrorBoundary><App /></ErrorBoundary>);
