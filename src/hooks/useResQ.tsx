import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CONTACTS as SEED_CONTACTS } from "@/lib/mock";
import { runInference, syntheticImpactWindow, type InferenceResult } from "@/lib/resq/ml";

type Tables = Database["public"]["Tables"];
export type Profile = Tables["profiles"]["Row"];
export type Contact = Tables["emergency_contacts"]["Row"];
export type Medical = Tables["medical_profiles"]["Row"];
export type Settings = Tables["user_settings"]["Row"];
export type HelperRow = Tables["helpers"]["Row"];
export type Incident = Tables["incidents"]["Row"];
export type IncidentEvent = Tables["incident_events"]["Row"];
export type EmergencyRequest = Tables["emergency_requests"]["Row"];
export type Notification = Tables["notifications"]["Row"];
export type Hospital = Tables["hospitals"]["Row"];
export type IncidentStage = Database["public"]["Enums"]["incident_stage"];

export type AuthStatus = "loading" | "signed-out" | "signed-in";

const ACTIVE_STAGES: IncidentStage[] = [
  "normal",
  "possible_accident",
  "alarm_1",
  "alarm_2",
  "alarm_3",
  "escalated",
  "helper_search",
  "helper_assigned",
  "helper_navigating",
  "victim_reached",
  "hospital_navigation",
];

function message(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const m = String((error as { message: unknown }).message);
    return m || fallback;
  }
  return fallback;
}

