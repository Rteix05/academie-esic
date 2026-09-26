'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Check, AlertCircle } from 'lucide-react';
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
    return <div className="min-h-screen bg-[#FBFBFA] flex items-center justify-center text-[#0F291E] font-medium">Chargement du profil...</div>;
  }

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1C2C24] font-sans antialiased">
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#0F291E] transition">← Mon espace</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-bold text-[#0F291E]">Mon profil</span>
        </div>

        <h1 className="text-4xl font-black text-[#0F291E] tracking-tight mb-10">Mon Profil</h1>

        <div className="flex flex-col gap-8">

          {/* Informations personnelles */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-700" />
              </div>
              <h2 className="text-lg font-bold text-[#0F291E]">Informations personnelles</h2>
            </div>

            {profileMsg && (
              <div className={`mb-5 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {profileMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">L'adresse email ne peut pas être modifiée.</p>
              </div>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-[#0F291E] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-emerald-900 transition disabled:opacity-60"
              >
                {isSavingProfile ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </form>
          </div>

          {/* Changement de mot de passe */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-[#0F291E]">Changer le mot de passe</h2>
            </div>

            {passwordMsg && (
              <div className={`mb-5 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {passwordMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={savePassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-6 py-2.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-amber-700 transition disabled:opacity-60"
              >
                {isSavingPassword ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>

        </div>
      </section>
    </main>
  );
}
