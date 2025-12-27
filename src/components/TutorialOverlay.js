import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TutorialOverlay = ({ steps, onClose, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    // Estado inicial seguro
    const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const tooltipRef = useRef(null);

    const step = steps[currentStep];

    useEffect(() => {
        if (onStepChange && step) {
            onStepChange(step);
        }
    }, [currentStep, step, onStepChange]);

    useEffect(() => {
        if (!step || !step.target) return;

        const updatePosition = () => {
            const element = document.querySelector(step.target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                const rect = element.getBoundingClientRect();
                const tooltipWidth = 320; // Largura aproximada do balão
                const tooltipHeight = 200; // Altura aproximada
                const margin = 20;

                let top = rect.bottom + margin;
                let left = rect.left + (rect.width / 2);
                let transform = 'translateX(-50%)';

                // Lógica de colisão com as bordas da tela
                
                // Se estiver muito embaixo, joga para cima do elemento
                if (top + tooltipHeight > window.innerHeight) {
                    top = rect.top - margin - tooltipHeight;
                    // Se mesmo assim vazar em cima (elemento muito grande), centraliza na tela
                    if (top < 0) {
                        top = window.innerHeight / 2;
                        left = window.innerWidth / 2;
                        transform = 'translate(-50%, -50%)';
                    }
                }

                // Se estiver muito à direita, ajusta para a esquerda
                if (left + (tooltipWidth / 2) > window.innerWidth) {
                    left = window.innerWidth - margin - tooltipWidth;
                    transform = 'none';
                }

                // Se estiver muito à esquerda
                if (left - (tooltipWidth / 2) < 0) {
                    left = margin;
                    transform = 'none';
                }

                setPosition({
                    top: top + 'px',
                    left: left + 'px',
                    transform: transform,
                    targetRect: rect
                });
            } else {
                // Fallback: Centro da tela se não achar o elemento
                setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', targetRect: null });
            }
        };

        // Delay para garantir renderização/navegação
        const timer = setTimeout(updatePosition, 400);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
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
            <div className="absolute inset-0 bg-black/70 pointer-events-auto transition-opacity duration-500" onClick={onClose} />

            {/* Destaque (Hole) no elemento alvo */}
            {position.targetRect && (
                <div 
                    className="absolute border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] rounded transition-all duration-300 ease-in-out pointer-events-none box-content"
                    style={{
                        top: position.targetRect.top - 5,
                        left: position.targetRect.left - 5,
                        width: position.targetRect.width + 10,
                        height: position.targetRect.height + 10,
                    }}
                />
            )}

            {/* Balão de Texto */}
            <div 
                ref={tooltipRef}
                className="absolute bg-slate-800 text-white p-6 rounded-xl border border-cyan-500/50 shadow-2xl w-80 pointer-events-auto transition-all duration-300 animate-bounce-in flex flex-col gap-4 z-[101]"
                style={{ top: position.top, left: position.left, transform: position.transform }}
            >
                <div className="flex justify-between items-start border-b border-slate-700 pb-2">
                    <h3 className="text-lg font-bold text-cyan-400 leading-tight">{step.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Fechar tutorial"><X size={18}/></button>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed">{step.message}</p>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500 font-mono">Passo {currentStep + 1} de {steps.length}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentStep === 0}
                            className="p-2 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-300"
                            aria-label="Anterior"
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
