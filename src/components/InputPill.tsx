import { LinkIcon, Loader2, ArrowRight, CheckCircle } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  isValid?: boolean;
};

export default function InputPill({ value, onChange, placeholder = 'Paste article URL to analyze...', onSubmit, isLoading = false, disabled = false, isValid = false }: Props) {
  return (
    <div className="relative flex items-center bg-white/90 dark:bg-slate-900/70 backdrop-blur rounded-full p-2 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 dark:ring-slate-300/10">
      <div className="pl-4 text-slate-400 dark:text-slate-400"><LinkIcon className="w-5 h-5" /></div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 focus:outline-none text-lg"
        disabled={disabled || isLoading}
      />
      {isValid && (
        <div className="pr-3 text-emerald-500"><CheckCircle className="w-5 h-5" /></div>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isLoading}
        className={`rounded-full px-8 py-3 font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 ${disabled || isLoading ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'}`}
      >
        {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>) : (<>Analyze <ArrowRight className="w-4 h-4" /></>)}
      </button>
    </div>
  );
}
