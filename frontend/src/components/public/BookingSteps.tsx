import clsx from 'clsx';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, label: 'Branch' },
  { id: 2, label: 'Court' },
  { id: 3, label: 'Time Slot' },
  { id: 4, label: 'Details' },
  { id: 5, label: 'Confirm' },
];

interface Props {
  current: number;
}

export default function BookingSteps({ current }: Props) {
  return (
    <div className="w-full py-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                  step.id < current && 'bg-brand-600 text-white',
                  step.id === current && 'bg-brand-600 text-white ring-4 ring-brand-100',
                  step.id > current && 'bg-gray-100 text-gray-400',
                )}>
                  {step.id < current ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={clsx(
                  'text-xs font-medium mt-1.5 hidden sm:block',
                  step.id <= current ? 'text-brand-600' : 'text-gray-400'
                )}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={clsx(
                  'flex-1 h-0.5 mx-2 transition-all duration-300',
                  step.id < current ? 'bg-brand-600' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
