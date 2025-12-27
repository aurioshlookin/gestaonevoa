import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy, limit 
} from "firebase/firestore";
import { 
    RefreshCw, AlertCircle, LogOut, Settings, AlertTriangle, Crown, ArrowUp, ArrowDown, ArrowUpDown,
    UserPlus, History, Globe, Trash2, BookOpen, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';

const App = () => {
    // --- ESTADOS DO SISTEMA ---
    const [user, setUser] = useState(null);
    const [members, setMembers] = useState([]); 
    const [discordRoster, setDiscordRoster] = useState([]); 
    const [discordRoles, setDiscordRoles] = useState([]); 
    const [auditLogs, setAuditLogs] = useState([]);
    
    // Estados de Monitoramento
    const [accessLogs, setAccessLogs] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    // Configurações Dinâmicas (Vindas do Firebase)
    const [roleConfig, setRoleConfig] = useState({}); 
    const [leaderRoleConfig, setLeaderRoleConfig] = useState({}); 
    const [secLeaderRoleConfig, setSecLeaderRoleConfig] = useState({}); 
    const [accessConfig, setAccessConfig] = useState({
        kamiRoleId: '', 
        councilRoleId: '', 
        moderatorRoleId: '', 
        creatorId: '', 
        vipIds: []
    });

    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notification, setNotification] = useState(null);
    
    // Estado para criação de Novo Membro
    const [newMember, setNewMember] = useState({ 
        name: '', 
        discordId: '', 
        role: '', 
        specificRoleId: '', 
        ninRole: '', 
        isLeader: false, 
        joinDate: new Date().toISOString().split('T')[0]
    });
    
    // Estados dos Modais
    const [showSettings, setShowSettings] = useState(false); 
    const [settingsTab, setSettingsTab] = useState('roles');
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [vipSelection, setVipSelection] = useState("");

    // Estados de Edição
    const [selectedMember, setSelectedMember] = useState(null); 
    const [editForm, setEditForm] = useState(null); 
    const [isCreating, setIsCreating] = useState(false);

    // Estados de Visualização e Filtro
    const [showRoleDetails, setShowRoleDetails] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Referência para controle de log único
    const hasLoggedAccess = useRef(false);

    // --- IMPORTAÇÃO DOS RECURSOS GLOBAIS ---
    const { db, logAction, getActivityStats, formatDate } = window.AppServices;
    const { ORG_CONFIG, Icons, DISCORD_CLIENT_ID, GUILD_ID, MASTERIES } = window.AppConfig;
    const { EditMemberModal, DeleteModal, SettingsModal, SortIcon } = window.AppComponents;

    // --- 1. SINCRONIZAÇÃO COM FIREBASE ---
    useEffect(() => {
        // Busca Membros
        const unsubMembers = onSnapshot(collection(db, "membros"), (snap) => {
            setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, () => setLoading(false));

        // Busca Lista de Usuários do Discord
        const unsubRoster = onSnapshot(doc(db, "server", "roster"), (doc) => { 
            if (doc.exists()) setDiscordRoster(doc.data().users || []); 
        });

        // Busca Cargos do Discord
        const unsubRoles = onSnapshot(doc(db, "server", "roles"), (doc) => { 
            if (doc.exists()) setDiscordRoles(doc.data().list || []); 
        });

        // Busca Configurações do Servidor
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

        return () => { 
            unsubMembers(); 
            unsubRoster(); 
            unsubRoles(); 
            unsubConfig(); 
        };
    }, []);

    // --- 2. CONTROLE DE SCROLL (Quando modal abre) ---
    useEffect(() => {
        if (selectedMember && editForm) {
            document.body.style.overflow = 'hidden'; 
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = ''; 
            document.documentElement.style.overflow = '';
        }
        return () => { 
            document.body.style.overflow = ''; 
            document.documentElement.style.overflow = ''; 
        }
    }, [selectedMember, editForm]);

    // --- 3. LOGS DE ACESSO E HEARTBEAT ---
    useEffect(() => {
        if (!user) { 
            hasLoggedAccess.current = false; 
            return; 
        }

        // Log de Login (apenas uma vez)
        if (!hasLoggedAccess.current) {
            const logAccess = async () => {
                try {
                    await setDoc(doc(db, "online_status", user.id), {
                        username: user.username || user.displayName, 
                        userId: user.id, 
                        avatar: user.avatar, 
                        lastSeen: new Date().toISOString()
                    }, { merge: true });
                    hasLoggedAccess.current = true;
                } catch (e) { 
                    console.error("Erro ao registrar acesso:", e); 
                }
            };
            logAccess();
        }

        // Heartbeat (Online Status)
        const heartbeat = async () => {
            try {
                await setDoc(doc(db, "online_status", user.id), {
                    username: user.username || user.displayName, 
                    userId: user.id, 
                    avatar: user.avatar, 
                    lastSeen: new Date().toISOString()
                }, { merge: true });
            } catch (e) { 
                console.error("Heartbeat error:", e); 
            }
        };

        heartbeat();
        const interval = setInterval(heartbeat, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // --- 4. LISTENER CONDICIONAL (Histórico/Acessos) ---
    useEffect(() => {
        if (activeTab === 'history') {
            const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(50));
            const unsub = onSnapshot(q, (snap) => setAuditLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
            return () => unsub();
        }
        if (activeTab === 'access') {
            const qLogs = query(collection(db, "access_logs"), orderBy("timestamp", "desc"), limit(50));
            const unsubLogs = onSnapshot(qLogs, (snap) => setAccessLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
            
            const qOnline = collection(db, "online_status");
            const unsubOnline = onSnapshot(qOnline, (snap) => {
                const now = new Date();
                setOnlineUsers(snap.docs.map(doc => doc.data()).filter(u => u.lastSeen && (now - new Date(u.lastSeen))/1000/60 <= 5));
            });
            
            return () => { unsubLogs(); unsubOnline(); };
        }
    }, [activeTab]);

    // --- HELPERS E PERMISSÕES ---

    const getUserRoleLabel = useMemo(() => {
        if (!user) return "";
        let roles = [];
        if (user.id === accessConfig.creatorId) roles.push("Criador");
        if (accessConfig.vipIds && accessConfig.vipIds.includes(user.id)) roles.push("VIP");
        if (user.roles.includes(accessConfig.kamiRoleId)) roles.push("Kage");
        if (user.roles.includes(accessConfig.councilRoleId)) roles.push("Conselho");
        if (user.roles.includes(accessConfig.moderatorRoleId)) roles.push("Moderador");
        
        Object.entries(leaderRoleConfig).forEach(([orgId, roleId]) => { 
            if (user.roles.includes(roleId)) roles.push(`Líder ${ORG_CONFIG[orgId]?.name || ''}`); 
        });
        
        Object.entries(roleConfig).forEach(([orgId, roleId]) => {
            if (user.roles.includes(roleId) && (!leaderRoleConfig[orgId] || !user.roles.includes(leaderRoleConfig[orgId]))) {
                roles.push(`Membro ${ORG_CONFIG[orgId]?.name || ''}`);
            }
        });
        
        if (roles.length === 0) return "Visitante";
        return roles.join(" & ");
    }, [user, accessConfig, leaderRoleConfig, roleConfig]);

    const checkPermission = (action, contextOrgId = null) => {
        if (!user) return false;
        if (user.id === accessConfig.creatorId || (accessConfig.vipIds && accessConfig.vipIds.includes(user.id))) return true;
        
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
        if (userRoles.includes(accessConfig.kamiRoleId) || 
            userRoles.includes(accessConfig.councilRoleId) || 
            userRoles.includes(accessConfig.moderatorRoleId)) return true;
            
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

    // --- FUNÇÕES DE AÇÃO ---

    const showNotification = (msg, type) => { 
        setNotification({ msg, type }); 
        setTimeout(() => setNotification(null), 3000); 
    };

    const handleAddVip = async () => {
        if (!vipSelection) return;
        const newVipIds = [...new Set([...(accessConfig.vipIds || []), vipSelection])];
        try {
            setAccessConfig({ ...accessConfig, vipIds: newVipIds });
            await setDoc(doc(db, "server", "config"), { accessConfig: { ...accessConfig, vipIds: newVipIds } }, { merge: true });
            setVipSelection(""); 
            showNotification('VIP Adicionado!', 'success');
        } catch (e) { showNotification('Erro ao adicionar VIP', 'error'); }
    };

    const handleRemoveVip = async (idToRemove) => {
        const newVipIds = (accessConfig.vipIds || []).filter(id => id !== idToRemove);
        try {
            setAccessConfig({ ...accessConfig, vipIds: newVipIds });
            await setDoc(doc(db, "server", "config"), { accessConfig: { ...accessConfig, vipIds: newVipIds } }, { merge: true });
            showNotification('VIP Removido!', 'success');
        } catch (e) { showNotification('Erro ao remover VIP', 'error'); }
    };

    const openCreateModal = () => {
        setIsCreating(true); 
        setSearchTerm("");
        const orgId = activeTab;
        const defaultRole = ORG_CONFIG[orgId].internalRoles[0];
        setEditForm({
            name: '', discordId: '', org: orgId, ninRole: defaultRole, specificRoleId: '', isLeader: false,
            level: 1, guildBonus: false, masteries: [],
            stats: { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 },
            joinDate: new Date().toISOString().split('T')[0]
        });
        setSelectedMember({ org: orgId });
    };

    // --- FUNÇÃO openEditModal ADICIONADA AQUI ---
    const openEditModal = (member) => {
        setIsCreating(false);
        const defaultStats = { Força: 5, Fortitude: 5, Intelecto: 5, Agilidade: 5, Chakra: 5 };
        setEditForm({
            ...member,
            level: member.level || 1,
            guildBonus: member.guildBonus || false,
            masteries: member.masteries || [],
            stats: member.stats || defaultStats,
            joinDate: member.joinDate || new Date().toISOString().split('T')[0]
        });
        setSelectedMember(member);
    };

    const handleSaveEdit = async () => {
        if (!selectedMember || !editForm) return;
        const orgId = isCreating ? activeTab : selectedMember.org;
        if (!checkPermission('EDIT_MEMBER', orgId)) return showNotification('Sem permissão.', 'error');

        let finalRoleId = editForm.specificRoleId || roleConfig[orgId];
        let finalRoleName = "Membro";
        if (finalRoleId) {
            const r = discordRoles.find(role => role.id === finalRoleId);
            if (r) finalRoleName = r.name;
        }

        if (editForm.isLeader) {
            const currentLeader = members.find(m => m.org === orgId && m.isLeader === true && m.discordId !== editForm.discordId);
            if (currentLeader) {
                let newRole = currentLeader.ninRole;
                if (orgId === 'unidade-medica' && currentLeader.ninRole === 'Diretor Médico') newRole = 'Residente Chefe';
                await updateDoc(doc(db, "membros", currentLeader.id), { isLeader: false, ninRole: newRole });
            }
            if (orgId === 'unidade-medica') editForm.ninRole = 'Diretor Médico';
        }

        const docId = isCreating ? `${editForm.discordId}_${orgId}` : selectedMember.id;
        const payload = { ...editForm, org: orgId, role: finalRoleName, specificRoleId: finalRoleId, status: 'Ativo', updatedAt: new Date().toISOString(), statsUpdatedAt: new Date().toISOString() };
        if(isCreating) payload.activityStats = {};

        try {
            if (isCreating) await setDoc(doc(db, "membros", docId), payload);
            else await updateDoc(doc(db, "membros", docId), payload);
            logAction(user, isCreating ? "Adicionar Membro" : "Editar Membro", editForm.name, `Level: ${editForm.level}, Rank: ${editForm.ninRole}`, orgId);
            showNotification('Salvo com sucesso!', 'success'); 
            setSelectedMember(null); 
            setEditForm(null);
        } catch (e) { showNotification('Erro: ' + e.message, 'error'); }
    };

    const handleRemoveMember = async (id) => {
        if(!deleteConfirmation) return;
        if (!checkPermission('DELETE_MEMBER', activeTab)) return showNotification('Sem permissão.', 'error');
        try {
            const memberToRemove = members.find(m => m.id === deleteConfirmation);
            await deleteDoc(doc(db, "membros", String(deleteConfirmation)));
            logAction(user, "Remover Membro", memberToRemove ? memberToRemove.name : "Desconhecido", "Removido do painel", activeTab);
            showNotification('Removido com sucesso.', 'success'); 
            setDeleteConfirmation(null);
        } catch (e) { showNotification(`Erro: ${e.message}`, 'error'); setDeleteConfirmation(null); }
    };

    const handleSaveConfig = async () => {
        if (!canManageSettings) return showNotification('Apenas Admins.', 'error');
        try {
            await setDoc(doc(db, "server", "config"), { 
                roleMapping: roleConfig, 
                leaderRoleMapping: leaderRoleConfig, 
                secLeaderRoleMapping: secLeaderRoleConfig, 
                accessConfig: accessConfig 
            }, { merge: true });
            
            logAction(user, "Configurações", "Sistema", "Cargos e Permissões atualizados");
            showNotification('Configurações Salvas!', 'success'); 
            setShowSettings(false);
        } catch (e) { showNotification('Erro ao salvar.', 'error'); }
    };

    const handleToggleLeader = async (member) => {
        if (!checkPermission('EDIT_MEMBER', member.org)) return showNotification('Sem permissão.', 'error');
        try {
            const orgId = member.org;
            const newStatus = !member.isLeader;
            if (newStatus === true) {
                const currentLeader = members.find(m => m.org === orgId && m.isLeader === true);
                if (currentLeader && currentLeader.id !== member.id) {
                    let newRole = currentLeader.ninRole;
                    if (orgId === 'unidade-medica' && currentLeader.ninRole === 'Diretor Médico') newRole = 'Residente Chefe';
                    await updateDoc(doc(db, "membros", currentLeader.id), { isLeader: false, ninRole: newRole });
                }
                let newRoleNew = member.ninRole;
                if (orgId === 'unidade-medica') newRoleNew = 'Diretor Médico';
                await updateDoc(doc(db, "membros", member.id), { isLeader: true, ninRole: newRoleNew });
            } else { await updateDoc(doc(db, "membros", member.id), { isLeader: false }); }
            logAction(user, "Alterar Liderança", member.name, newStatus ? "Promovido a Líder" : "Removido da Liderança", orgId);
            showNotification('Liderança alterada.', 'success');
        } catch (e) { showNotification('Erro ao alterar.', 'error'); }
    };

    const handleSelectUser = (user) => {
        setEditForm({ ...editForm, name: user.displayName || user.username, discordId: user.id });
        setSearchTerm(user.displayName || user.username); 
        setIsDropdownOpen(false);
    };

    const requestSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending' });
    const getRoleRank = (member) => { const roles = ORG_CONFIG[member.org]?.internalRoles || []; return roles.indexOf(member.ninRole); };
    
    // --- LÓGICA DE ORDENAÇÃO ---
    const getSortedMembers = (list) => {
        return [...list].sort((a, b) => {
            if (sortConfig.key === 'rank' || sortConfig.key === 'ninRole') {
                if (activeTab === 'sete-laminas') {
                    if (a.isLeader && !b.isLeader) return -1; if (!a.isLeader && b.isLeader) return 1;
                    const dateA = new Date(a.joinDate || '9999-12-31').getTime(); const dateB = new Date(b.joinDate || '9999-12-31').getTime();
                    return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
                }
                if (['unidade-medica', 'forca-policial', 'divisao-especial'].includes(activeTab)) {
                    if (a.isLeader && !b.isLeader) return -1; if (!a.isLeader && b.isLeader) return 1;
                    const rankA = getRoleRank(a); const rankB = getRoleRank(b);
                    if (rankA !== rankB) return sortConfig.direction === 'ascending' ? rankB - rankA : rankA - rankB;
                    const dateA = new Date(a.joinDate || '9999-12-31').getTime(); const dateB = new Date(b.joinDate || '9999-12-31').getTime();
                    return dateA - dateB;
                }
                const rankA = getRoleRank(a); const rankB = getRoleRank(b);
                if (rankA !== rankB) return sortConfig.direction === 'ascending' ? rankA - rankB : rankB - rankA;
                const dateA = new Date(a.joinDate || '9999-12-31').getTime(); const dateB = new Date(b.joinDate || '9999-12-31').getTime();
                if (dateA !== dateB) return dateA - dateB;
                const leaderA = a.isLeader ? 1 : 0; const leaderB = b.isLeader ? 1 : 0; return leaderB - leaderA;
            }
            if (sortConfig.key === 'activity') {
                const actA = getActivityStats(a).total; const actB = getActivityStats(b).total;
                return sortConfig.direction === 'ascending' ? actA - actB : actB - actA;
            }
            let av = a[sortConfig.key], bv = b[sortConfig.key];
            if (sortConfig.key === 'joinDate') {
                const dateA = new Date(av || '1970-01-01'); const dateB = new Date(bv || '1970-01-01');
                return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
            }
            if (typeof av === 'boolean') { av = av?1:0; bv = bv?1:0; }
            else if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
            if (av === undefined || av === null) av = ''; if (bv === undefined || bv === null) bv = '';
            return av < bv ? (sortConfig.direction === 'ascending' ? -1 : 1) : (sortConfig.direction === 'ascending' ? 1 : -1);
        });
    };

    const filteredRoster = discordRoster.filter(u => (u.displayName || u.username).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const multiOrgUsers = Object.values(members.reduce((acc, m) => {
        if (!acc[m.discordId]) acc[m.discordId] = { name: m.name, orgs: [] };
        const orgName = ORG_CONFIG[m.org]?.name || m.org;
        if (!acc[m.discordId].orgs.includes(orgName)) acc[m.discordId].orgs.push(orgName);
        return acc;
    }, {})).filter(u => u.orgs.length > 1);

    const getMemberOrgsInfo = (discordId) => {
        const userOrgs = members.filter(m => m.discordId === discordId);
        if (userOrgs.length <= 1) return null;
        return { count: userOrgs.length, names: userOrgs.map(m => ORG_CONFIG[m.org]?.name || m.org).join(", ") };
    };

    const handleLogin = () => { 
        const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=identify%20guilds.members.read`; 
    };

    // --- LÓGICA DE AUTH DISCORD ---
    useEffect(() => { 
        const f = new URLSearchParams(window.location.hash.slice(1)); 
        let accessToken = f.get('access_token') || localStorage.getItem('discord_access_token');
        
        if (f.get('access_token')) { 
            localStorage.setItem('discord_access_token', accessToken); 
            window.history.pushState({}, document.title, window.location.pathname); 
        }
        
        if (accessToken) { 
            setLoading(true);
            fetch('https://discord.com/api/users/@me', {headers:{Authorization:`Bearer ${accessToken}`}})
            .then(r => { if (!r.ok) throw new Error("Token inválido"); return r.json(); })
            .then(userData => {
                fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {headers:{Authorization:`Bearer ${accessToken}`}})
                .then(r => r.ok ? r.json() : { roles: [] })
                .then(memberData => { 
                    setUser({ ...userData, roles: memberData.roles || [] }); 
                    setLoading(false); 
                });
            }).catch(err => { 
                console.error(err); 
                localStorage.removeItem('discord_access_token'); 
                setUser(null); 
                setLoading(false); 
            });
        } else { 
            setLoading(false); 
        }
    }, []);

    // --- RENDERIZAÇÃO DA TELA DE LOGIN ---
    if (!user) return (
        <div className="min-h-screen bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex items-center justify-center p-4 font-mono">
            <div className="max-w-md w-full bg-slate-800/80 backdrop-blur border border-slate-700 p-8 rounded-2xl text-center shadow-2xl">
                <img src="favicon.png" alt="Logo" className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Gestão da Névoa</h1>
                <button onClick={handleLogin} className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 rounded mb-4">Entrar com Discord</button>
            </div>
        </div>
    );

    // --- RENDERIZAÇÃO DE ACESSO NEGADO ---
    if (!canAccessPanel) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-mono">
            <div className="max-w-md w-full bg-slate-800 border border-red-500/30 p-8 rounded-2xl text-center shadow-2xl">
                <ShieldCheck size={48} className="mx-auto text-red-500 mb-6" />
                <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
                <p className="text-slate-400 mb-6">Sem permissão de acesso.</p>
                <button onClick={() => { localStorage.removeItem('discord_access_token'); setUser(null); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">Voltar / Logout</button>
            </div>
        </div>
    );

    // --- RENDERIZAÇÃO DO PAINEL PRINCIPAL ---
    return (
        <div className="min-h-screen bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-slate-200 font-mono">
            {selectedMember && editForm && 
                <EditMemberModal 
                    isCreating={isCreating} editForm={editForm} setEditForm={setEditForm} selectedMember={selectedMember} 
                    setSelectedMember={setSelectedMember} handleSaveEdit={handleSaveEdit} discordRoles={discordRoles} 
                    canManageOrg={canManageOrg} filteredRoster={filteredRoster} searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen} 
                    handleSelectUser={handleSelectUser} 
                />
            }
            {deleteConfirmation && 
                <DeleteModal 
                    setDeleteConfirmation={setDeleteConfirmation} handleRemoveMember={handleRemoveMember} id={deleteConfirmation} 
                />
            }
            {showSettings && 
                <SettingsModal 
                    setShowSettings={setShowSettings} settingsTab={settingsTab} setSettingsTab={setSettingsTab} 
                    roleConfig={roleConfig} setRoleConfig={setRoleConfig} leaderRoleConfig={leaderRoleConfig} 
                    setLeaderRoleConfig={setLeaderRoleConfig} secLeaderRoleConfig={secLeaderRoleConfig} 
                    setSecLeaderRoleConfig={setSecLeaderRoleConfig} accessConfig={accessConfig} setAccessConfig={setAccessConfig} 
                    discordRoles={discordRoles} discordRoster={discordRoster} vipSelection={vipSelection} 
                    setVipSelection={setVipSelection} handleAddVip={handleAddVip} handleRemoveVip={handleRemoveVip} 
                    handleSaveConfig={handleSaveConfig} canManageSettings={canManageSettings} Icons={Icons} 
                />
            }
            
            <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-900/30 rounded border border-cyan-500/30 text-cyan-400">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold mist-title text-cyan-50 tracking-wider">
                            Gestão da <span className="text-cyan-500">Névoa</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {canViewHistory && (
                            <>
                                <button onClick={() => setActiveTab('access')} className={`p-2 transition-colors ${activeTab === 'access' ? 'text-green-400 bg-green-400/10 rounded-lg' : 'text-slate-400 hover:text-green-400'}`}>
                                    <Globe size={20} />
                                </button>
                                <button onClick={() => setActiveTab('history')} className={`p-2 transition-colors ${activeTab === 'history' ? 'text-purple-400 bg-purple-400/10 rounded-lg' : 'text-slate-400 hover:text-purple-400'}`}>
                                    <History size={20} />
                                </button>
                            </>
                        )}
                        {canManageSettings && (
                            <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                                <Settings size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <div className="flex flex-col items-end mr-1">
                                <span className="text-xs font-bold text-slate-300 hidden md:inline leading-none mb-0.5">{user.username}</span>
                                <span className="text-[10px] text-cyan-400 font-bold uppercase hidden md:inline leading-none">{getUserRoleLabel}</span>
                            </div>
                        </div>
                        <button onClick={() => { localStorage.removeItem('discord_access_token'); setUser(null); }} className="text-slate-400 hover:text-red-400 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {notification && <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg text-white z-50 animate-bounce-in ${notification.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>{notification.msg}</div>}

                {/* --- RENDERIZAÇÃO DAS ABAS --- */}
                {activeTab === 'dashboard' ? (
                    <div className="animate-fade-in space-y-8">
                        {multiOrgUsers.length > 0 && (
                            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6">
                                <h3 className="text-yellow-400 font-bold flex items-center gap-2 mb-4"><AlertTriangle size={20} /> Conflitos de Organização</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {multiOrgUsers.map((u, idx) => (
                                        <div key={idx} className="bg-slate-800/50 p-3 rounded border border-yellow-700/20 flex flex-col">
                                            <span className="font-bold text-white">{u.name}</span>
                                            <span className="text-xs text-slate-400 mt-1">Membro de: <span className="text-yellow-200">{u.orgs.join(", ")}</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.values(ORG_CONFIG).map((org) => {
                                const count = members.filter(m => m.org === org.id).length;
                                const percentage = (count / org.limit) * 100;
                                return (
                                    <div key={org.id} onClick={() => setActiveTab(org.id)} className={`glass-panel p-6 rounded-xl cursor-pointer hover:scale-105 transition-all hover:shadow-lg hover:shadow-cyan-500/10 ${org.border} border-t-4`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-lg ${org.bgColor} ${org.color}`}>{React.createElement(Icons[org.icon])}</div>
                                            <span className="text-2xl font-bold font-mono">{count}/{org.limit}</span>
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">{org.name}</h3>
                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-2"><div className={`h-full transition-all duration-500 ${org.color.replace('text', 'bg')}`} style={{ width: `${percentage}%` }}></div></div>
                                        {!roleConfig[org.id] && <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1"><AlertCircle size={10}/> Cargo não configurado</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : activeTab === 'history' ? (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-slate-700 rounded transition-colors text-white">← Voltar</button>
                                <div className="p-3 rounded-lg bg-purple-900/20 text-purple-400"><History size={20} /></div>
                                <h2 className="text-3xl font-bold mist-title text-white">Histórico de Modificações</h2>
                            </div>
                        </div>
                        <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase"><tr><th className="p-4">Data/Hora</th><th className="p-4">Executor</th><th className="p-4">Ação</th><th className="p-4">Alvo</th><th className="p-4">Detalhes</th><th className="p-4">Origem</th></tr></thead>
                                <tbody className="divide-y divide-slate-700">
                                    {auditLogs.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-500 italic">Nenhum registro encontrado ainda.</td></tr> : auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 text-xs font-mono text-slate-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                            <td className="p-4 font-bold text-cyan-400">{log.executor}</td>
                                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${log.action.includes('Adicionar') ? 'border-emerald-500/30 text-emerald-400 bg-emerald-900/20' : log.action.includes('Remover') ? 'border-red-500/30 text-red-400 bg-red-900/20' : 'border-yellow-500/30 text-yellow-400 bg-yellow-900/20'}`}>{log.action}</span></td>
                                            <td className="p-4 text-white font-bold">{log.target}</td>
                                            <td className="p-4 text-sm text-slate-300">{log.details}</td>
                                            <td className="p-4 text-xs text-slate-500 uppercase">{ORG_CONFIG[log.org]?.name || log.org}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'access' ? (
                    <div className="animate-fade-in space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-slate-700 rounded transition-colors text-white">← Voltar</button>
                                <div className="p-3 rounded-lg bg-green-900/20 text-green-400"><Globe size={20} /></div>
                                <h2 className="text-3xl font-bold mist-title text-white">Monitoramento de Acesso</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900/50 border border-green-500/30 rounded-xl p-6 h-full">
                                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> Online Agora ({onlineUsers.length})</h3>
                                {onlineUsers.length === 0 ? <p className="text-slate-500 italic">Nenhum usuário ativo.</p> : (
                                    <div className="space-y-3">
                                        {onlineUsers.map((u, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden">{u.avatar ? <img src={`https://cdn.discordapp.com/avatars/${u.userId}/${u.avatar}.png`} className="w-full h-full" /> : u.username?.charAt(0)}</div>
                                                    <span className="font-bold text-white">{u.username}</span>
                                                </div>
                                                <span className="text-xs text-green-400 font-mono">Ativo</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="glass-panel rounded-xl overflow-hidden border border-slate-700 h-full">
                                <div className="p-4 bg-slate-800/50 border-b border-slate-700"><h3 className="text-lg font-bold text-slate-300">Últimos Acessos</h3></div>
                                <div className="max-h-[500px] overflow-y-auto scroll-custom">
                                    <table className="w-full text-left">
                                        <tbody className="divide-y divide-slate-700">
                                            {accessLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-800/30">
                                                    <td className="p-4 text-xs font-mono text-slate-400 w-32">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                                    <td className="p-4"><span className="font-bold text-cyan-400 block">{log.username}</span><span className="text-xs text-slate-500">ID: {log.userId}</span></td>
                                                    <td className="p-4 text-right"><span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">Login</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-slate-700 rounded transition-colors text-white">← Voltar</button>
                                <div className={`p-3 rounded-lg ${ORG_CONFIG[activeTab].bgColor} ${ORG_CONFIG[activeTab].color}`}>{React.createElement(Icons[ORG_CONFIG[activeTab].icon])}</div>
                                <h2 className="text-3xl font-bold mist-title text-white">{ORG_CONFIG[activeTab].name}</h2>
                            </div>
                            <span className={`text-2xl font-bold ${members.filter(m => m.org === activeTab).length >= ORG_CONFIG[activeTab].limit ? 'text-red-400' : 'text-emerald-400'}`}>{members.filter(m => m.org === activeTab).length} / {ORG_CONFIG[activeTab].limit}</span>
                        </div>
                        
                        {ORG_CONFIG[activeTab].roleDetails && (
                            <div className="mb-6">
                                <button onClick={() => setShowRoleDetails(!showRoleDetails)} className="w-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg p-3 flex justify-between items-center transition-all text-slate-300 hover:text-white">
                                    <span className="font-bold flex items-center gap-2"><BookOpen size={18}/> Hierarquia & Cargos</span>
                                    {showRoleDetails ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </button>
                                {showRoleDetails && (
                                    <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded-lg p-4 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {ORG_CONFIG[activeTab].roleDetails.map((role, idx) => (
                                            <div key={idx} className="flex flex-col border-l-2 border-slate-600 pl-3">
                                                <span className="text-sm font-bold text-cyan-400">{role.name}</span>
                                                <span className="text-xs text-slate-400">{role.desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {canManageOrg(activeTab) && (
                            <div className="mb-6 flex justify-end">
                                <button onClick={openCreateModal} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105">
                                    <UserPlus size={20} /> Adicionar Novo Membro
                                </button>
                            </div>
                        )}
                        
                        <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                                    <tr>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('role')}>Cargo Discord <SortIcon k="role" sortConfig={sortConfig} ArrowUp={ArrowUp} ArrowDown={ArrowDown} ArrowUpDown={ArrowUpDown}/></th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('name')}>Nome <SortIcon k="name" sortConfig={sortConfig} ArrowUp={ArrowUp} ArrowDown={ArrowDown} ArrowUpDown={ArrowUpDown}/></th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('ninRole')}>Cargo Nin <SortIcon k="ninRole" sortConfig={sortConfig} ArrowUp={ArrowUp} ArrowDown={ArrowDown} ArrowUpDown={ArrowUpDown}/></th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('joinDate')}>Entrada <SortIcon k="joinDate" sortConfig={sortConfig} ArrowUp={ArrowUp} ArrowDown={ArrowDown} ArrowUpDown={ArrowUpDown}/></th>
                                        <th className="p-4 cursor-pointer hover:text-white" onClick={() => requestSort('activity')}>Atividade <SortIcon k="activity" sortConfig={sortConfig} ArrowUp={ArrowUp} ArrowDown={ArrowDown} ArrowUpDown={ArrowUpDown}/></th>
                                        <th className="p-4 text-center cursor-pointer hover:text-white" onClick={() => requestSort('isLeader')}>Líder <SortIcon k="isLeader" sortConfig={sortConfig} ArrowUp={ArrowUp} ArrowDown={ArrowDown} ArrowUpDown={ArrowUpDown}/></th>
                                        {canManageOrg(activeTab) && <th className="p-4 text-right">Ações</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {getSortedMembers(members.filter(m => m.org === activeTab)).map((member) => {
                                        const leaderRoleId = leaderRoleConfig[member.org];
                                        const leaderRoleName = member.isLeader && leaderRoleId ? discordRoles.find(r => r.id === leaderRoleId)?.name : null;
                                        const orgInfo = getMemberOrgsInfo(member.discordId);
                                        const activity = getActivityStats(member);
                                        
                                        return (
                                            <tr key={member.id} className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${member.isLeader ? 'bg-yellow-900/10' : ''}`} onClick={() => { if(canManageOrg(activeTab)) openEditModal(member); }}>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${ORG_CONFIG[activeTab].border} ${ORG_CONFIG[activeTab].color} bg-opacity-10`}>{member.role}</span>
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
                                                            {(member.masteries||[]).map(m => { 
                                                                const mData = MASTERIES.find(mastery => mastery.id === m); 
                                                                if (!mData) return null; 
                                                                return (
                                                                    <div key={m} className={`flex items-center gap-1 ${mData.color} bg-slate-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-${mData.color.split('-')[1]}-500/20`}>
                                                                        {React.createElement(mData.icon, {size: 12})}
                                                                        <span>{m}</span>
                                                                    </div>
                                                                ) 
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
                                                    {canManageOrg(activeTab) ? (
                                                        <button onClick={(e) => { e.stopPropagation(); handleToggleLeader(member); }} className={`p-2 rounded-full transition-all ${member.isLeader ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-600 hover:text-yellow-400'}`} title={member.isLeader ? "Remover Liderança" : "Promover a Líder"}>
                                                            <Crown size={18} fill={member.isLeader ? "currentColor" : "none"} />
                                                        </button>
                                                    ) : (
                                                        member.isLeader && <Crown size={18} className="text-yellow-400 inline-block" fill="currentColor"/>
                                                    )}
                                                </td>
                                                {canManageOrg(activeTab) && (
                                                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => setDeleteConfirmation(member.id)} className="text-slate-500 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
