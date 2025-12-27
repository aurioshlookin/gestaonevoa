import React, { useState, useEffect, useMemo } from 'react';
import { Globe, ArrowLeft, Clock, Calendar, User, ChevronRight, History, Activity } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebase.js';
import { formatDateTime } from '../utils/helpers.js';

const MonitoringTab = ({ onBack }) => {
    const [accessLogs, setAccessLogs] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // Busca dados combinados
    useEffect(() => {
        // 1. Logs de Navegação
        const qAccess = query(collection(db, "access_logs"), orderBy("timestamp", "desc"), limit(500));
        const unsubAccess = onSnapshot(qAccess, (snap) => {
            setAccessLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'access' })));
        });

        // 2. Logs de Auditoria (Edições/Ações)
        const qAudit = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(500));
        const unsubAudit = onSnapshot(qAudit, (snap) => {
            setAuditLogs(snap.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(), 
                userId: doc.data().executorId, // Normaliza ID
                username: doc.data().executor, // Normaliza Nome
                type: 'audit' 
            })));
        });

        // 3. Usuários Online
        const qOnline = collection(db, "online_status");
        const unsubOnline = onSnapshot(qOnline, (snap) => {
            const now = new Date();
            const activeUsers = snap.docs.map(doc => doc.data()).filter(u => {
                if(!u.lastSeen) return false;
                return ((now - new Date(u.lastSeen)) / 1000 / 60) <= 5;
            });
            setOnlineUsers(activeUsers);
        });

        return () => { unsubAccess(); unsubAudit(); unsubOnline(); };
    }, []);

    // Agrupa e combina logs por usuário
    const userGroups = useMemo(() => {
        const groups = {};
        
        // Combina as duas listas e ordena por data
        const allLogs = [...accessLogs, ...auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        allLogs.forEach(log => {
            if (!log.userId) return;

            if (!groups[log.userId]) {
                groups[log.userId] = {
                    userId: log.userId,
                    username: log.username,
                    lastAccess: log.timestamp, // O primeiro da lista ordenada é o mais recente
                    totalEntries: 0,
                    totalActions: 0,
                    logs: []
                };
            }
            
            if (log.type === 'access') groups[log.userId].totalEntries += 1;
            if (log.type === 'audit') groups[log.userId].totalActions += 1;
            
            groups[log.userId].logs.push(log);
        });

        return Object.values(groups).sort((a, b) => new Date(b.lastAccess) - new Date(a.lastAccess));
    }, [accessLogs, auditLogs]);

    const getTimeSince = (dateString) => {
        const diff = new Date() - new Date(dateString);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return "Agora mesmo";
        if (minutes < 60) return `Há ${minutes} min`;
        if (hours < 24) return `Há ${hours} horas`;
        if (days === 1) return "Há 1 dia";
        return `Há ${days} dias`;
    };

    // Renderiza Detalhes do Usuário (Drill-down)
    if (selectedUser) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-700 rounded transition-colors text-white flex items-center gap-2">
                            <ArrowLeft size={20} /> <span className="hidden md:inline">Voltar para Lista</span>
                        </button>
                        <div className="p-3 rounded-lg bg-green-900/20 text-green-400"><User size={20} /></div>
                        <div>
                            <h2 className="text-2xl font-bold mist-title text-white">{selectedUser.username}</h2>
                            <p className="text-slate-400 text-xs font-mono">ID: {selectedUser.userId}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="p-4">Data e Hora</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Atividade</th>
                                <th className="p-4 text-right">Tempo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {selectedUser.logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/30">
                                    <td className="p-4 flex items-center gap-2 text-slate-300">
                                        <Calendar size={14} className="text-slate-500"/>
                                        {formatDateTime(log.timestamp)}
                                    </td>
                                    <td className="p-4">
                                        {log.type === 'access' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold border border-blue-500/20">
                                                <Globe size={10} /> Navegação
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] uppercase font-bold border border-purple-500/20">
                                                <History size={10} /> Ação
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {log.type === 'access' ? (
                                            <span className="text-cyan-400">{log.action}</span>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold">{log.action}</span>
                                                <span className="text-xs text-slate-400">
                                                    Alvo: <span className="text-slate-300">{log.target}</span> • {log.details}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right text-slate-500 font-mono text-xs">
                                        {getTimeSince(log.timestamp)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Renderiza Lista Geral
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded transition-colors text-white flex items-center gap-2">
                        <ArrowLeft size={20} /> <span className="hidden md:inline">Voltar</span>
                    </button>
                    <div className="p-3 rounded-lg bg-green-900/20 text-green-400"><Activity size={20} /></div>
                    <h2 className="text-3xl font-bold mist-title text-white">Monitoramento Integrado</h2>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded border border-slate-700 text-sm text-slate-300">
                    <span className="text-green-400 font-bold">{onlineUsers.length}</span> Online Agora
                </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-300">Atividade Recente por Usuário</h3>
                    <span className="text-xs text-slate-500">Clique para ver timeline completa</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto scroll-custom">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="p-4">Usuário</th>
                                <th className="p-4">Última Atividade</th>
                                <th className="p-4 text-center">Resumo</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Ver</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {userGroups.map((group) => {
                                const isOnline = onlineUsers.some(u => u.userId === group.userId);
                                return (
                                    <tr 
                                        key={group.userId} 
                                        className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                                        onClick={() => setSelectedUser(group)}
                                    >
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white">{group.username}</span>
                                                <span className="text-xs text-slate-500">ID: {group.userId}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Clock size={14} className="text-cyan-500"/>
                                                {getTimeSince(group.lastAccess)}
                                            </div>
                                            <span className="text-[10px] text-slate-500">{formatDateTime(group.lastAccess)}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs font-bold border border-blue-500/20" title="Páginas acessadas">
                                                    {group.totalEntries} <Globe size={10} className="inline ml-1"/>
                                                </span>
                                                {group.totalActions > 0 && (
                                                    <span className="bg-purple-900/40 text-purple-300 px-2 py-1 rounded text-xs font-bold border border-purple-500/20" title="Ações realizadas">
                                                        {group.totalActions} <History size={10} className="inline ml-1"/>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {isOnline ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Online
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-600 font-mono">Offline</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <ChevronRight className="inline text-slate-600 group-hover:text-white transition-colors" size={20} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonitoringTab;
