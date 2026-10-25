'use client';

import {
  InviteStatus,
  RsvpStatus,
  TEMPLATES,
  type AttendanceList,
  type CreateInviteRequest,
  type DietarySummary,
  type InviteDetails,
  type InviteSummary,
} from '@invite-app/contract';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiRequestError, ApiUnavailableError } from '../../controller/api-client';
import { browserApi } from '../../controller/browser-api';
import { toProjectDateTimeInput } from '../../controller/project-date-time';
import { GuestFormPreview } from '../../view/guest-rsvp-form';
import { InviteCard } from '../../view/invite-card';

type Tab = 'edit' | 'preview' | 'share' | 'attendance' | 'dietary';

function currentProjectDate() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.body.message;
  if (error instanceof ApiUnavailableError) return 'A API está indisponível. Tente novamente.';
  return 'Não foi possível concluir a operação.';
}

export default function DashboardPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<InviteSummary[]>([]);
  const [selected, setSelected] = useState<InviteDetails | null>(null);
  const [tab, setTab] = useState<Tab>('edit');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('18:00');
  const [newLocation, setNewLocation] = useState('');
  const [peopleLimit, setPeopleLimit] = useState('');
  const [companionLimit, setCompanionLimit] = useState('');
  const [draftEventDate, setDraftEventDate] = useState('');
  const [draftEventTime, setDraftEventTime] = useState('');
  const [draftPeopleLimit, setDraftPeopleLimit] = useState('');
  const [draftCompanionLimit, setDraftCompanionLimit] = useState('');
  const [templateCode, setTemplateCode] = useState('classic');
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [colors, setColors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceList | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [attendanceStale, setAttendanceStale] = useState(false);
  const [dietary, setDietary] = useState<DietarySummary | null>(null);

  const loadInvites = useCallback(async () => {
    const list = await browserApi.request<InviteSummary[]>('GET', '/invites');
    setInvites(list);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        await browserApi.request('GET', '/auth/session');
        await loadInvites();
      } catch (cause) {
        if (cause instanceof ApiRequestError && cause.code === 'UNAUTHENTICATED') {
          router.push('/');
          return;
        }
        if (active) setError(errorMessage(cause));
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, [loadInvites, router]);

  async function selectInvite(id: string) {
    setError('');
    setLoading(true);
    try {
      const invite = await browserApi.request<InviteDetails>('GET', `/invites/${id}`);
      const eventDateTime = toProjectDateTimeInput(invite.eventStartsAt);
      setSelected(invite);
      setDraftEventDate(eventDateTime.eventDate);
      setDraftEventTime(eventDateTime.eventTime);
      setDraftPeopleLimit(invite.peopleLimit === null ? '' : String(invite.peopleLimit));
      setDraftCompanionLimit(invite.companionLimit === null ? '' : String(invite.companionLimit));
      setEventName(invite.eventName);
      setLocation(invite.location);
      setTemplateCode(invite.customization.templateCode);
      setColors(invite.customization.colorOverrides);
      setAttendance(null);
      setDietary(null);
      setTab('edit');
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  async function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await browserApi.request<InviteDetails>('POST', '/invites', {
        body: {
          eventName: newName,
          eventDate: newDate,
          eventTime: newTime,
          location: newLocation,
          peopleLimit: peopleLimit ? Number(peopleLimit) : null,
          companionLimit: companionLimit ? Number(companionLimit) : null,
        },
      });
      await loadInvites();
      setNewName('');
      setNewDate('');
      setNewLocation('');
      await selectInvite(created.id);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function saveDraftDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || selected.status !== InviteStatus.Draft) return;
    setSaving(true);
    setError('');
    const request: CreateInviteRequest = {
      eventName: eventName,
      eventDate: draftEventDate,
      eventTime: draftEventTime,
      location,
      peopleLimit: draftPeopleLimit ? Number(draftPeopleLimit) : null,
      companionLimit: draftCompanionLimit ? Number(draftCompanionLimit) : null,
    };
    try {
      const updated = await browserApi.request<InviteDetails>('PUT', `/invites/${selected.id}`, {
        body: request,
      });
      const eventDateTime = toProjectDateTimeInput(updated.eventStartsAt);
      setSelected(updated);
      setEventName(updated.eventName);
      setLocation(updated.location);
      setDraftEventDate(eventDateTime.eventDate);
      setDraftEventTime(eventDateTime.eventTime);
      setDraftPeopleLimit(updated.peopleLimit === null ? '' : String(updated.peopleLimit));
      setDraftCompanionLimit(updated.companionLimit === null ? '' : String(updated.companionLimit));
      await loadInvites();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function saveCustomization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const updated = await browserApi.request<InviteDetails>(
        'PUT',
        `/invites/${selected.id}/customization`,
        { body: { templateCode, colorOverrides: colors, eventName, location } },
      );
      setSelected(updated);
      setEventName(updated.eventName);
      setLocation(updated.location);
      setColors(updated.customization.colorOverrides);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function changePublication() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      if (selected.status === InviteStatus.Published) {
        await browserApi.request('POST', `/invites/${selected.id}/unpublish`);
      } else {
        await browserApi.request('PUT', `/invites/${selected.id}/customization`, {
          body: { templateCode, colorOverrides: colors, eventName, location },
        });
        await browserApi.request('POST', `/invites/${selected.id}/publish`);
      }
      const refreshed = await browserApi.request<InviteDetails>('GET', `/invites/${selected.id}`);
      setSelected(refreshed);
      await loadInvites();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    try {
      await browserApi.request('POST', '/auth/sign-out');
      router.push('/');
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }

  async function copyPublicLink() {
    try {
      await navigator.clipboard.writeText(link);
      setError('');
    } catch {
      setError('Não foi possível copiar automaticamente. Selecione o link e copie manualmente.');
    }
  }

  useEffect(() => {
    const inviteId = selected?.id;
    if (!inviteId || tab !== 'attendance') return;
    let timer: number | undefined;
    let stopped = false;
    let delay = 15_000;
    let failures = 0;
    async function refresh() {
      try {
        const value = await browserApi.request<AttendanceList>(
          'GET',
          `/invites/${inviteId}/attendance`,
        );
        if (stopped) return;
        setAttendance(value);
        setLastUpdated(new Date());
        setAttendanceStale(false);
        setError('');
        delay = 15_000;
        failures = 0;
      } catch (cause) {
        if (stopped) return;
        setAttendanceStale(true);
        setError(errorMessage(cause));
        if (failures > 0) delay = Math.min(delay * 2, 120_000);
        failures += 1;
      }
      if (!stopped) timer = window.setTimeout(() => void refresh(), delay);
    }
    void refresh();
    return () => {
      stopped = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [selected?.id, tab]);

  useEffect(() => {
    const inviteId = selected?.id;
    if (!inviteId || tab !== 'dietary') return;
    let active = true;
    async function loadReport() {
      try {
        const [summary, entries] = await Promise.all([
          browserApi.request<DietarySummary>('GET', `/invites/${inviteId}/dietary-summary`),
          browserApi.request<AttendanceList>('GET', `/invites/${inviteId}/attendance`),
        ]);
        if (active) {
          setDietary(summary);
          setAttendance(entries);
          setError('');
        }
      } catch (cause) {
        if (active) setError(errorMessage(cause));
      }
    }
    void loadReport();
    return () => {
      active = false;
    };
  }, [selected?.id, tab]);

  const activeTemplate = useMemo(
    () => TEMPLATES.find((template) => template.code === templateCode) ?? TEMPLATES[0]!,
    [templateCode],
  );
  const previewColors = { ...activeTemplate.defaultColors, ...colors };
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const link = selected?.publicToken ? `${origin}/i/${selected.publicToken}` : '';
  const exportUrl = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001'}/invites/${selected?.id}/dietary-notes.csv`;
  const eligibleForExport =
    attendance?.guests.some(
      (guest) => guest.status === RsvpStatus.Accepted || guest.status === RsvpStatus.Maybe,
    ) ?? false;

  if (loading)
    return (
      <main className="page">
        <p>Carregando…</p>
      </main>
    );

  return (
    <main className="page stack">
      <header className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>Painel do anfitrião</h1>
          <p className="muted">Gerencie convites, presenças e restrições alimentares.</p>
        </div>
        <button onClick={() => void signOut()}>Sair</button>
      </header>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!selected ? (
        <section className="grid">
          <div className="panel stack">
            <h2>Seus convites</h2>
            {invites.length === 0 && <p className="muted">Você ainda não criou um convite.</p>}
            {invites.map((invite) => (
              <button key={invite.id} className="row" onClick={() => void selectInvite(invite.id)}>
                {invite.eventName} · {invite.status}
              </button>
            ))}
          </div>
          <form className="panel stack" onSubmit={createInvite}>
            <h2>Criar convite</h2>
            <label>
              Nome do evento
              <input
                required
                maxLength={60}
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
              />
            </label>
            <div className="grid">
              <label>
                Data
                <input
                  required
                  type="date"
                  min={currentProjectDate()}
                  value={newDate}
                  onChange={(event) => setNewDate(event.target.value)}
                />
              </label>
              <label>
                Hora
                <input
                  required
                  type="time"
                  value={newTime}
                  onChange={(event) => setNewTime(event.target.value)}
                />
              </label>
            </div>
            <label>
              Local
              <input
                required
                maxLength={120}
                value={newLocation}
                onChange={(event) => setNewLocation(event.target.value)}
              />
            </label>
            <div className="grid">
              <label>
                Limite de pessoas (opcional)
                <input
                  type="number"
                  min={1}
                  value={peopleLimit}
                  onChange={(event) => setPeopleLimit(event.target.value)}
                />
              </label>
              <label>
                Limite de acompanhantes (opcional)
                <input
                  type="number"
                  min={0}
                  value={companionLimit}
                  onChange={(event) => setCompanionLimit(event.target.value)}
                />
              </label>
            </div>
            <button disabled={saving}>{saving ? 'Criando…' : 'Criar rascunho'}</button>
          </form>
        </section>
      ) : (
        <section className="stack">
          <div className="row">
            <button onClick={() => setSelected(null)}>← Meus convites</button>
            <h2>{selected.eventName}</h2>
            <span className={`status-${selected.status}`}>{selected.status}</span>
          </div>
          <nav className="tabs" aria-label="Seções do convite">
            {(
              [
                ['edit', 'Personalizar'],
                ['preview', 'Prévia'],
                ['share', 'Publicação'],
                ['attendance', 'Presenças'],
                ['dietary', 'Restrições alimentares'],
              ] as const
            ).map(([value, label]) => (
              <button key={value} aria-selected={tab === value} onClick={() => setTab(value)}>
                {label}
              </button>
            ))}
          </nav>
          {tab === 'edit' && (
            <div className="stack">
              {selected.status === InviteStatus.Draft && (
                <form className="panel stack" onSubmit={saveDraftDetails}>
                  <h3>Dados do evento</h3>
                  <div className="grid">
                    <label>
                      Nome do evento
                      <input
                        required
                        maxLength={60}
                        value={eventName}
                        onChange={(event) => setEventName(event.target.value)}
                      />
                    </label>
                    <label>
                      Local
                      <input
                        required
                        maxLength={120}
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                      />
                    </label>
                    <label>
                      Data
                      <input
                        required
                        type="date"
                        min={currentProjectDate()}
                        value={draftEventDate}
                        onChange={(event) => setDraftEventDate(event.target.value)}
                      />
                    </label>
                    <label>
                      Hora
                      <input
                        required
                        type="time"
                        value={draftEventTime}
                        onChange={(event) => setDraftEventTime(event.target.value)}
                      />
                    </label>
                    <label>
                      Limite de pessoas (opcional)
                      <input
                        type="number"
                        min={1}
                        max={2_147_483_647}
                        step={1}
                        value={draftPeopleLimit}
                        onChange={(event) => setDraftPeopleLimit(event.target.value)}
                      />
                    </label>
                    <label>
                      Limite de acompanhantes (opcional)
                      <input
                        type="number"
                        min={0}
                        max={2_147_483_647}
                        step={1}
                        value={draftCompanionLimit}
                        onChange={(event) => setDraftCompanionLimit(event.target.value)}
                      />
                    </label>
                  </div>
                  <button disabled={saving}>
                    {saving ? 'Salvando…' : 'Salvar dados do evento'}
                  </button>
                </form>
              )}
              {selected.status !== InviteStatus.Draft && (
                <p className="muted">
                  Data, hora e limites ficam bloqueados depois da publicação. Nome e local podem ser
                  ajustados na personalização.
                </p>
              )}
              <div className="grid">
                <form className="panel stack" onSubmit={saveCustomization}>
                  <h3>Aparência do convite</h3>
                  <label>
                    Template
                    <select
                      value={templateCode}
                      onChange={(event) => {
                        setTemplateCode(event.target.value);
                        setColors({});
                      }}
                    >
                      {TEMPLATES.map((template) => (
                        <option key={template.code} value={template.code}>
                          {template.displayName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nome do evento
                    <input
                      required
                      maxLength={activeTemplate.textLimits.eventName}
                      value={eventName}
                      onChange={(event) => setEventName(event.target.value)}
                    />
                  </label>
                  <label>
                    Local
                    <input
                      required
                      maxLength={activeTemplate.textLimits.location}
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                    />
                  </label>
                  <div className="grid">
                    {Object.entries(activeTemplate.defaultColors).map(([role, defaultColor]) => (
                      <label key={role}>
                        {role}
                        <input
                          type="color"
                          value={colors[role] ?? defaultColor}
                          onChange={(event) =>
                            setColors((current) => ({ ...current, [role]: event.target.value }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <button disabled={saving}>
                    {saving ? 'Salvando…' : 'Salvar personalização'}
                  </button>
                </form>
                <div className="panel stack">
                  <h3>Prévia ao vivo</h3>
                  <InviteCard
                    eventName={eventName}
                    eventStartsAt={selected.eventStartsAt}
                    location={location}
                    customization={{ templateCode, colorOverrides: previewColors }}
                  />
                </div>
              </div>
            </div>
          )}
          {tab === 'preview' && (
            <section className="panel stack">
              <h3>Pré-visualização do convite</h3>
              <InviteCard
                eventName={eventName}
                eventStartsAt={selected.eventStartsAt}
                location={location}
                customization={{ templateCode, colorOverrides: previewColors }}
              />
              <GuestFormPreview
                invite={{
                  eventName,
                  eventStartsAt: selected.eventStartsAt,
                  location,
                  companionLimit: selected.companionLimit,
                  customization: { templateCode, colorOverrides: previewColors },
                  dietaryCategories: [
                    { code: 'VEGETARIAN', displayName: 'Vegetariano', requiresDescription: false },
                    { code: 'VEGAN', displayName: 'Vegano', requiresDescription: false },
                    { code: 'GLUTEN_FREE', displayName: 'Sem glúten', requiresDescription: false },
                    {
                      code: 'LACTOSE_FREE',
                      displayName: 'Sem lactose',
                      requiresDescription: false,
                    },
                    { code: 'ALLERGY', displayName: 'Alergia', requiresDescription: true },
                  ],
                }}
              />
              <button onClick={() => setTab('edit')}>Voltar à edição</button>
            </section>
          )}
          {tab === 'share' && (
            <section className="panel stack">
              <h3>Publicação</h3>
              <p>
                Status: <strong>{selected.status}</strong>
              </p>
              {selected.status === InviteStatus.Published && link && (
                <>
                  <label>
                    Link público
                    <input readOnly value={link} />
                  </label>
                  <button onClick={() => void copyPublicLink()}>Copiar link</button>
                </>
              )}
              <button disabled={saving} onClick={() => void changePublication()}>
                {selected.status === InviteStatus.Published
                  ? 'Despublicar convite'
                  : 'Publicar convite'}
              </button>
            </section>
          )}
          {tab === 'attendance' && (
            <section className="panel stack">
              <h3>Lista de presença</h3>
              <p>
                Total de pessoas confirmadas: <strong>{attendance?.totalPeople ?? 0}</strong>
              </p>
              <p className="muted">
                {attendanceStale
                  ? 'Dados desatualizados'
                  : 'Atualização automática a cada 15 segundos'}
                {lastUpdated
                  ? ` · Última atualização: ${lastUpdated.toLocaleTimeString('pt-BR')}`
                  : ''}
              </p>
              {!attendance && !attendanceStale && <p>Carregando respostas…</p>}
              {attendance?.guests.length === 0 && <p>Nenhum convidado respondeu até o momento.</p>}
              {attendance &&
                (
                  [
                    [RsvpStatus.Accepted, 'Confirmados'],
                    [RsvpStatus.Maybe, 'Talvez'],
                    [RsvpStatus.Declined, 'Recusados'],
                  ] as const
                ).map(([status, title]) => (
                  <section key={status} className="stack">
                    <h4>{title}</h4>
                    {attendance.guests.filter((guest) => guest.status === status).length === 0 && (
                      <p className="muted">Nenhuma resposta.</p>
                    )}
                    {attendance.guests
                      .filter((guest) => guest.status === status)
                      .map((guest, index) => (
                        <p key={`${guest.name}-${guest.respondedAt}-${index}`}>
                          {guest.name}
                          {status !== RsvpStatus.Declined
                            ? ` · acompanhantes: ${guest.companionCount}`
                            : ''}
                        </p>
                      ))}
                  </section>
                ))}
            </section>
          )}
          {tab === 'dietary' && (
            <section className="panel stack">
              <h3>Restrições alimentares</h3>
              {!dietary && <p>Carregando consolidação…</p>}
              {dietary?.counts.length === 0 && <p>Nenhuma restrição alimentar registrada.</p>}
              {dietary?.counts.map((count) => (
                <p key={count.code}>
                  {count.displayName}: <strong>{count.count}</strong>
                </p>
              ))}
              {dietary?.descriptions.map((description, index) => (
                <p key={`${description.guestName}-${index}`}>
                  Alergia — {description.guestName}: {description.description}
                </p>
              ))}
              {eligibleForExport && (
                <a className="button" href={exportUrl}>
                  Baixar CSV para o buffet
                </a>
              )}
              {!eligibleForExport && attendance && (
                <p className="muted">
                  A exportação fica disponível quando houver respostas sim ou talvez.
                </p>
              )}
            </section>
          )}
        </section>
      )}
    </main>
  );
}
