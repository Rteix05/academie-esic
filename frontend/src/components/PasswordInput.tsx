'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Champ mot de passe avec bouton « Afficher / Masquer » (vérifier sa saisie avant de valider).
 * Le mot de passe est remasqué à l'envoi du formulaire : il ne reste pas affiché à l'écran.
 */
export default function PasswordInput({ className = 'field', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        // Pas de correction ni de majuscule automatique quand le texte est visible (mobile)
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className={`${className} pr-14`}
        ref={(el) => {
          // Remasquage à l'envoi du formulaire parent
          const form = el?.form;
          if (!form) return;
          const hide = () => setVisible(false);
          form.addEventListener('submit', hide);
          return () => form.removeEventListener('submit', hide);
        }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        aria-controls={props.id}
        title={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        className="absolute inset-y-0 right-2 my-auto flex h-10 w-10 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-mint hover:text-brand-forest focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-emerald/30 dark:hover:bg-white/10 dark:hover:text-emerald-100"
      >
        {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
