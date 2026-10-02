import React from 'react';
import { useApp } from '../../context/AppContext';
import { FormFieldItem } from '../../types/tools';
import { CheckSquare, Type, Layers, AlertCircle, Snowflake } from 'lucide-react';

interface PdfFormsConfigProps {
  fields: FormFieldItem[];
  fieldValues: Record<string, string | boolean>;
  onFieldValueChange: (name: string, value: string | boolean) => void;
  flattenForm: boolean;
  onFlattenFormChange: (flatten: boolean) => void;
  onResetValues: () => void;
}

export const PdfFormsConfig: React.FC<PdfFormsConfigProps> = ({
  fields,
  fieldValues,
  onFieldValueChange,
  flattenForm,
  onFlattenFormChange,
  onResetValues,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const filledCount = fields.filter(f => {
    const val = fieldValues[f.name];
    if (f.type === 'checkbox') return Boolean(val);
    return val !== undefined && String(val).trim().length > 0;
  }).length;

  return (
    <div className="space-y-6 text-xs text-[#0D0D0D] dark:text-[#F5F0E6]">
      {/* 1. Form Overview Card */}
      <div className="p-4 bg-[#F5F0E6] dark:bg-[#1A1A1A] rounded-xl border border-[#C7C9CC] dark:border-[#333333] space-y-3">
        <div className="flex items-center justify-between border-b border-[#C7C9CC]/40 dark:border-[#262626] pb-2.5">
          <span className="font-bold flex items-center gap-1.5 text-[#0D0D0D] dark:text-[#F5F0E6]">
            <CheckSquare size={15} />
            <span>{isAr ? 'حقول النموذج المكتشفة:' : 'Detected AcroForm Fields:'}</span>
          </span>
          <span className="font-mono text-xs font-bold text-[#0D0D0D] dark:text-white">
            {fields.length} {isAr ? 'حقل' : 'field(s)'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#5A5D61] dark:text-[#A0A2A6] flex items-center gap-1.5">
            <Layers size={13} />
            <span>{isAr ? 'الحقول المكتملة:' : 'Fields Populated:'}</span>
          </span>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            {filledCount} / {fields.length}
          </span>
        </div>
      </div>

      {/* 2. Interactive Fields List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] uppercase tracking-wider text-[#5A5D61] dark:text-[#A0A2A6]">
            {isAr ? 'بيانات الحقول التفاعلية' : 'Interactive Field Entries'}
          </span>
          {fields.length > 0 && (
            <button
              type="button"
              onClick={onResetValues}
              className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white underline transition-colors"
            >
              {isAr ? 'إعادة ضبط القيم' : 'Reset Defaults'}
            </button>
          )}
        </div>

        {fields.length === 0 ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{isAr ? 'لم يتم اكتشاف حقول تفاعلية (AcroForm)' : 'No interactive AcroForm fields detected'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              {isAr
                ? 'هذا المستند لا يحتوي على حقول نماذج مدمجة. يمكنك تجربة "مستند تجريبي حي" أو استخدام أداة "تعديل PDF" لإضافة نصوص وتوقيعات.'
                : 'This document does not contain native fillable form fields. You can test with a sample file or use Edit PDF to add text annotations.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {fields.map(f => {
              const currentVal = fieldValues[f.name] !== undefined ? fieldValues[f.name] : f.value;

              if (f.type === 'checkbox') {
                return (
                  <label
                    key={f.id}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(currentVal)}
                      onChange={e => onFieldValueChange(f.name, e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-[#C7C9CC] text-[#0D0D0D] focus:ring-0 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-[#0D0D0D] dark:text-white capitalize">
                        {f.name.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
                        {isAr ? 'حقل مربع اختيار (Checkbox)' : 'Checkbox verification field'}
                      </div>
                    </div>
                  </label>
                );
              }

              if (f.type === 'dropdown' && f.options && f.options.length > 0) {
                return (
                  <div key={f.id} className="space-y-1.5">
                    <label className="block font-semibold text-[11px] text-[#0D0D0D] dark:text-[#F5F0E6] capitalize">
                      {f.name.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <select
                      value={String(currentVal || '')}
                      onChange={e => onFieldValueChange(f.name, e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-white focus:outline-none focus:border-[#0D0D0D] dark:focus:border-white transition-colors"
                    >
                      {f.options.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Text Field (default)
              return (
                <div key={f.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[11px] text-[#0D0D0D] dark:text-[#F5F0E6] capitalize flex items-center gap-1.5">
                      <Type size={13} className="text-[#5A5D61] dark:text-[#A0A2A6]" />
                      <span>{f.name.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                    {f.isRequired && (
                      <span className="text-[10px] text-red-500 font-bold">*</span>
                    )}
                  </div>
                  {f.isMultiline ? (
                    <textarea
                      rows={2}
                      value={String(currentVal || '')}
                      onChange={e => onFieldValueChange(f.name, e.target.value)}
                      placeholder={isAr ? `اكتب ${f.name}...` : `Enter ${f.name}...`}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-white placeholder-[#8C8F94] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-white transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(currentVal || '')}
                      onChange={e => onFieldValueChange(f.name, e.target.value)}
                      placeholder={isAr ? `اكتب ${f.name}...` : `Enter ${f.name}...`}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-white placeholder-[#8C8F94] focus:outline-none focus:border-[#0D0D0D] dark:focus:border-white transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Flatten Form (Freeze Content) Option */}
      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-2">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="font-semibold text-xs text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
            <Snowflake size={14} className="text-blue-600 dark:text-blue-400" />
            <span>{isAr ? 'تجميد النموذج نهائياً (Flatten)' : 'Flatten Form (Freeze Data)'}</span>
          </span>
          <input
            type="checkbox"
            checked={flattenForm}
            onChange={e => onFlattenFormChange(e.target.checked)}
            className="w-4 h-4 rounded border-[#C7C9CC] text-[#0D0D0D] focus:ring-0 cursor-pointer"
          />
        </label>
        <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-relaxed">
          {isAr
            ? 'تثبيت وتجميد البيانات كـ نصوص رسمية ثابتة لمنع التعديل ولضمان ظهورها بدقة في كافة متصفحات الهواتف وتطبيقات PDF.'
            : 'Permanently bakes filled values into vector text, preventing further edits and ensuring compatibility across all viewers.'}
        </p>
      </div>
    </div>
  );
};
