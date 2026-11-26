'use client';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef } from 'react';

export const Switch = forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  ({ className = '', ...props }, ref) => (
    <SwitchPrimitive.Root ref={ref} className={`switch-root ${className}`} {...props}>
      <SwitchPrimitive.Thumb className="switch-thumb" />
    </SwitchPrimitive.Root>
  ),
);
Switch.displayName = 'Switch';
