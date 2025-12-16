import React, { useEffect, useCallback, ReactNode, RefObject } from 'react';
import ClientOnlyPortal from './ClientOnlyPortal';

export function useOnClickOutside(ref: RefObject<HTMLElement>, handler: (event: Event) => void) {
  const escapeListener = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handler(e);
      }
    },
    [handler]
  );

  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    document.addEventListener('keyup', escapeListener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('keyup', escapeListener);
    };
  }, [ref, handler, escapeListener]);
}

interface PopupProps {
  children: ReactNode;
  heading?: string;
  popupState: boolean;
  className?: string;
  noPadding?: boolean;
  center?: boolean;
}

const Popup = React.forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  const {
    children,
    heading,
    popupState,
    className = '',
    noPadding = false,
    center = false,
    ...others
  } = props;

  return (
    <ClientOnlyPortal selector='#popupContainer'>
      <div
        className={`
          z-[3] fixed top-0 left-0 w-full h-screen bg-black/40 
          transition-opacity duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]
          ${popupState ? 'opacity-100 block' : 'opacity-0 hidden'}
        `}
      />
      <div
        className={`
          max-h-[80vh] min-w-[24vw] fixed top-1/2 left-[calc(50vw+calc(var(--sidebar-width)/2))]
          bg-[#f9f9f9] text-[#303030] flex flex-col z-[4] rounded-[10px]
          transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]
          ${noPadding ? 'p-0' : 'p-10'}
          ${popupState ? 'opacity-100 translate-x-[-50%] translate-y-[-50%] scale-100' : 'opacity-0 translate-x-[-50%] translate-y-[-50%] scale-0'}
          ${center ? 'left-1/2' : ''}
          lg:left-1/2
          ${className}
        `}
        ref={ref}
        {...others}
      >
        {heading ? <h1 className="text-[2rem] mb-10 text-grey-800">{heading}</h1> : null}
        {children}
      </div>
    </ClientOnlyPortal>
  );
});

Popup.displayName = 'Popup';

export { Popup };
