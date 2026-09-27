'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Check, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { apiFetch } from '@/lib/api';

interface UserProfile {
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export default function ProfilPage() {
  const router = useRouter();
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile]   = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    apiFetch('/api/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: UserProfile) => {
        setProfile(data);
        setFirstName(data.firstName ?? '');
        setLastName(data.lastName ?? '');
      })
      .catch(() => { router.push('/login'); });
  }, [router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await apiFetch('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la sauvegarde.');
      setProfileMsg({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setProfile((p) => p ? { ...p, firstName: data.firstName, lastName: data.lastName } : p);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    setIsSavingPassword(true);

    try {
      // Le serveur invalide les anciennes sessions et dépose directement un nouveau cookie
      const res = await apiFetch('/api/me', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du changement de mot de passe.');
      setPasswordMsg({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!profile) {
    return <Spinner label="Chargement du profil…" />;
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || profile.email.charAt(0).toUpperCase();

  return (
    <div className="pb-8">
      <section className="container-page pt-4">
        <div className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-10 sm:px-12 dark:bg-[#10231a]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <nav aria-label="Fil d'Ariane" className="relative flex items-center gap-2 text-sm text-brand-muted">
            <Link href="/dashboard" className="font-medium transition hover:text-brand-emerald">Mon espace</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="font-medium text-brand-forest">Mon profil</span>
          </nav>
          <div className="relative mt-6 flex items-center gap-5">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-forest font-display text-2xl font-semibold text-white ring-8 ring-white/70 dark:ring-white/10" aria-hidden="true">
              {initials}
            </span>
            <div>
              <h1 className="font-display text-3xl font-semibold text-brand-forest sm:text-4xl">Mon profil</h1>
              <p className="mt-1 text-brand-muted">{profile.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-10 grid items-start gap-6 lg:grid-cols-2">
        {/* Informations personnelles */}
        <div className="card p-7">
          <h2 className="flex items-center gap-3 font-display text-lg font-semibold text-brand-forest">
            <span className="icon-tile h-10 w-10 rounded-xl" aria-hidden="true"><User className="h-5 w-5" /></span>
            Informations personnelles
          </h2>

          {profileMsg && <Message msg={profileMsg} />}

          <form onSubmit={saveProfile} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="firstName">Prénom</label>
                <input id="firstName" type="text" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="field" placeholder="Votre prénom" />
              </div>
              <div>
                <label className="field-label" htmlFor="lastName">Nom</label>
                <input id="lastName" type="text" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="field" placeholder="Votre nom" />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input id="email" type="email" value={profile.email} disabled aria-describedby="email-help" className="field cursor-not-allowed opacity-60" />
              <p id="email-help" className="mt-2 text-xs text-brand-muted">L&apos;adresse email ne peut pas être modifiée.</p>
            </div>
            <button type="submit" disabled={isSavingProfile} className="btn-primary-plain">
              {isSavingProfile ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </form>
        </div>

        {/* Mot de passe */}
        <div className="card p-7">
          <h2 className="flex items-center gap-3 font-display text-lg font-semibold text-brand-forest">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700" aria-hidden="true"><Lock className="h-5 w-5" /></span>
            Changer le mot de passe
          </h2>

          {passwordMsg && <Message msg={passwordMsg} />}

          <form onSubmit={savePassword} className="mt-6 space-y-5">
              <p className="text-sm text-brand-muted">Les champs suivis d'un astérisque (*) sont obligatoires.</p>
            <div>
              <label className="field-label" htmlFor="currentPassword">Mot de passe actuel<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
              <input id="currentPassword" type="password" required autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="field" placeholder="••••••••" />
            </div>
            <div>
              <label className="field-label" htmlFor="newPassword">Nouveau mot de passe<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
              <input id="newPassword" type="password" required autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="field" placeholder="••••••••" />
            </div>
            <div>
              <label className="field-label" htmlFor="confirmPassword">Confirmer le nouveau mot de passe<span aria-hidden="true" className="text-red-700 dark:text-red-400"> *</span></label>
              <input id="confirmPassword" type="password" required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isSavingPassword} className="btn-primary-plain">
              {isSavingPassword ? 'Changement…' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Message({ msg }: { msg: { type: 'success' | 'error'; text: string } }) {
  return (
    <p
      role={msg.type === 'error' ? 'alert' : 'status'}
      className={`mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${msg.type === 'success' ? 'bg-brand-sage text-brand-forest' : 'bg-red-50 text-red-700'}`}
    >
      {msg.type === 'success' ? <Check className="h-4 w-4" aria-hidden="true" /> : <AlertCircle className="h-4 w-4" aria-hidden="true" />}
      {msg.text}
    </p>
  );
}
