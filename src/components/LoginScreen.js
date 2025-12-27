import React from 'react';

const LoginScreen = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex items-center justify-center p-4 font-mono">
            <div className="max-w-md w-full bg-slate-800/80 backdrop-blur border border-slate-700 p-8 rounded-2xl text-center shadow-2xl">
                <img src="favicon.png" alt="Logo" className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>Gestão da Névoa</h1>
                <p className="text-slate-400 mb-6 text-sm">Painel Administrativo da Vila Oculta da Névoa</p>
                <button onClick={onLogin} className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 rounded mb-4 transition-colors">
                    Entrar com Discord
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;
