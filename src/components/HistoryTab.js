import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from '../config/firebase.js';
import { ORG_CONFIG } from '../config/constants.js';

const HistoryTab = ({ onBack }) => {
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(50));
        const unsub = onSnapshot(q, (snap) => {
            setAuditLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded transition-colors text-white">← Voltar</button>
                    <div className="p-3 rounded-lg bg-purple-900/20 text-purple-400"><History size={20} /></div>
                    <h2 className="text-3xl font-bold mist-title text-white">Histórico</h2>
                </div>
            </div>
            <div className="glass-panel rounded-xl overflow-hidden border border-slate-700">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                        <tr>
                            <th className="p-4">Data</th>
                            <th className="p-4">Executor</th>
                            <th className="p-4">Ação</th>
                            <th className="p-4">Alvo</th>
                            <th className="p-4">Detalhes</th>
                            <th className="p-4">Org</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {auditLogs.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500 italic">Nada aqui.</td></tr>
                        ) : (
                            auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 text-xs font-mono text-slate-400">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                    <td className="p-4 font-bold text-cyan-400">{log.executor}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                            log.action.includes('Adicionar') ? 'border-emerald-500/30 text-emerald-400 bg-emerald-900/20' : 
                                            log.action.includes('Remover') ? 'border-red-500/30 text-red-400 bg-red-900/20' : 
                                            'border-blue-500/30 text-blue-400 bg-blue-900/20'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-bold">{log.target}</td>
                                    <td className="p-4 text-sm text-slate-300">{log.details}</td>
                                    <td className="p-4 text-xs text-slate-500 uppercase">{ORG_CONFIG[log.org]?.name || log.org}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTab;
