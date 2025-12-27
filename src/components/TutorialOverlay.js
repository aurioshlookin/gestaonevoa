import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TutorialOverlay = ({ steps, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

    const step = steps[currentStep];

    useEffect(() => {
        if (!step.target) return;

        // Tenta encontrar o elemento na tela
        const element = document.querySelector(step.target);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Posiciona o balão abaixo do elemento, centralizado
            setPosition({
                top: rect.bottom + 10 + 'px',
                left: rect.left + (rect.width / 2) + 'px',
                transform: 'translateX(-50%)',
                targetRect: rect // Salva para o highlight
            });
            // Rola até o elemento
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Fallback: Centro da tela se não achar
            setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
        }
    }, [currentStep, steps]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
        else onClose();
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Máscara Escura (Overlay) */}
            <div className="absolute inset-0 bg-black/60 pointer-events-auto" onClick={onClose} />

            {/* Destaque no Elemento (Hole) - Opcional, visualmente complexo, vamos focar no balão */}
            {position.targetRect && (
                <div 
                    className="absolute border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] rounded transition-all duration-300 pointer-events-none"
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
                className="absolute bg-slate-800 text-white p-6 rounded-xl border border-cyan-500/50 shadow-2xl w-80 pointer-events-auto transition-all duration-300 animate-bounce-in"
                style={{ top: position.top, left: position.left, transform: position.transform }}
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X size={16}/></button>
                
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">{step.message}</p>

                <div className="flex justify-between items-center">
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
                            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
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
