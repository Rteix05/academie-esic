'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Clock, Pencil } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { ContentCard } from '@/components/catalog/ContentCard';
import { apiFetch, fetchMe } from '@/lib/api';
import { collection, formationToItem, masterclassToItem, type FormationDto, type MasterclassDto } from '@/lib/catalog';
import { GOALS, INTEREST_GROUPS, LEVELS, recommendFormations, savePreferences, type LearningPreferences } from '@/lib/preferences';

const QUESTIONS = [
  { short: 'Vos domaines', title: 'Quels domaines vous intéressent ?', lead: 'Choisissez-en autant que vous voulez : nous vous proposerons les formations correspondantes.' },
  { short: 'Votre niveau', title: 'Où en êtes-vous ?', lead: 'Nous mettrons en avant les formations adaptées à votre niveau.' },
  { short: 'Votre objectif', title: 'Quel est votre objectif ?', lead: 'Notre parcours de formation se déroule en trois étapes. Où souhaitez-vous aller ?' },
];
const RESULTS = QUESTIONS.length;

/**
 * Parcours guidé proposé juste après l'inscription (et modifiable depuis l'espace élève) :
 * trois questions, puis une sélection de formations adaptée.
 */
export default function BienvenuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [firstVisit, setFirstVisit] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<LearningPreferences>({ interests: [], level: null, goal: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formations, setFormations] = useState<FormationDto[] | null>(null);
  const [masterclasses, setMasterclasses] = useState<MasterclassDto[]>([]);
  const [ownedIds, setOwnedIds] = useState<number[]>([]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  // Réservé aux élèves connectés ; réponses déjà données pré-remplies (modification)
  useEffect(() => {
    fetchMe().then((me) => {
      if (!me) {
        router.replace('/login');
        return;
      }
      if (me.preferences) setPrefs(me.preferences);
      setFirstVisit(!me.onboarded);
      setFirstName(me.firstName ?? null);
      setLoading(false);
    });

    // Catalogue chargé pendant que l'élève répond (nombre de formations par domaine, recommandations)
    apiFetch('/api/formations', { headers: { Accept: 'application/ld+json' } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setFormations(collection<FormationDto>(data)))
      .catch(() => setFormations([]));
    apiFetch('/api/masterclasses', { headers: { Accept: 'application/ld+json' } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMasterclasses(collection<MasterclassDto>(data)))
      .catch(() => {});
    apiFetch('/api/mes-formations')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: number }[]) => setOwnedIds(Array.isArray(list) ? list.map((f) => f.id) : []))
      .catch(() => {});
  }, [router]);

  // Changement d'étape : focus sur le titre (lecteurs d'écran, clavier) et retour en haut de page
  useEffect(() => {
    if (loading) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setStep(RESULTS);
    } catch {
      setError("Vos réponses n'ont pas pu être enregistrées. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  // « Passer » : le parcours n'est plus proposé (s'il a déjà été rempli, rien ne change)
  const skip = async () => {
    if (firstVisit) await savePreferences({}).catch(() => false);
    router.push('/dashboard');
  };

  const level = LEVELS.find((l) => l.value === prefs.level);
  const goal = GOALS.find((g) => g.value === prefs.goal);
  const answers = [
    prefs.interests.length ? `${prefs.interests.length} domaine${prefs.interests.length > 1 ? 's' : ''}` : null,
    level?.title ?? null,
    goal?.title ?? null,
  ];
  const countFor = (category: string) => formations?.filter((f) => f.category === category).length;

  /* ─── Panneau des étapes ─────────────────────────────────────────────────── */
  const stepsPanel = (
    <aside className="hidden rounded-4xl border border-brand-forest/10 bg-white p-8 lg:flex lg:flex-col dark:border-white/10 dark:bg-white/5">
      <p className="eyebrow">{firstVisit ? 'Bienvenue à l’Académie' : 'Mes préférences'}</p>
      <p className="mt-3 font-display text-2xl font-medium leading-snug text-brand-forest">
        {firstVisit ? <>Construisons votre parcours{firstName ? `, ${firstName}` : ''}</> : 'Ajustez vos recommandations'}
      </p>
      <p className="mt-2 flex items-center gap-2 text-base text-brand-muted">
        <Clock className="h-4 w-4 text-brand-emerald" aria-hidden="true" /> 3 questions, moins d&apos;une minute
      </p>

      <nav aria-label="Étapes" className="mt-8 border-t border-brand-forest/10 pt-6 dark:border-white/10">
        <ol className="space-y-1">
          {[...QUESTIONS.map((q) => q.short), 'Votre sélection'].map((label, i) => {
            const done = i < step;
            const current = i === step;
            const content = (
              <>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-medium transition-colors ${
                    done ? 'bg-brand-emerald text-white' : current ? 'border-2 border-brand-emerald text-brand-emerald' : 'border border-brand-forest/20 text-brand-muted dark:border-white/20'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className="min-w-0 text-left">
                  <span className={`block text-base font-medium ${current || done ? 'text-brand-forest' : 'text-brand-muted'}`}>{label}</span>
                  {done && answers[i] && <span className="block truncate text-sm text-brand-muted">{answers[i]}</span>}
                </span>
              </>
            );
            return (
              <li key={label} aria-current={current ? 'step' : undefined}>
                {done && step < RESULTS ? (
                  <button type="button" onClick={() => setStep(i)} className="flex w-full items-center gap-4 rounded-xl px-2 py-2 transition-colors hover:bg-brand-forest/[0.04]">
                    {content}
                    <span className="sr-only"> : modifier</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 px-2 py-2">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {step < RESULTS && (
        <button type="button" onClick={skip} className="btn-ghost mt-8 self-start px-0 text-brand-muted">
          {firstVisit ? 'Passer cette étape' : 'Annuler'}
        </button>
      )}
    </aside>
  );

  /* ─── Résultats ─────────────────────────────────────────────────────────── */
  if (step === RESULTS) {
    const recommended = recommendFormations(formations ?? [], prefs, ownedIds);
    const featuredMasterclasses = masterclasses.filter((mc) => masterclassToItem(mc).available).slice(0, 3);

    return (
      <div className="container-page pb-16 pt-4">
        <section className="grid gap-8 border-b border-brand-forest/10 pb-12 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end dark:border-white/10">
          <div>
            <p className="eyebrow"><Check className="h-4 w-4" aria-hidden="true" /> C&apos;est noté{firstName ? `, ${firstName}` : ''}</p>
            <h1 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-4xl font-medium leading-tight tracking-[-0.03em] text-brand-forest outline-none sm:text-5xl">
              Votre sélection personnalisée
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-muted">
              {recommended.length > 0
                ? `${recommended.length} formation${recommended.length > 1 ? 's' : ''} choisie${recommended.length > 1 ? 's' : ''} pour vous, selon vos centres d'intérêt et votre niveau.`
                : "Aucune formation ne correspond encore exactement à vos choix : de nouvelles formations arrivent régulièrement. En attendant, parcourez tout le catalogue."}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Vos choix">
              {prefs.interests.map((i) => <li key={i} className="chip">{i}</li>)}
              {level && <li className="chip">{level.title}</li>}
              {goal && <li className="chip bg-amber-100 text-amber-900">Objectif : {goal.title}</li>}
            </ul>
          </div>
          <button type="button" onClick={() => setStep(0)} className="btn-secondary self-start lg:self-end">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Modifier mes choix
          </button>
        </section>

        {recommended.length > 0 && (
          <section aria-labelledby="reco-formations" className="mt-14">
            <h2 id="reco-formations" className="section-title">Formations recommandées</h2>
            <p className="section-lead">Les formations à votre niveau apparaissent en premier.</p>
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((f) => <ContentCard key={f.id} item={formationToItem(f)} fluid />)}
            </div>
          </section>
        )}

        {featuredMasterclasses.length > 0 && (
          <section aria-labelledby="reco-masterclasses" className="mt-20">
            <h2 id="reco-masterclasses" className="section-title">À découvrir aussi : nos masterclasses</h2>
            <p className="section-lead">Des enseignements ciblés, en vidéo ou en livret PDF.</p>
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {featuredMasterclasses.map((mc) => <ContentCard key={mc.id} item={masterclassToItem(mc)} fluid />)}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Accéder à mon espace
            <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
          </Link>
          <Link href="/formations" className="btn-secondary">Voir tout le catalogue</Link>
        </div>
        <p className="mt-6 text-center text-sm text-brand-muted">
          Vous pourrez modifier vos choix à tout moment depuis votre espace.
        </p>
      </div>
    );
  }

  /* ─── Questions ─────────────────────────────────────────────────────────── */
  const current = QUESTIONS[step];
  const canContinue = step !== 0 || prefs.interests.length > 0;

  return (
    <div className="container-page pb-10 pt-4">
      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {stepsPanel}

        <div className="rounded-4xl border border-brand-forest/10 bg-white dark:border-white/10 dark:bg-white/[0.03]">
          <form
            className="p-6 sm:p-10"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canContinue || saving) return;
              if (step < QUESTIONS.length - 1) setStep(step + 1);
              else finish();
            }}
          >
            {/* Progression (petits écrans : le panneau des étapes est masqué) */}
            <div className="mb-8 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow">{firstVisit ? 'Bienvenue' : 'Mes préférences'}</span>
                <button type="button" onClick={skip} className="text-sm font-medium text-brand-muted underline-offset-4 hover:underline">
                  {firstVisit ? 'Passer' : 'Annuler'}
                </button>
              </div>
              <div className="mt-5 flex gap-2" aria-hidden="true">
                {QUESTIONS.map((q, i) => (
                  <span key={q.short} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-emerald' : 'bg-brand-mint dark:bg-white/10'}`} />
                ))}
              </div>
            </div>

            <div key={step}>
              <p className="font-display text-sm font-medium text-brand-emerald">Question {step + 1} sur {QUESTIONS.length}</p>
              <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-3xl font-medium leading-tight text-brand-forest outline-none sm:text-4xl">
                {current.title}
              </h1>
              <p className="mt-3 max-w-2xl text-brand-muted">{current.lead}</p>

              {error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</p>}

              <div className="mt-8">
                {step === 0 && (
                  <div className="space-y-8">
                    {INTEREST_GROUPS.map((group) => (
                      <fieldset key={group.institut}>
                        <legend className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-display font-medium text-brand-forest">{group.institut}</span>
                          <span className="text-sm text-brand-muted">{group.label}</span>
                        </legend>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {group.interests.map((interest) => {
                            const count = countFor(interest.value);
                            return (
                              <ChoiceCard
                                key={interest.value}
                                type="checkbox"
                                name="interests"
                                checked={prefs.interests.includes(interest.value)}
                                onChange={() => toggleInterest(interest.value)}
                                title={interest.value}
                                description={interest.description}
                                icon={<interest.icon className="h-5 w-5" aria-hidden="true" />}
                                meta={count === undefined ? null : count > 0 ? `${count} formation${count > 1 ? 's' : ''}` : 'Bientôt'}
                              />
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <fieldset>
                    <legend className="sr-only">Votre niveau</legend>
                    <div className="grid gap-3 md:grid-cols-3">
                      {LEVELS.map((l, i) => (
                        <ChoiceCard
                          key={l.value}
                          type="radio"
                          name="level"
                          stacked
                          checked={prefs.level === l.value}
                          onChange={() => setPrefs((p) => ({ ...p, level: l.value }))}
                          title={l.title}
                          description={l.description}
                          icon={<LevelBars level={i + 1} />}
                          meta={l.value}
                        />
                      ))}
                    </div>
                  </fieldset>
                )}

                {step === 2 && (
                  <fieldset>
                    <legend className="sr-only">Votre objectif</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {GOALS.map((g, i) => (
                        <ChoiceCard
                          key={g.value}
                          type="radio"
                          name="goal"
                          checked={prefs.goal === g.value}
                          onChange={() => setPrefs((p) => ({ ...p, goal: g.value }))}
                          title={g.title}
                          description={g.description}
                          icon={<g.icon className="h-5 w-5" aria-hidden="true" />}
                          meta={g.value === 'indecis' ? null : `Étape ${i + 1} du parcours`}
                        />
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>
            </div>

            {/* Actions : collées en bas de l'écran sur mobile */}
            <div className="sticky bottom-0 -mx-6 mt-10 border-t border-brand-forest/10 bg-white px-6 py-4 sm:-mx-10 sm:px-10 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 dark:border-white/10 dark:bg-[#0d1d15] lg:dark:bg-transparent">
              <div className="flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary px-5">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Retour</span><span className="sr-only sm:hidden">Retour</span>
                  </button>
                ) : (
                  <p className="text-sm text-brand-muted" id="choice-hint" aria-live="polite">
                    {prefs.interests.length === 0
                      ? 'Choisissez au moins un domaine.'
                      : `${prefs.interests.length} domaine${prefs.interests.length > 1 ? 's' : ''} sélectionné${prefs.interests.length > 1 ? 's' : ''}`}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={!canContinue || saving}
                  className="btn-primary"
                  aria-describedby={step === 0 ? 'choice-hint' : undefined}
                >
                  {saving ? 'Enregistrement…' : step < QUESTIONS.length - 1 ? 'Continuer' : 'Voir ma sélection'}
                  <span className="btn-icon"><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </button>
              </div>
              {step > 0 && (
                <p className="mt-3 text-right text-xs text-brand-muted">Question facultative : vous pouvez continuer sans répondre.</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Trois barres de hauteur croissante, remplies selon le niveau */
function LevelBars({ level }: { level: number }) {
  return (
    <span className="flex h-5 items-end gap-1" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span key={n} className={`w-1.5 rounded-full ${n <= level ? 'bg-current' : 'bg-current opacity-25'}`} style={{ height: `${n * 33}%` }} />
      ))}
    </span>
  );
}

/** Option sous forme de carte : vraie case à cocher / bouton radio, masqué visuellement */
function ChoiceCard({ type, name, checked, onChange, title, description, icon, meta, stacked = false }: {
  type: 'checkbox' | 'radio';
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  /** Information complémentaire (nombre de formations, étape…) */
  meta?: string | null;
  /** Icône au-dessus du texte (cartes étroites) */
  stacked?: boolean;
}) {
  return (
    <label
      className={`group relative flex cursor-pointer gap-4 rounded-3xl border-2 p-5 transition duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-emerald/30 ${
        stacked ? 'flex-col' : 'items-start'
      } ${
        checked
          ? 'border-brand-emerald bg-brand-mint shadow-card dark:bg-emerald-400/10'
          : 'border-brand-forest/10 bg-white hover:-translate-y-0.5 hover:border-brand-emerald/50 hover:shadow-card dark:border-white/10 dark:bg-white/5'
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
          checked ? 'bg-brand-emerald text-white' : 'bg-brand-mint text-brand-emerald dark:bg-emerald-400/10 dark:text-emerald-300'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block pr-7 font-display font-medium text-brand-forest">{title}</span>
        <span className="mt-1 block text-sm leading-snug text-brand-muted">{description}</span>
        {meta && <span className="mt-3 inline-block rounded-full bg-brand-cream px-2.5 py-0.5 text-xs font-medium text-brand-forest dark:bg-white/10 dark:text-emerald-100">{meta}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center border-2 transition ${type === 'radio' ? 'rounded-full' : 'rounded-lg'} ${
          checked ? 'border-brand-emerald bg-brand-emerald text-white' : 'border-brand-forest/20 dark:border-white/25'
        }`}
      >
        {checked && <Check className="h-4 w-4" />}
      </span>
    </label>
  );
}
