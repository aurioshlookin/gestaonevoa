import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TutorialOverlay = ({ steps, onClose, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
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
                // Destrava momentaneamente para rolar
                document.body.style.overflow = '';
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                
                // Trava novamente após o scroll
                setTimeout(() => {
                    document.body.style.overflow = 'hidden';
                }, 500);
                
                const rect = element.getBoundingClientRect();
                const tooltipWidth = 340; 
                const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 250; 
                const margin = 20;

                let top = rect.bottom + margin;
                let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

                // Clamping Horizontal
                if (left < margin) left = margin;
                if (left + tooltipWidth > window.innerWidth - margin) {
                    left = window.innerWidth - tooltipWidth - margin;
                }

                // Clamping Vertical Inteligente
                const spaceBelow = window.innerHeight - (rect.bottom + margin);
                if (spaceBelow < tooltipHeight) {
                    const spaceAbove = rect.top - margin;
                    if (spaceAbove > tooltipHeight || spaceAbove > spaceBelow) {
                        top = rect.top - margin - tooltipHeight;
                    }
                }
                
                // Garante que não saia da tela
                if (top < margin) top = margin;
                if (top + tooltipHeight > window.innerHeight - margin) {
                    top = window.innerHeight - margin - tooltipHeight;
                }

                setPosition({
                    top: top + 'px',
                    left: left + 'px',
                    transform: 'none',
                    targetRect: rect
                });
            } else {
                setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', targetRect: null });
            }
        };

        // Trava inicial
        document.body.style.overflow = 'hidden';
        
        // Delay para garantir que o DOM atualizou
        const timer = setTimeout(updatePosition, 400);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            document.body.style.overflow = ''; // Destrava ao sair
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
            <div className="absolute inset-0 bg-black/70 pointer-events-auto transition-opacity duration-500" onClick={onClose} />

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

            <div 
                ref={tooltipRef}
                className="absolute bg-slate-800 text-white p-6 rounded-xl border border-cyan-500/50 shadow-2xl w-80 pointer-events-auto transition-all duration-300 animate-bounce-in flex flex-col gap-4 z-[101]"
                style={{ top: position.top, left: position.left, transform: position.transform }}
            >
                <div className="flex justify-between items-start border-b border-slate-700 pb-2">
                    <h3 className="text-lg font-bold text-cyan-400 leading-tight">{step.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18}/></button>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed">{step.message}</p>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
                    <span className="text-xs text-slate-500 font-mono">Passo {currentStep + 1} de {steps.length}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentStep === 0}
                            className="p-2 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-300"
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
