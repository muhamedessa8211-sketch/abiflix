import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  error?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: { label: string; value: string }[];
}

const InputField: React.FC<InputProps> = ({ label, error, as = 'input', options, className = '', ...props }) => {
  const baseClasses = "w-full bg-[#333] text-white border border-transparent focus:border-white focus:ring-0 rounded px-4 py-3 placeholder-gray-400 outline-none transition-colors";
  
  return (
    <div className="mb-4">
      <label className="block text-gray-400 text-sm font-medium mb-1.5 ml-1">{label}</label>
      
      {as === 'textarea' ? (
        <textarea className={`${baseClasses} min-h-[100px]`} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : as === 'select' ? (
        <select className={`${baseClasses} appearance-none`} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input className={baseClasses} {...props} />
      )}
      
      {error && <p className="text-netflix-red text-xs mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default InputField;