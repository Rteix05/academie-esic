'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Une erreur est survenue lors de l'inscription.");
      }

      setSuccess(true);
      // Redirection vers le login après 2 secondes
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA] flex items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-black tracking-tight text-[#0F291E] mb-6">
            ACADÉMIE E.S.I.C.
          </Link>
          <h1 className="text-3xl font-bold text-[#0F291E] mb-2">Rejoignez-nous</h1>
          <p className="text-gray-500 text-sm">Créez votre compte pour accéder à nos formations.</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-emerald-600" /></div>
              <h2 className="text-lg font-bold text-[#0F291E] mb-2">Inscription réussie !</h2>
              <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm outline-none"
                  placeholder="eleve@esic.fr"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 px-4 bg-[#0F291E] hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition disabled:opacity-50 shadow-lg shadow-emerald-900/20"
              >
                {isLoading ? "Création en cours..." : "Créer mon compte"}
              </button>
            </form>
          )}
        </div>

        {/* Lien de redirection */}
        <div className="text-center mt-6">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-[#0F291E] transition">
            Déjà inscrit ? <span className="underline underline-offset-4 decoration-2 decoration-emerald-200">Connectez-vous</span>
          </Link>
        </div>
      </div>
    </main>
  );
}