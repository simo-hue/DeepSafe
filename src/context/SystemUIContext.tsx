'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    message: string;
    type: ToastType;
    visible: boolean;
}

interface ModalState {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    visible: boolean;
    type?: 'alert' | 'info'; // For visual styling if needed
}

interface SystemUIContextType {
    toast: ToastState;
    modal: ModalState;
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
    openModal: (params: { title: string; message: string; actionLabel?: string; onAction?: () => void; type?: 'alert' | 'info' }) => void;
    closeModal: () => void;
}

const SystemUIContext = createContext<SystemUIContextType | undefined>(undefined);

export const SystemUIProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'info',
        visible: false,
    });

    const [modal, setModal] = useState<ModalState>({
        title: '',
        message: '',
        visible: false,
    });

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({ message, type, visible: true });
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, visible: false }));
    }, []);

    const openModal = useCallback((params: { title: string; message: string; actionLabel?: string; onAction?: () => void; type?: 'alert' | 'info' }) => {
        setModal({
            title: params.title,
            message: params.message,
            actionLabel: params.actionLabel,
            onAction: params.onAction,
            visible: true,
            type: params.type,
        });
    }, []);

    const closeModal = useCallback(() => {
        setModal((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <SystemUIContext.Provider value={{ toast, modal, showToast, hideToast, openModal, closeModal }}>
            {children}
        </SystemUIContext.Provider>
    );
};

export const useSystemUI = () => {
    const context = useContext(SystemUIContext);
    if (context === undefined) {
        throw new Error('useSystemUI must be used within a SystemUIProvider');
    }
    return context;
};
