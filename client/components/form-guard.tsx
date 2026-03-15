'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FormGuardContextValue {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  requestNavigation: (href: string) => void;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
}

const FormGuardContext = React.createContext<FormGuardContextValue | null>(null);

export function useFormGuard() {
  const context = React.useContext(FormGuardContext);
  if (!context) {
    throw new Error('useFormGuard must be used within FormGuard');
  }
  return context;
}

interface FormGuardProps {
  isDirty: boolean;
  children: React.ReactNode;
  enabled?: boolean;
  message?: string;
}

export function FormGuard({
  isDirty,
  children,
  enabled = true,
  message = 'You have unsaved changes. Are you sure you want to leave?',
}: FormGuardProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = React.useState(false);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [internalDirty, setInternalDirty] = React.useState(isDirty);

  React.useEffect(() => {
    setInternalDirty(isDirty);
  }, [isDirty]);

  // Browser beforeunload warning
  React.useEffect(() => {
    if (!enabled || !internalDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, internalDirty, message]);

  const requestNavigation = React.useCallback(
    (href: string) => {
      if (enabled && internalDirty) {
        setPendingHref(href);
        setShowDialog(true);
      } else {
        router.push(href);
      }
    },
    [enabled, internalDirty, router]
  );

  const confirmNavigation = React.useCallback(() => {
    setShowDialog(false);
    if (pendingHref) {
      router.push(pendingHref);
      setPendingHref(null);
    }
  }, [pendingHref, router]);

  const cancelNavigation = React.useCallback(() => {
    setShowDialog(false);
    setPendingHref(null);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      isDirty: internalDirty,
      setIsDirty: setInternalDirty,
      requestNavigation,
      confirmNavigation,
      cancelNavigation,
    }),
    [internalDirty, requestNavigation, confirmNavigation, cancelNavigation]
  );

  return (
    <FormGuardContext.Provider value={contextValue}>
      {children}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>Stay on Page</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>Leave Page</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormGuardContext.Provider>
  );
}

export default FormGuard;
