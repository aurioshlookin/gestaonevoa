import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TutorialOverlay = ({ steps, onClose, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

    const step = steps[currentStep];

    // Efeito para notificar o App.js sobre a navegação (abrir páginas)
    useEffect(() => {
        if (onStepChange && step) {
            onStepChange(step);
        }
    }, [currentStep, step, onStepChange]);

    useEffect(() => {
        if (!step || !step.target) return;

        // Pequeno delay para permitir que a página carregue/navegue antes de buscar o elemento
        const timer = setTimeout(() => {
            const element = document.querySelector(step.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + 15 + 'px',
                    left: rect.left + (rect.width / 2) + 'px',
                    transform: 'translateX(-50%)',
                    targetRect: rect
                });
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // Se não achar o elemento, centraliza na tela
                setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', targetRect: null });
            }
        }, 300); // 300ms de delay para a troca de aba ocorrer

        return () => clearTimeout(timer);
    }, [currentStep, step]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        else onClose();
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    if (!step) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Máscara Escura */}
            <div className="absolute inset-0 bg-black/60 pointer-events-auto transition-opacity duration-500" onClick={onClose} />

            {/* Destaque (Hole) */}
            {position.targetRect && (
                <div 
                    className="absolute border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] rounded transition-all duration-300 ease-in-out pointer-events-none"
                    style={{
                        top: position.targetRect.top - 5,
                        left: position.targetRect.left - 5,
                        width: position.targetRect.width + 10,
                        height: position.targetRect.height + 10,
                    }}
                />
            )}

            {/* Balão */}
            <div 
                className="absolute bg-slate-800 text-white p-6 rounded-xl border border-cyan-500/50 shadow-2xl w-80 pointer-events-auto transition-all duration-300 animate-bounce-in flex flex-col gap-4"
                style={{ top: position.top, left: position.left, transform: position.transform }}
            >
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-cyan-400 leading-tight">{step.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white -mt-1 -mr-1"><X size={16}/></button>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed">{step.message}</p>

                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-500 font-mono">{currentStep + 1} / {steps.length}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentStep === 0}
                            className="p-2 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft size={20}/>
                        </button>
                        <button 
                            onClick={handleNext} 
                            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-cyan-500/20"
                        >
                            {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
                            {currentStep < steps.length - 1 && <ChevronRight size={16}/>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
