import React, { useState } from 'react';
// Removemos imports diretos de ícones para evitar conflitos
// Usaremos o objeto Icons global que já está carregado
import { Icons } from '../config/constants.js';

const TutorialOverlay = ({ content, onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    // Debug: Verifique o console para ver o conteúdo recebido (Formatado)
    console.log("TutorialOverlay content received:", JSON.stringify(content, null, 2));

    // Safety check: Se não tiver conteúdo, não renderiza nada
    if (!content) return null;

    // Fallback seguro para ícones
    const safeIcons = Icons || {};
    const BookIcon = safeIcons.BookOpen || 'span'; 
    const CloseIcon = safeIcons.X || 'button';     

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('nevoa_tutorial_suppressed', 'true');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Máscara de Fundo */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={handleClose} 
            />

            {/* Modal Central */}
            <div className="bg-slate-800 border border-slate-600 rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-bounce-in">
                
                {/* Cabeçalho */}
                <div className="p-6 border-b border-slate-700 bg-slate-900/50 rounded-t-2xl flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="p-3 bg-cyan-900/30 rounded-xl border border-cyan-500/30 text-cyan-400 h-fit">
                            {/* Renderização segura do ícone */}
                            {typeof BookIcon === 'string' ? <span className="font-bold text-2xl">📖</span> : <BookIcon size={32} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Manual de Funções</h2>
                            <span className="inline-block bg-slate-700 text-cyan-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-slate-600">
                                {content.roleName || "Informações Gerais"}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleClose} 
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                        title="Fechar Tutorial"
                    >
                        {typeof CloseIcon === 'string' ? <span className="font-bold">X</span> : <CloseIcon size={24} />}
                    </button>
                </div>

                {/* Conteúdo Scrollável */}
                <div className="p-8 overflow-y-auto scroll-custom space-y-8">
                    
                    {/* Descrição Geral */}
                    {content.description ? (
                        <div className="text-lg text-slate-300 leading-relaxed font-light border-l-4 border-cyan-500 pl-4">
                            {content.description}
                        </div>
                    ) : (
                        <div className="text-sm text-yellow-500 bg-yellow-900/20 p-2 rounded">
                            Descrição não disponível.
                        </div>
                    )}

                    {/* Seções */}
                    <div className="grid gap-6">
                        {content.sections && content.sections.length > 0 ? (
                            content.sections.map((section, idx) => (
                                <div key={idx} className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50 hover:border-slate-500 transition-colors">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        {section.title}
                                    </h3>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            /* Fallback se não houver seções */
                            <div className="text-center p-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-600">
                                <p className="text-slate-400 italic mb-2">Nenhuma seção detalhada encontrada.</p>
                                <p className="text-xs text-slate-600">Conteúdo recebido: {JSON.stringify(content)}</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Rodapé */}
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    {/* Checkbox "Não mostrar novamente" */}
                    <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-200 transition-colors select-none">
                        <input 
                            type="checkbox" 
                            checked={dontShowAgain} 
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-800"
                        />
                        Não mostrar novamente
                    </label>

                    <button 
                        onClick={handleClose} 
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
