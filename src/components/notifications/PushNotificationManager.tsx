'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

/**
 * Helper function to convert VAPID key from Base64 to Uint8Array.
 * Required by the Push API subscribe method.
 */
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * PushNotificationManager Component
 * 
 * Handles the user interface for enabling/disabling push notifications.
 * 
 * Responsibilities:
 * 1. Checks if the browser supports Push API.
 * 2. Checks current subscription status.
 * 3. Requests permission from the user.
 * 4. Subscribes the user via the Service Worker.
 * 5. Sends the subscription object to our backend API.
 */
export function PushNotificationManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Check for browser support and existing subscription on mount
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    setIsSubscribed(!!sub);
                    setLoading(false);
                });
            });
        } else {
            setLoading(false);
        }
    }, []);

    const subscribe = async () => {
        if (!registration) return;
        setLoading(true);

        try {
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                alert('VAPID Public Key not found!');
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not logged in');

            // Send to backend
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription,
                    userId: user.id
                })
            });

            setIsSubscribed(true);
            alert('Notifiche attivate con successo! 🔔');
        } catch (error) {
            console.error('Failed to subscribe:', error);
            alert('Errore attivazione notifiche. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-cyber-blue" />;

    return (
        <button
            onClick={subscribe}
            disabled={isSubscribed}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isSubscribed
                ? 'bg-green-500/20 text-green-500 cursor-default'
                : 'bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30'
                }`}
        >
            {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            <span className="font-bold text-sm">
                {isSubscribed ? 'Notifiche Attive' : 'Attiva Notifiche'}
            </span>
        </button>
    );
}
