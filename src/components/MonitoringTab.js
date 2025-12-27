import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebase.js';

const MonitoringTab = ({ onBack }) => {
    const [accessLogs, setAccessLogs] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Logs de Acesso
        const qLogs = query(collection(db, "access_logs"), orderBy("timestamp", "desc"), limit(50));
        const unsubLogs = onSnapshot(qLogs, (snap) => {
            setAccessLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Usuários Online
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

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded transition-colors text-white">← Voltar</button>
                    <div className="p-3 rounded-lg bg-green-900/20 text-green-400"><Globe size={20} /></div>
                    <h2 className="text-3xl font-bold mist-title text-white">Acesso</h2>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-green-500/30 rounded-xl p-6 h-full">
                    <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> Online ({onlineUsers.length})
                    </h3>
                    {onlineUsers.length === 0 ? <p className="text-slate-500 italic">Ninguém.</p> : (
                        <div className="space-y-3">
                            {onlineUsers.map((u, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden">
                                            {u.avatar ? <img src={`https://cdn.discordapp.com/avatars/${u.userId}/${u.avatar}.png`} className="w-full h-full" /> : u.username?.charAt(0)}
                                        </div>
                                        <span className="font-bold text-white">{u.username}</span>
                                    </div>
                                    <span className="text-xs text-green-400 font-mono">Ativo</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="glass-panel rounded-xl overflow-hidden border border-slate-700 h-full">
                    <div className="p-4 bg-slate-800/50 border-b border-slate-700"><h3 className="text-lg font-bold text-slate-300">Últimos</h3></div>
                    <div className="max-h-[500px] overflow-y-auto scroll-custom">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-700">
                                {accessLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30">
                                        <td className="p-4 text-xs font-mono text-slate-400 w-32">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                        <td className="p-4">
                                            <span className="font-bold text-cyan-400 block">{log.username}</span>
                                            <span className="text-xs text-slate-500">ID: {log.userId}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">Login</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitoringTab;
