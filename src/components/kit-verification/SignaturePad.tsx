import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
    title: string;
    onSave: (img: string) => void;
}

export const SignaturePad: React.FC<Props> = ({ title, onSave }) => {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [saved, setSaved] = useState(false);
    const [touched, setTouched] = useState(false);

    const clear = () => {
        sigCanvas.current?.clear();
        setSaved(false);
        setTouched(false);
    };

    const save = () => {
        if (sigCanvas.current?.isEmpty()) return;
        const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
        if (dataUrl) {
            onSave(dataUrl);
            setSaved(true);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6 border-2 border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</label>
                {saved && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1 font-black bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full animate-in zoom-in-95">
                        <CheckCircle2 size={12} /> CAPTURADA
                    </span>
                )}
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#0f172a"
                    onBegin={() => setTouched(true)}
                    canvasProps={{ 
                        className: 'w-full h-40 cursor-crosshair'
                    }}
                    onEnd={save}
                />
                {!touched && !saved && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <span className="text-sm font-medium">Firme aquí</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-medium">Use el mouse o panel táctil</p>
                <button
                    onClick={clear}
                    type="button"
                    className="p-2 px-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
                >
                    <Trash2 size={14} /> REPETIR
                </button>
            </div>
        </div>
    );
};

