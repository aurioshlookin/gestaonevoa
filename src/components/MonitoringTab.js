import React, { useState, useEffect, useMemo } from 'react';
import { Globe, ArrowLeft, Clock, Calendar, User, ChevronRight } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebase.js';
import { formatDateTime } from '../utils/helpers.js';

const MonitoringTab = ({ onBack }) => {
    const [accessLogs, setAccessLogs] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Para o Drill-down

    // Busca dados
    useEffect(() => {
        // Aumentei o limite para 500 para pegar um histórico melhor de usuários únicos
        const qLogs = query(collection(db, "access_logs"), orderBy("timestamp", "desc"), limit(500));
        const unsubLogs = onSnapshot(qLogs, (snap) => {
            setAccessLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Usuários Online (5 min timeout)
        const qOnline = collection(db, "online_status");
        const unsubOnline = onSnapshot(qOnline, (snap) => {
            const now = new Date();
            const activeUsers = snap.docs.map(doc => doc.data()).filter(u => {
                if(!u.lastSeen) return false;
                return ((now - new Date(u.lastSeen)) / 1000 / 60) <= 5;
            });
            setOnlineUsers(activeUsers);
        });

        return () => { unsubLogs(); unsubOnline(); };
    }, []);

    // Agrupa logs por usuário para a lista principal
    const userGroups = useMemo(() => {
        const groups = {};
        accessLogs.forEach(log => {
            if (!groups[log.userId]) {
                groups[log.userId] = {
                    userId: log.userId,
                    username: log.username,
                    lastAccess: log.timestamp,
                    totalEntries: 0,
                    logs: []
                };
            }
            groups[log.userId].totalEntries += 1;
            groups[log.userId].logs.push(log);
        });
        // Retorna array ordenado pelo acesso mais recente
        return Object.values(groups).sort((a, b) => new Date(b.lastAccess) - new Date(a.lastAccess));
    }, [accessLogs]);

    // Função para calcular "Há X tempo"
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

    // Renderiza a lista de logs de um usuário específico
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
                                <th className="p-4">Ação</th>
                                <th className="p-4 text-right">Tempo Relativo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {selectedUser.logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/30">
                                    <td className="p-4 flex items-center gap-2 text-slate-300">
                                        <Calendar size={14} className="text-slate-500"/>
                                        {formatDateTime(log.timestamp)}
                                    </td>
                                    <td className="p-4 font-bold text-green-400">
                                        {log.action}
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

    // Renderiza a visão geral (Lista de Usuários)
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded transition-colors text-white flex items-center gap-2">
                        <ArrowLeft size={20} /> <span className="hidden md:inline">Voltar</span>
                    </button>
                    <div className="p-3 rounded-lg bg-green-900/20 text-green-400"><Globe size={20} /></div>
                    <h2 className="text-3xl font-bold mist-title text-white">Monitoramento de Acesso</h2>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded border border-slate-700 text-sm text-slate-300">
                    <span className="text-green-400 font-bold">{onlineUsers.length}</span> Online Agora
                </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-300">Últimos Acessos por Usuário</h3>
                    <span className="text-xs text-slate-500">Clique para ver detalhes</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto scroll-custom">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/30 text-slate-400 text-xs uppercase sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="p-4">Usuário</th>
                                <th className="p-4">Último Acesso</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Ação</th>
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
