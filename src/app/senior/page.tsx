'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SeniorLandingPage() {
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
        console.log(`Registered email (Senior): ${email}`);
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
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />

            <div className="theme-senior">
                {/* Navbar */}
                <nav style={{ padding: '15px 0', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/icon.svg`} alt="DeepSafe Logo" style={{ height: '45px', width: '45px' }} />
                            <span style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: '1.5rem', letterSpacing: '1px', color: '#064e3b' }}>DEEPSAFE</span>
                        </div>
                        <a href="#download" className="btn btn-primary" style={{ fontSize: '1rem' }}>SCARICA L'APP</a>
                    </div>
                </nav>

                {/* Hero Section */}
                <header className="hero section">
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h1 style={{ fontSize: '2.8rem', marginBottom: '25px', lineHeight: 1.3 }}>
                                    Naviga in Sicurezza,<br /> Senza Paura.
                                </h1>
                                <p style={{ fontSize: '1.25rem', marginBottom: '35px', color: '#4b5563', lineHeight: 1.7 }}>
                                    Internet può sembrare complicato, ma non deve essere pericoloso.
                                    Impara a riconoscere le truffe, proteggere i tuoi risparmi e navigare serenamente con la nostra
                                    app semplice e intuitiva.
                                </p>
                                <a href="#download" className="btn btn-primary">SCARICA L'APP</a>
                                <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>* Nessuna carta di credito richiesta
                                </p>
                            </div>
                            <div style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
                                <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/app-screenshot-1.jpg`} alt="Applicazione Facile da Usare"
                                    style={{ borderRadius: '15px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', maxWidth: '80%', margin: '0 auto' }} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Features Section */}
                <section className="section" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="container">
                        <h2 className="text-center" style={{ marginBottom: '50px', fontSize: '2.2rem' }}>Cosa Imparerai</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{ width: '80px', height: '80px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <span style={{ fontSize: '32px' }}>✉️</span>
                                </div>
                                <h3 style={{ marginBottom: '15px', color: '#064e3b' }}>Stop alle Email False</h3>
                                <p>Impara a distinguere una email vera da un tentativo di "phishing" che vuole rubare i tuoi dati.
                                </p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <span style={{ fontSize: '32px' }}>🔒</span>
                                </div>
                                <h3 style={{ marginBottom: '15px', color: '#991b1b' }}>Password Sicure</h3>
                                <p>Scopri come creare password impossibili da indovinare ma facili da ricordare per te.</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{ width: '80px', height: '80px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                    <span style={{ fontSize: '32px' }}>📱</span>
                                </div>
                                <h3 style={{ marginBottom: '15px', color: '#1e40af' }}>Social Consapevole</h3>
                                <p>Usa i social network senza rischi, evitando di condividere informazioni troppo personali.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="section">
                    <div className="container">
                        <div
                            style={{ background: 'white', border: '2px solid #e5e7eb', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px', padding: '0' }}>
                                <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/landing/assets/region.jpg`} alt="Mappa Italia"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: '300px', padding: '50px' }}>
                                <h2 style={{ marginBottom: '20px' }}>Un Viaggio nell'Italia del Futuro</h2>
                                <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                                    L'app è strutturata come un gioco semplice. Viaggerai attraverso le regioni italiane risolvendo
                                    piccoli problemi quotidiani.
                                </p>
                                <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
                                    Niente termini tecnici incomprensibili. Solo esempi pratici e consigli utili per la vita di
                                    tutti i giorni.
                                </p>
                                <ul style={{ marginTop: '30px' }}>
                                    <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginRight: '15px' }}>✓</span>
                                        Lezioni di 5 minuti
                                    </li>
                                    <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginRight: '15px' }}>✓</span>
                                        Adatto a tutti i livelli
                                    </li>
                                    <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--primary-color)', fontSize: '1.5rem', marginRight: '15px' }}>✓</span>
                                        Divertente e rilassante
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Waitlist Section */}
                <section id="waitlist" className="section" style={{ backgroundColor: '#ecfdf5' }}>
                    <div className="container text-center">
                        <h2 style={{ marginBottom: '20px', color: '#064e3b' }}>Unisciti alla Lista d'Attesa</h2>
                        <p style={{ marginBottom: '40px', fontSize: '1.2rem' }}>
                            Lascia la tua email per sapere quando l'app sarà disponibile. <br />
                            È gratuito e senza impegno.
                        </p>

                        <form className="waitlist-form" onSubmit={handleWaitlistSubmit}
                            style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                            <label htmlFor="email" style={{ display: 'block', textAlign: 'left', marginBottom: '10px', fontWeight: 500 }}>Il
                                tuo indirizzo email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="nome@esempio.it"
                                required
                                style={{ marginBottom: '20px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? '...' : 'Tienimi Informato'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Download Section */}
                <section id="download" className="section" style={{ backgroundColor: '#f9fafb', textAlign: 'center' }}>
                    <div className="container">
                        <h2 style={{ marginBottom: '30px', color: '#064e3b' }}>Scarica DeepSafe Ora</h2>
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

                <footer style={{ padding: '40px 0', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                    <div className="container">
                        <p>&copy; 2025 DeepSafe. All rights reserved. | <Link href="/privacy-policy" style={{ color: '#888' }}>Privacy Policy</Link> | <Link href="/terms" style={{ color: '#888' }}>Terms</Link></p>
                    </div>
                </footer>
            </div>
        </>
    );
}
