'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { ContentCard } from '@/components/catalog/ContentCard';
import { apiFetch, fetchMe } from '@/lib/api';
import { collection, formationToItem, masterclassToItem, type FormationDto, type MasterclassDto } from '@/lib/catalog';
import { GOALS, INTEREST_GROUPS, LEVELS, recommendFormations, savePreferences, type LearningPreferences } from '@/lib/preferences';

const STEPS = [
  { title: 'Quels domaines vous intéressent ?', lead: 'Choisissez-en autant que vous voulez : nous vous proposerons les formations correspondantes.' },
  { title: 'Où en êtes-vous ?', lead: 'Nous mettrons en avant les formations adaptées à votre niveau.' },
  { title: 'Quel est votre objectif ?', lead: 'Notre parcours de formation se déroule en trois étapes. Où souhaitez-vous aller ?' },
];

/**
 * Parcours guidé proposé juste après l'inscription (et modifiable depuis l'espace élève) :
 * trois questions, puis une sélection de formations adaptée.
 */
export default function BienvenuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstVisit, setFirstVisit] = useState(true);
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<LearningPreferences>({ interests: [], level: null, goal: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formations, setFormations] = useState<FormationDto[]>([]);
  const [masterclasses, setMasterclasses] = useState<MasterclassDto[]>([]);
  const [ownedIds, setOwnedIds] = useState<number[]>([]);

  const headingRef = useRef<HTMLHeadingElement>(null);

  // Réservé aux élèves connectés ; réponses déjà données pré-remplies (modification)
  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      if (me.preferences) setPrefs(me.preferences);
      setFirstVisit(!me.onboarded);
      setLoading(false);
    });

    // Catalogue chargé pendant que l'élève répond
    apiFetch('/api/formations', { headers: { Accept: 'application/ld+json' } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFormations(collection<FormationDto>(data)))
      .catch(() => {});
    apiFetch('/api/masterclasses', { headers: { Accept: 'application/ld+json' } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMasterclasses(collection<MasterclassDto>(data)))
      .catch(() => {});
    apiFetch('/api/mes-formations')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: number }[]) => setOwnedIds(Array.isArray(list) ? list.map((f) => f.id) : []))
      .catch(() => {});
  }, [router]);

  // Changement d'étape : le focus revient sur le titre (lecteurs d'écran, clavier)
  useEffect(() => {
    if (!loading) headingRef.current?.focus();
  }, [step, loading]);

  if (loading) return <Spinner label="Chargement…" />;

  const toggleInterest = (value: string) =>
    setPrefs((p) => ({
      ...p,
      interests: p.interests.includes(value) ? p.interests.filter((i) => i !== value) : [...p.interests, value],
    }));

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!(await savePreferences(prefs))) throw new Error();
      setStep(3);
    } catch {
      setError("Vos réponses n'ont pas pu être enregistrées. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  // « Passer » : le parcours n'est plus proposé (sauf s'il a déjà été rempli : rien à changer)
  const skip = async () => {
    if (firstVisit) await savePreferences({}).catch(() => false);
    router.push('/dashboard');
  };

  const next = () => (step < 2 ? setStep(step + 1) : finish());
  const canContinue = step !== 0 || prefs.interests.length > 0;

  /* ─── Résultats ─────────────────────────────────────────────────────────── */
  if (step === 3) {
    const recommended = recommendFormations(formations, prefs, ownedIds);
    const goal = GOALS.find((g) => g.value === prefs.goal);
    const featuredMasterclasses = masterclasses.filter((mc) => masterclassToItem(mc).available).slice(0, 3);

    return (
      <div className="container-page pb-16 pt-4">
        <section className="relative overflow-hidden rounded-5xl bg-brand-mint px-6 py-12 text-center sm:px-12 dark:bg-[#10231a]">
          <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brand-sage/60 dark:bg-emerald-400/5" />
          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow bg-white dark:bg-white/5"><Check className="h-3.5 w-3.5" aria-hidden="true" /> C&apos;est noté</span>
            <h1 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-3xl font-semibold leading-tight text-brand-forest outline-none sm:text-4xl">
              Votre sélection personnalisée
            </h1>
            <p className="mt-4 text-brand-muted">
              {recommended.length > 0
                ? `${recommended.length} formation${recommended.length > 1 ? 's' : ''} choisie${recommended.length > 1 ? 's' : ''} pour vous selon vos centres d'intérêt et votre niveau.`
                : "Aucune formation ne correspond encore exactement à vos choix : de nouvelles formations arrivent régulièrement. En attendant, parcourez tout le catalogue."}
            </p>
            {goal && prefs.goal !== 'indecis' && (
              <p className="mt-3 text-sm text-brand-forest">
                Votre objectif : <strong>{goal.title}</strong>
              </p>
            )}
          </div>
        </section>

        {recommended.length > 0 && (
          <section aria-labelledby="reco-formations" className="mt-10">
            <h2 id="reco-formations" className="font-display text-xl font-semibold text-brand-forest">Formations recommandées</h2>
            <div className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((f) => <ContentCard key={f.id} item={formationToItem(f)} fluid />)}
            </div>
          </section>
        )}

        {featuredMasterclasses.length > 0 && (
          <section aria-labelledby="reco-masterclasses" className="mt-12">
            <h2 id="reco-masterclasses" className="font-display text-xl font-semibold text-brand-forest">À découvrir aussi : nos masterclasses</h2>
            <p className="mt-1 text-sm text-brand-muted">Des enseignements ciblés, en vidéo ou en livret PDF.</p>
            <div className="mt-5 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredMasterclasses.map((mc) => <ContentCard key={mc.id} item={masterclassToItem(mc)} fluid />)}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Accéder à mon espace
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
          <Link href="/formations" className="btn-secondary">Explorer tout le catalogue</Link>
        </div>
        <p className="mt-6 text-center text-sm text-brand-muted">
          Vous pourrez modifier vos choix à tout moment depuis votre espace.
        </p>
      </div>
    );
  }

  /* ─── Questions ─────────────────────────────────────────────────────────── */
  const current = STEPS[step];

  return (
    <div className="container-page pb-16 pt-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {firstVisit ? 'Bienvenue à l’Académie !' : 'Mes préférences'}</span>
          <button type="button" onClick={skip} className="btn-ghost px-2 text-brand-muted">
            {firstVisit ? 'Passer cette étape' : 'Annuler'}
          </button>
        </div>

        {/* Progression */}
        <div className="mt-6">
          <p className="text-sm font-medium text-brand-muted">Question {step + 1} sur {STEPS.length}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-mint dark:bg-white/10" role="progressbar" aria-label="Progression" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
            <div className="h-full rounded-full bg-brand-emerald transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        <h1 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-3xl font-semibold leading-tight text-brand-forest outline-none sm:text-4xl">
          {current.title}
        </h1>
        <p className="mt-3 text-brand-muted">{current.lead}</p>

        {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>}

        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (canContinue) next();
          }}
        >
          {step === 0 && (
            <div className="space-y-8">
              {INTEREST_GROUPS.map((group) => (
                <fieldset key={group.institut}>
                  <legend className="font-display text-sm font-semibold uppercase tracking-wide text-brand-muted">{group.institut}</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {group.interests.map((interest) => (
                      <ChoiceCard
                        key={interest.value}
                        type="checkbox"
                        name="interests"
                        checked={prefs.interests.includes(interest.value)}
                        onChange={() => toggleInterest(interest.value)}
                        title={interest.value}
                        description={interest.description}
                      />
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="sr-only">Votre niveau</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {LEVELS.map((level) => (
                  <ChoiceCard
                    key={level.value}
                    type="radio"
                    name="level"
                    checked={prefs.level === level.value}
                    onChange={() => setPrefs((p) => ({ ...p, level: level.value }))}
                    title={level.title}
                    description={level.description}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend className="sr-only">Votre objectif</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOALS.map((goal) => (
                  <ChoiceCard
                    key={goal.value}
                    type="radio"
                    name="goal"
                    checked={prefs.goal === goal.value}
                    onChange={() => setPrefs((p) => ({ ...p, goal: goal.value }))}
                    title={goal.title}
                    description={goal.description}
                    icon={<goal.icon className="h-5 w-5" aria-hidden="true" />}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour
              </button>
            ) : <span />}
            <div className="flex flex-col items-end gap-2">
              <button type="submit" disabled={!canContinue || saving} className="btn-primary" aria-describedby={canContinue ? undefined : 'choice-hint'}>
                {saving ? 'Enregistrement…' : step < 2 ? 'Continuer' : 'Voir mes recommandations'}
                <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </button>
              {!canContinue && <p id="choice-hint" className="text-xs text-brand-muted">Choisissez au moins un domaine.</p>}
            </div>
          </div>
          {step > 0 && (
            <p className="mt-4 text-right text-xs text-brand-muted">Question facultative : vous pouvez continuer sans répondre.</p>
          )}
        </form>
      </div>
    </div>
  );
}

/** Option sous forme de carte : vraie case à cocher / bouton radio, masqué visuellement */
function ChoiceCard({ type, name, checked, onChange, title, description, icon }: {
  type: 'checkbox' | 'radio';
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer items-start gap-4 rounded-3xl border-2 p-5 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-emerald/30 ${
        checked
          ? 'border-brand-emerald bg-brand-mint dark:bg-emerald-400/10'
          : 'border-brand-forest/10 bg-white hover:border-brand-emerald/50 dark:border-white/10 dark:bg-white/5'
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      {icon && <span className="icon-tile h-11 w-11 shrink-0 rounded-2xl">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-display font-semibold text-brand-forest">{title}</span>
        <span className="mt-1 block text-sm text-brand-muted">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 transition ${type === 'radio' ? 'rounded-full' : 'rounded-lg'} ${
          checked ? 'border-brand-emerald bg-brand-emerald text-white' : 'border-brand-forest/20'
        }`}
      >
        {checked && <Check className="h-4 w-4" />}
      </span>
    </label>
  );
}
