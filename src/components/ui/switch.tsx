import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../../lib/utils';

const IOSSwitch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1E]',
      'data-[state=checked]:bg-[#0A84FF] data-[state=unchecked]:bg-[#39393D]',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.32)] ring-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitive.Root>
));
IOSSwitch.displayName = 'IOSSwitch';

export { IOSSwitch };
