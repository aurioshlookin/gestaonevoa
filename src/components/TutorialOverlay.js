import React from 'react';
// Removemos imports diretos de ícones para evitar conflitos
// Usaremos o objeto Icons global que já está carregado
import { Icons } from '../config/constants.js';

const TutorialOverlay = ({ content, onClose }) => {
    // Safety check: Se não tiver conteúdo, não renderiza nada (ou fecha)
    if (!content) return null;

    // Fallback para ícones caso não estejam carregados
    const BookIcon = (Icons && Icons.BookOpen) ? Icons.BookOpen : 'span';
    const CloseIcon = (Icons && Icons.X) ? Icons.X : 'button';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Máscara de Fundo */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in" 
                onClick={onClose} 
            />

            {/* Modal Central */}
            <div className="bg-slate-800 border border-slate-600 rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-bounce-in">
                
                {/* Cabeçalho */}
                <div className="p-6 border-b border-slate-700 bg-slate-900/50 rounded-t-2xl flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="p-3 bg-cyan-900/30 rounded-xl border border-cyan-500/30 text-cyan-400 h-fit">
                            <BookIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Manual de Funções</h2>
                            <span className="inline-block bg-slate-700 text-cyan-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-slate-600">
                                {content.roleName || "Informações"}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                        title="Fechar Tutorial"
                    >
                        <CloseIcon size={24} />
                    </button>
                </div>

                {/* Conteúdo Scrollável */}
                <div className="p-8 overflow-y-auto scroll-custom space-y-8">
                    
                    {/* Descrição Geral */}
                    {content.description && (
                        <div className="text-lg text-slate-300 leading-relaxed font-light border-l-4 border-cyan-500 pl-4">
                            {content.description}
                        </div>
                    )}

                    {/* Seções */}
                    <div className="grid gap-6">
                        {content.sections && content.sections.map((section, idx) => (
                            <div key={idx} className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50 hover:border-slate-500 transition-colors">
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    {section.title}
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
                            </div>
                        ))}
                        
                        {/* Fallback se não houver seções */}
                        {(!content.sections || content.sections.length === 0) && (
                            <p className="text-slate-500 italic">Nenhuma informação detalhada disponível para este cargo.</p>
                        )}
                    </div>

                </div>

                {/* Rodapé */}
                <div className="p-4 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
