import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TutorialOverlay = ({ steps, onClose, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    // Estado inicial: Centro da tela
    const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const tooltipRef = useRef(null);

    const step = steps[currentStep];

    // Efeito para notificar o App.js sobre a navegação (abrir páginas)
    useEffect(() => {
        if (onStepChange && step) {
            onStepChange(step);
        }
    }, [currentStep, step, onStepChange]);

    useEffect(() => {
        if (!step || !step.target) return;

        // Função principal de cálculo de posição
        const calculatePosition = () => {
            const element = document.querySelector(step.target);
            
            if (element) {
                const rect = element.getBoundingClientRect();
                
                // Dimensões do Tooltip (w-80 = 320px + paddings/bordas ~ 340px)
                // Usamos o ref para pegar a altura real se disponível, senão um valor seguro
                const tooltipWidth = 340; 
                const tooltipHeight = tooltipRef.current ? tooltipRef.current.offsetHeight : 250; 
                const margin = 20; // Distância das bordas da tela

                // --- CÁLCULO HORIZONTAL ---
                // Tenta centralizar em relação ao elemento alvo
                let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
                
                // "Clamp": Impede que saia pela esquerda
                if (left < margin) left = margin;
                
                // "Clamp": Impede que saia pela direita
                if (left + tooltipWidth > window.innerWidth - margin) {
                    left = window.innerWidth - tooltipWidth - margin;
                }

                // --- CÁLCULO VERTICAL ---
                // Tenta posicionar EMBAIXO do elemento
                let top = rect.bottom + margin;
                
                // Verifica espaço disponível embaixo
                const spaceBelow = window.innerHeight - (rect.bottom + margin);
                
                // Se não couber embaixo, verifica se cabe EM CIMA
                if (spaceBelow < tooltipHeight) {
                    const spaceAbove = rect.top - margin;
                    // Se tiver mais espaço em cima, joga pra cima
                    if (spaceAbove > tooltipHeight || spaceAbove > spaceBelow) {
                        top = rect.top - margin - tooltipHeight;
                    }
                }

                // "Clamp" Vertical final: Garante que não saia pelo topo da tela
                if (top < margin) top = margin;
                
                // "Clamp" Vertical final: Se ainda assim estourar o fundo (tela muito pequena), ajusta
                if (top + tooltipHeight > window.innerHeight - margin) {
                    // Nesse caso extremo, alinha pelo fundo para garantir que os botões apareçam
                    top = window.innerHeight - margin - tooltipHeight;
                }

                setPosition({
                    top: top + 'px',
                    left: left + 'px',
                    transform: 'none', // Removemos transform pois calculamos posições exatas
                    targetRect: rect
                });
            } else {
                // Fallback: Se o elemento não existir, centraliza na tela
                setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', targetRect: null });
            }
        };

        // Lógica de Scroll e Agendamento
        const element = document.querySelector(step.target);
        
        // Trava rolagem inicialmente
        document.body.style.overflow = 'hidden';

        if (element) {
            // Destrava momentaneamente para permitir o scroll automático
            document.body.style.overflow = '';
            
            // Rola até o elemento suavemente e centralizado
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            
            // Aguarda o scroll terminar para calcular a posição final e travar a tela
            setTimeout(() => {
                document.body.style.overflow = 'hidden';
                calculatePosition();
            }, 600); // 600ms é um tempo seguro para a animação 'smooth'
        } else {
            // Se não achar o elemento, calcula imediatamente (fallback)
            calculatePosition();
        }

        // Recalcula se a janela for redimensionada
        window.addEventListener('resize', calculatePosition);

        return () => {
            window.removeEventListener('resize', calculatePosition);
            // Destrava a rolagem ao sair
            document.body.style.overflow = '';
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
