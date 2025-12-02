'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdultLandingPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert('Per favore inserisci un indirizzo email valido.');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        console.log(`Registered email (Adult): ${email}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        alert('Grazie per esserti iscritto alla lista d\'attesa! A breve ti invieremo tutte le istruzioni per accedere all\'app');
        setEmail('');
        setIsSubmitting(false);
    };

    return (
        <>
            {/* External Stylesheets */}
            <link rel="stylesheet" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/css/shared.css`} />
            <link rel="stylesheet" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/css/theme.css`} />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet" />

            <div className="theme-adult">
                {/* Navbar */}
                <nav style={{ padding: '20px 0', position: 'absolute', width: '100%', zIndex: 10 }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/icon.svg`} alt="DeepSafe Logo" style={{ height: '45px', width: '45px' }} />
                            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '1.5rem', letterSpacing: '1px', color: '#111827' }}>DEEPSAFE</span>
                        </div>
                        <a href="#download" className="btn btn-primary">SCARICA L'APP</a>
                    </div>
                </nav>

                <header className="hero section">
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '50px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h1 style={{ fontSize: '3rem', marginBottom: '20px', lineHeight: 1.2 }}>
                                    Il Tuo Futuro Digitale <br /> <span style={{ color: 'var(--primary-color)' }}>È Al Sicuro?</span>
                                </h1>
                                <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#4b5563' }}>
                                    In un mondo sempre più connesso, la sicurezza non è un optional.
                                    Impara a proteggere i tuoi dati, la tua carriera e la tua privacy con un percorso formativo
                                    avanzato e coinvolgente.
                                </p>
                                <a href="#download" className="btn btn-primary" style={{ padding: '15px 30px' }}>SCARICA L'APP</a>
                            </div>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/app-screenshot-2.jpg`} alt="App Dashboard"
                                    style={{ borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Value Props */}
                <section className="section">
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Perché DeepSafe?</h2>
                            <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
                                Un approccio pratico e moderno all'educazione digitale, progettato per chi lavora e vive online.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div
                                    style={{ width: '50px', height: '50px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '24px' }}>🛡️</span>
                                </div>
                                <h3 style={{ marginBottom: '10px' }}>Cyber Security Reale</h3>
                                <p style={{ color: '#666' }}>Simulazioni realistiche di attacchi phishing, malware e violazioni dati per
                                    imparare a riconoscerli all'istante.</p>
                            </div>
                            <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div
                                    style={{ width: '50px', height: '50px', background: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '24px' }}>🤖</span>
                                </div>
                                <h3 style={{ marginBottom: '10px' }}>Intelligenza Artificiale</h3>
                                <p style={{ color: '#666' }}>Comprendi come funziona l'IA, come usarla a tuo vantaggio e come difenderti
                                    dai deepfake.</p>
                            </div>
                            <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div
                                    style={{ width: '50px', height: '50px', background: '#fff7ed', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '24px' }}>📈</span>
                                </div>
                                <h3 style={{ marginBottom: '10px' }}>Micro-Learning</h3>
                                <p style={{ color: '#666' }}>Lezioni brevi ed efficaci ("pillole") che si adattano ai tuoi ritmi
                                    lavorativi. 5 minuti al giorno.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Map/Context Section */}
                <section className="section" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '50px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/region.jpg`} alt="Mappa Regionale"
                                    style={{ borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h2 style={{ marginBottom: '20px' }}>Risolvi Problemi Reali</h2>
                                <p style={{ marginBottom: '20px', color: '#4b5563' }}>
                                    Non è solo teoria. In DeepSafe ti troverai a gestire crisi digitali in un'Italia futuristica.
                                    Ogni provincia rappresenta una sfida diversa, dalla gestione delle password alla protezione
                                    delle infrastrutture critiche.
                                </p>
                                <p style={{ color: '#4b5563' }}>
                                    Metti alla prova le tue competenze e ottieni certificazioni verificate man mano che avanzi.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Waitlist Section */}
                <section id="waitlist" className="section">
                    <div className="container">
                        <div
                            style={{ background: 'var(--primary-color)', borderRadius: '20px', padding: '60px 40px', textAlign: 'center', color: 'white' }}>
                            <h2 style={{ marginBottom: '15px', color: 'white' }}>Proteggi la tua Presenza Digitale</h2>
                            <p style={{ marginBottom: '30px', opacity: 0.9, maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                                Iscriviti ora per ricevere l'accesso prioritario al lancio e una guida esclusiva sulla sicurezza
                                informatica per professionisti.
                            </p>

                            <form className="waitlist-form" style={{ maxWidth: '500px' }} onSubmit={handleWaitlistSubmit}>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <input
                                        type="email"
                                        placeholder="La tua email professionale"
                                        required
                                        style={{ flex: 1, border: 'none' }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <button type="submit" className="btn" disabled={isSubmitting}
                                        style={{ background: '#111827', color: 'white', width: 'auto', paddingLeft: '30px', paddingRight: '30px' }}>
                                        {isSubmitting ? '...' : 'Iscriviti'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Download Section */}
                <section id="download" className="section" style={{ backgroundColor: '#f8fafc', textAlign: 'center' }}>
                    <div className="container">
                        <h2 style={{ marginBottom: '30px' }}>Scarica DeepSafe Ora</h2>
                        <p style={{ marginBottom: '40px' }}>Disponibile per iOS e Android.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <a href="#" className="btn"
                                style={{ background: '#000', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}></span> App Store
                            </a>
                            <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/deepsafe.apk`} className="btn"
                                style={{ background: '#000', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}>🤖</span> Scarica APK
                            </a>
                            <Link href="/dashboard" className="btn"
                                style={{ background: '#000', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}>🌐</span> Web App
                            </Link>
                        </div>
                    </div>
                </section>

                <footer style={{ padding: '40px 0', textAlign: 'center', background: '#fff', borderTop: '1px solid #eee', color: '#666' }}>
                    <div className="container">
                        <p>&copy; 2025 DeepSafe. All rights reserved. | <Link href="/privacy-policy" style={{ color: '#888' }}>Privacy Policy</Link> | <Link href="/terms" style={{ color: '#888' }}>Terms</Link></p>
                    </div>
                </footer>
            </div>
        </>
    );
}