export type ResQState = {
  authStatus: AuthStatus;
  user: User | null;
  session: Session | null;

  loadingData: boolean;
  dataError: string | null;
  reload: () => Promise<void>;

  profile: Profile | null;
  contacts: Contact[];
  medical: Medical | null;
  settings: Settings | null;
  helper: HelperRow | null;
  hospitals: Hospital[];
  incident: Incident | null;
  incidentEvents: IncidentEvent[];
  incidents: Incident[];
  helperRequests: (EmergencyRequest & { incident: Incident | null })[];
  helperIncident: Incident | null;
  notifications: Notification[];
  unreadCount: number;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  saveProfile: (patch: Partial<Profile>) => Promise<void>;
  saveMedical: (patch: Partial<Medical>) => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;

  addContact: (input: { name: string; phone: string; relation: string; color?: string }) => Promise<void>;
  updateContact: (id: string, patch: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleContact: (id: string, selected: boolean) => Promise<void>;

  startIncident: (source: "manual_sos" | "sensor_simulation") => Promise<Incident>;
  advance: (stage: IncidentStage, note?: string) => Promise<Incident | null>;
  markSafe: () => Promise<void>;
  analyzeIncident: () => Promise<InferenceResult>;
  dispatchHelpers: () => Promise<number>;
  setHospital: (hospitalId: string) => Promise<void>;

  setHelperAvailability: (available: boolean) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  advanceHelperIncident: (stage: IncidentStage, note?: string) => Promise<void>;
  pushHelperLocation: (lat: number, lng: number, accuracy?: number) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
};

const ResQContext = createContext<ResQState | null>(null);

export function useResQ(): ResQState {
  const ctx = useContext(ResQContext);
  if (!ctx) throw new Error("useResQ must be used inside <ResQProvider>");
  return ctx;
}

export function ResQProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [medical, setMedical] = useState<Medical | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [helper, setHelper] = useState<HelperRow | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [incidentEvents, setIncidentEvents] = useState<IncidentEvent[]>([]);
  const [helperRequests, setHelperRequests] = useState<(EmergencyRequest & { incident: Incident | null })[]>([]);
  const [helperIncident, setHelperIncident] = useState<Incident | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  /* ---------------- session ---------------- */
  useEffect(() => {
    // Listener registered before the initial read so no event is missed.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted.current) return;
      setSession(next);
      setAuthStatus(next ? "signed-in" : "signed-out");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted.current) return;
      setSession(data.session);
      setAuthStatus(data.session ? "signed-in" : "signed-out");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  /* ---------------- data loading ---------------- */
  const seedContactBook = useCallback(async (uid: string) => {
    const rows = SEED_CONTACTS.map((c) => ({
      user_id: uid,
      name: c.name,
      phone: c.phone,
      relation: c.relation,
      color: c.color,
      is_selected: false,
    }));
    const { error } = await supabase.from("emergency_contacts").upsert(rows, { onConflict: "user_id,phone" });
    if (error) throw error;
  }, []);

  const loadAll = useCallback(
    async (uid: string) => {
      setLoadingData(true);
      setDataError(null);
      try {
        const [p, c, m, s, h, hosp, inc, reqs, notes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase.from("emergency_contacts").select("*").eq("user_id", uid).order("created_at"),
          supabase.from("medical_profiles").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("user_settings").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("helpers").select("*").eq("user_id", uid).maybeSingle(),
          supabase.from("hospitals").select("*").order("name"),
          supabase.from("incidents").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
          supabase
            .from("emergency_requests")
            .select("*, incident:incidents(*)")
            .eq("helper_id", uid)
            .eq("status", "pending")
            .order("created_at", { ascending: false }),
          supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50),
        ]);

        const firstError = [p, c, m, s, h, hosp, inc, reqs, notes].find((r) => r.error)?.error;
        if (firstError) throw firstError;
        if (!mounted.current) return;

        let contactRows = c.data ?? [];
        if (contactRows.length === 0) {
          await seedContactBook(uid);
          const reread = await supabase.from("emergency_contacts").select("*").eq("user_id", uid).order("created_at");
          if (reread.error) throw reread.error;
          contactRows = reread.data ?? [];
        }

        const allIncidents = inc.data ?? [];
        const active = allIncidents.find((i) => ACTIVE_STAGES.includes(i.stage)) ?? null;

        // The incident this user is assigned to as a helper.
        const assigned = await supabase
          .from("incidents")
          .select("*")
          .eq("assigned_helper_id", uid)
          .in("stage", ACTIVE_STAGES)
          .order("created_at", { ascending: false })
          .maybeSingle();
        if (assigned.error) throw assigned.error;

        setProfile(p.data ?? null);
        setContacts(contactRows);
        setMedical(m.data ?? null);
        setSettings(s.data ?? null);
        setHelper(h.data ?? null);
        setHospitals(hosp.data ?? []);
        setIncidents(allIncidents);
        setIncident(active);
        setHelperRequests((reqs.data ?? []) as (EmergencyRequest & { incident: Incident | null })[]);
        setHelperIncident(assigned.data ?? null);
        setNotifications(notes.data ?? []);

        if (active) {
          const ev = await supabase
            .from("incident_events")
            .select("*")
            .eq("incident_id", active.id)
            .order("created_at");
          if (!ev.error && mounted.current) setIncidentEvents(ev.data ?? []);
        } else {
          setIncidentEvents([]);
        }
      } catch (error) {
        if (mounted.current) setDataError(message(error, "Could not load your ResQNow data."));
      } finally {
        if (mounted.current) setLoadingData(false);
      }
    },
    [seedContactBook],
  );

  const reload = useCallback(async () => {
    if (userId) await loadAll(userId);
  }, [userId, loadAll]);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setContacts([]);
      setMedical(null);
      setSettings(null);
      setHelper(null);
      setIncidents([]);
      setIncident(null);
      setIncidentEvents([]);
      setHelperRequests([]);
      setHelperIncident(null);
      setNotifications([]);
      setDataError(null);
      return;
    }
    void loadAll(userId);
  }, [userId, loadAll]);

  /* ---------------- realtime ----------------
   * One channel per signed-in user. EVERY postgres_changes listener is
   * registered BEFORE subscribe(), the channel reference is stored, and it is
   * removed on unmount / user change. Never subscribe-then-listen.
   */
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  useEffect(() => {
    if (!userId) return;

    const refresh = () => {
      void reloadRef.current();
    };

    const channel = supabase
      .channel(`resqnow:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents", filter: `user_id=eq.${userId}` }, refresh)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents", filter: `assigned_helper_id=eq.${userId}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "emergency_requests", filter: `helper_id=eq.${userId}` },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (!mounted.current) return;
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 50));
          } else {
            refresh();
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  /* ---------------- auth actions ---------------- */
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(message(error, "Could not sign you in."));
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName.trim() },
      },
    });
    if (error) throw new Error(message(error, "Could not create your account."));
    if (!data.session) {
      const retry = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (retry.error) throw new Error("Account created. Please confirm your email, then log in.");
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) throw new Error(message(result.error, "Google sign-in failed."));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  /* ---------------- profile / medical / settings ---------------- */
  const saveProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!userId) throw new Error("You must be signed in.");
      const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select().single();
      if (error) throw new Error(message(error, "Could not save your profile."));
      setProfile(data);
    },
    [userId],
  );

  const saveMedical = useCallback(
    async (patch: Partial<Medical>) => {
      if (!userId) throw new Error("You must be signed in.");
      const { data, error } = await supabase
        .from("medical_profiles")
        .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw new Error(message(error, "Could not save your medical details."));
      setMedical(data);
    },
    [userId],
  );

  const saveSettings = useCallback(
    async (patch: Partial<Settings>) => {
      if (!userId) throw new Error("You must be signed in.");
      const { data, error } = await supabase
        .from("user_settings")
        .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw new Error(message(error, "Could not save your settings."));
      setSettings(data);
    },
    [userId],
  );

  /* ---------------- contacts ---------------- */
  const addContact = useCallback(
    async (input: { name: string; phone: string; relation: string; color?: string }) => {
      if (!userId) throw new Error("You must be signed in.");
      const { data, error } = await supabase
        .from("emergency_contacts")
        .insert({ user_id: userId, ...input, color: input.color ?? "#1677FF" })
        .select()
        .single();
      if (error) {
        throw new Error(
          error.code === "23505" ? "That phone number is already in your contacts." : message(error, "Could not add contact."),
        );
      }
      setContacts((prev) => [...prev, data]);
    },
    [userId],
  );

  const updateContact = useCallback(async (id: string, patch: Partial<Contact>) => {
    const { data, error } = await supabase.from("emergency_contacts").update(patch).eq("id", id).select().single();
    if (error) throw new Error(message(error, "Could not update contact."));
    setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (error) throw new Error(message(error, "Could not delete contact."));
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleContact = useCallback(async (id: string, selected: boolean) => {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .update({ is_selected: selected })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw new Error(
        message(error, "Could not update contact.").includes("at most 5")
          ? "You can select at most 5 emergency contacts."
          : message(error, "Could not update contact."),
      );
    }
    setContacts((prev) => prev.map((c) => (c.id === id ? data : c)));
  }, []);

  /* ---------------- incidents ---------------- */
  const currentPosition = useCallback(async (): Promise<{ lat: number | null; lng: number | null }> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return { lat: null, lng: null };
    return new Promise((resolve) => {
      const done = (v: { lat: number | null; lng: number | null }) => resolve(v);
      const timer = setTimeout(() => done({ lat: null, lng: null }), 4000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          done({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          clearTimeout(timer);
          done({ lat: null, lng: null });
        },
        { enableHighAccuracy: true, timeout: 4000 },
      );
    });
  }, []);

  const startIncident = useCallback(
    async (source: "manual_sos" | "sensor_simulation") => {
      if (!userId) throw new Error("You must be signed in.");
      const { lat, lng } = await currentPosition();
      const samples = syntheticImpactWindow();
      const result = await runInference(samples);

      const { data, error } = await supabase.rpc("start_incident", {
        ...(lat !== null ? { _latitude: lat } : {}),
        ...(lng !== null ? { _longitude: lng } : {}),
        ...(profile?.location ? { _address: profile.location } : {}),
        ...(samples[0] ? { _speed: samples[0].speedKmh } : {}),
        _severity: result.severity,
        _probability: result.accidentProbability,
        _source: source,
        _sensor: { samples: samples.slice(0, 12) },
        _features: { ...result.features, engine: result.engine },
        _initial_stage: source === "manual_sos" ? "alarm_3" : "alarm_1",
      });
      if (error) throw new Error(message(error, "Could not start the emergency."));
      const created = data as unknown as Incident;
      setIncident(created);
      return created;
    },
    [userId, profile?.location, currentPosition],
  );

  const advance = useCallback(
    async (stage: IncidentStage, note?: string) => {
      if (!incident) return null;
      const { data, error } = await supabase.rpc("advance_incident", {
        _incident_id: incident.id,
        _next_stage: stage,
        ...(note ? { _note: note } : {}),
        _metadata: {},
      });
      if (error) throw new Error(message(error, "Could not update the emergency."));
      const next = data as unknown as Incident;
      setIncident(ACTIVE_STAGES.includes(next.stage) ? next : null);
      setIncidents((prev) => prev.map((i) => (i.id === next.id ? next : i)));
      return next;
    },
    [incident],
  );

  const markSafe = useCallback(async () => {
    if (!incident) return;
    await advance("cancelled", "Victim confirmed they are safe");
    setIncident(null);
    void reloadRef.current();
  }, [incident, advance]);

  const analyzeIncident = useCallback(async () => {
    const result = await runInference(syntheticImpactWindow());
    if (incident) {
      const { data, error } = await supabase
        .from("incidents")
        .update({
          severity: result.severity,
          accident_probability: result.accidentProbability,
          ml_features: { ...result.features, engine: result.engine },
        })
        .eq("id", incident.id)
        .select()
        .single();
      if (!error && data) setIncident(data);
    }
    return result;
  }, [incident]);

  const dispatchHelpers = useCallback(async () => {
    if (!incident) return 0;
    const { data, error } = await supabase.rpc("dispatch_helpers", { _incident_id: incident.id, _radius_km: 15 });
    if (error) throw new Error(message(error, "Could not reach nearby helpers."));
    return (data as number) ?? 0;
  }, [incident]);

  const setHospital = useCallback(
    async (hospitalId: string) => {
      if (!incident) return;
      const { data, error } = await supabase
        .from("incidents")
        .update({ hospital_id: hospitalId })
        .eq("id", incident.id)
        .select()
        .single();
      if (error) throw new Error(message(error, "Could not set the hospital."));
      setIncident(data);
    },
    [incident],
  );

  /* ---------------- helper side ---------------- */
  const setHelperAvailability = useCallback(
    async (available: boolean) => {
      if (!userId) throw new Error("You must be signed in.");
      const { lat, lng } = available ? await currentPosition() : { lat: null, lng: null };
      const patch: Partial<HelperRow> & { user_id: string } = {
        user_id: userId,
        is_available: available,
        last_seen_at: new Date().toISOString(),
      };
      if (lat !== null && lng !== null) {
        patch.last_latitude = lat;
        patch.last_longitude = lng;
      }
      const { data, error } = await supabase.from("helpers").upsert(patch, { onConflict: "user_id" }).select().single();
      if (error) throw new Error(message(error, "Could not update your helper status."));
      setHelper(data);
    },
    [userId, currentPosition],
  );

  const acceptRequest = useCallback(async (requestId: string) => {
    const { data, error } = await supabase.rpc("accept_emergency_request", { _request_id: requestId });
    if (error) throw new Error(message(error, "Could not accept this request."));
    setHelperIncident(data as unknown as Incident);
    void reloadRef.current();
  }, []);

  const declineRequest = useCallback(async (requestId: string) => {
    const { error } = await supabase.rpc("decline_emergency_request", { _request_id: requestId });
    if (error) throw new Error(message(error, "Could not decline this request."));
    setHelperRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  const advanceHelperIncident = useCallback(
    async (stage: IncidentStage, note?: string) => {
      if (!helperIncident) return;
      const { data, error } = await supabase.rpc("advance_incident", {
        _incident_id: helperIncident.id,
        _next_stage: stage,
        ...(note ? { _note: note } : {}),
        _metadata: {},
      });
      if (error) throw new Error(message(error, "Could not update the rescue."));
      const next = data as unknown as Incident;
      setHelperIncident(ACTIVE_STAGES.includes(next.stage) ? next : null);
    },
    [helperIncident],
  );

  const pushHelperLocation = useCallback(
    async (lat: number, lng: number, accuracy?: number) => {
      if (!userId) return;
      await supabase.from("helper_locations").insert({
        helper_id: userId,
        incident_id: helperIncident?.id ?? null,
        latitude: lat,
        longitude: lng,
        accuracy_m: accuracy ?? null,
      });
    },
    [userId, helperIncident?.id],
  );

  /* ---------------- notifications ---------------- */
  const markNotificationRead = useCallback(async (id: string) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    if (error) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [userId]);

  const value = useMemo<ResQState>(
    () => ({
      authStatus,
      user,
      session,
      loadingData,
      dataError,
      reload,
      profile,
      contacts,
      medical,
      settings,
      helper,
      hospitals,
      incident,
      incidentEvents,
      incidents,
      helperRequests,
      helperIncident,
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      saveProfile,
      saveMedical,
      saveSettings,
      addContact,
      updateContact,
      deleteContact,
      toggleContact,
      startIncident,
      advance,
      markSafe,
      analyzeIncident,
      dispatchHelpers,
      setHospital,
      setHelperAvailability,
      acceptRequest,
      declineRequest,
      advanceHelperIncident,
      pushHelperLocation,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      authStatus,
      user,
      session,
      loadingData,
      dataError,
      reload,
      profile,
      contacts,
      medical,
      settings,
      helper,
      hospitals,
      incident,
      incidentEvents,
      incidents,
      helperRequests,
      helperIncident,
      notifications,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      saveProfile,
      saveMedical,
      saveSettings,
      addContact,
      updateContact,
      deleteContact,
      toggleContact,
      startIncident,
      advance,
      markSafe,
      analyzeIncident,
      dispatchHelpers,
      setHospital,
      setHelperAvailability,
      acceptRequest,
      declineRequest,
      advanceHelperIncident,
      pushHelperLocation,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );

  return <ResQContext.Provider value={value}>{children}</ResQContext.Provider>;
}
