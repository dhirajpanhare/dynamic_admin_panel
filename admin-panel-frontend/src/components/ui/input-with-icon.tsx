import * as React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <Input ref={ref} className={cn('pl-10', className)} {...props} />
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';
