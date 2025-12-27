import React from 'react';
import { RefreshCw, Globe, History, Settings, LogOut } from 'lucide-react';

const Header = ({ 
    loading, 
    activeTab, 
    setActiveTab, 
    canViewHistory, 
    canManageSettings, 
    onOpenSettings, 
    onLogout, 
    user, 
    userRoleLabel 
}) => {
    return (
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
                            <button 
                                onClick={() => setActiveTab('access')} 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'access' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'text-slate-400 hover:text-green-400 hover:bg-slate-800'}`} 
                                title="Monitoramento de Acesso"
                            >
                                <Globe size={20} />
                                <span className="hidden md:inline font-bold text-sm">Monitoramento</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')} 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'}`} 
                                title="Histórico de Modificações"
                            >
                                <History size={20} />
                                <span className="hidden md:inline font-bold text-sm">Histórico</span>
                            </button>
                        </>
                    )}
                    
                    {canManageSettings && (
                        <button onClick={onOpenSettings} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                            <Settings size={20} />
                        </button>
                    )}
                    
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="flex flex-col items-end mr-1">
                            <span className="text-xs font-bold text-slate-300 hidden md:inline leading-none mb-0.5">{user.username}</span>
                            <span className="text-[10px] text-cyan-400 font-bold uppercase hidden md:inline leading-none">{userRoleLabel}</span>
                        </div>
                    </div>
                    
                    <button onClick={onLogout} className="text-slate-400 hover:text-red-400 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
