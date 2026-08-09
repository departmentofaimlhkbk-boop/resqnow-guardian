
-- ============ enums ============
CREATE TYPE public.incident_stage AS ENUM (
  'normal','possible_accident','alarm_1','alarm_2','alarm_3','escalated',
  'helper_search','helper_assigned','helper_navigating','victim_reached',
  'hospital_navigation','incident_completed','cancelled'
);
CREATE TYPE public.incident_severity AS ENUM ('low','medium','high','critical');
CREATE TYPE public.request_status AS ENUM ('pending','accepted','declined','expired','cancelled');

-- ============ shared trigger ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ hospitals ============
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  beds_available INTEGER NOT NULL DEFAULT 0,
  trauma_center BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hospitals TO authenticated;
GRANT SELECT ON public.hospitals TO anon;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hospitals readable" ON public.hospitals FOR SELECT TO authenticated, anon USING (true);

INSERT INTO public.hospitals (name, address, phone, latitude, longitude, beds_available, trauma_center) VALUES
  ('City Care Hospital','MG Road, Bangalore','+91 80 4000 1100',12.9752,77.6069,6,true),
  ('Manipal Multispeciality','Old Airport Road, Bangalore','+91 80 4000 2200',12.9591,77.6494,12,true),
  ('St. Martha''s Hospital','Nrupathunga Road, Bangalore','+91 80 4000 3300',12.9698,77.5860,3,false);

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  location TEXT,
  avatar_color TEXT NOT NULL DEFAULT '#FF3B30',
  onboarding_step TEXT NOT NULL DEFAULT 'contacts',
  permissions_granted TEXT[] NOT NULL DEFAULT '{}',
  preferred_hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ medical_profiles ============
CREATE TABLE public.medical_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_group TEXT,
  allergies TEXT,
  conditions TEXT,
  medications TEXT,
  emergency_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.medical_profiles TO authenticated;
GRANT ALL ON public.medical_profiles TO service_role;
ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own medical" ON public.medical_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER medical_touch BEFORE UPDATE ON public.medical_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ user_settings ============
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  location_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_sos_enabled BOOLEAN NOT NULL DEFAULT true,
  share_medical BOOLEAN NOT NULL DEFAULT true,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  language TEXT NOT NULL DEFAULT 'en-IN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ emergency_contacts ============
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relation TEXT NOT NULL DEFAULT 'Family',
  color TEXT NOT NULL DEFAULT '#1677FF',
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phone)
);
CREATE INDEX emergency_contacts_user_idx ON public.emergency_contacts(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own contacts" ON public.emergency_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER contacts_touch BEFORE UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_selected_contact_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INTEGER;
BEGIN
  IF NEW.is_selected THEN
    SELECT count(*) INTO n FROM public.emergency_contacts
      WHERE user_id = NEW.user_id AND is_selected AND id <> NEW.id;
    IF n >= 5 THEN
      RAISE EXCEPTION 'You can select at most 5 emergency contacts';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER contacts_limit BEFORE INSERT OR UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_selected_contact_limit();

-- ============ helpers ============
CREATE TABLE public.helpers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  helps_count INTEGER NOT NULL DEFAULT 0,
  current_incident_id UUID,
  last_latitude DOUBLE PRECISION,
  last_longitude DOUBLE PRECISION,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.helpers TO authenticated;
GRANT ALL ON public.helpers TO service_role;
ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "helpers readable" ON public.helpers FOR SELECT TO authenticated USING (true);
CREATE POLICY "own helper insert" ON public.helpers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own helper update" ON public.helpers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER helpers_touch BEFORE UPDATE ON public.helpers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ incidents ============
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage public.incident_stage NOT NULL DEFAULT 'possible_accident',
  severity public.incident_severity NOT NULL DEFAULT 'high',
  accident_probability NUMERIC(4,3) NOT NULL DEFAULT 0.900,
  detection_source TEXT NOT NULL DEFAULT 'manual',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  speed_kmh NUMERIC(6,2),
  sensor_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ml_features JSONB NOT NULL DEFAULT '{}'::jsonb,
  alarm_stage SMALLINT NOT NULL DEFAULT 0,
  victim_response TEXT,
  escalated_at TIMESTAMPTZ,
  assigned_helper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX incidents_user_idx ON public.incidents(user_id, created_at DESC);
CREATE INDEX incidents_helper_idx ON public.incidents(assigned_helper_id);
CREATE UNIQUE INDEX incidents_one_active_per_user ON public.incidents(user_id)
  WHERE stage NOT IN ('incident_completed','cancelled');
GRANT SELECT, INSERT, UPDATE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER incidents_touch BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ emergency_requests ============
CREATE TABLE public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.request_status NOT NULL DEFAULT 'pending',
  distance_km NUMERIC(6,2),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '90 seconds',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (incident_id, helper_id)
);
CREATE INDEX emergency_requests_helper_idx ON public.emergency_requests(helper_id, status);
GRANT SELECT, INSERT, UPDATE ON public.emergency_requests TO authenticated;
GRANT ALL ON public.emergency_requests TO service_role;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

-- incident visibility helper (avoids recursive policy evaluation)
CREATE OR REPLACE FUNCTION public.can_view_incident(_incident_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.incidents i
    WHERE i.id = _incident_id
      AND (i.user_id = _user_id OR i.assigned_helper_id = _user_id)
  ) OR EXISTS (
    SELECT 1 FROM public.emergency_requests r
    WHERE r.incident_id = _incident_id AND r.helper_id = _user_id
  );
$$;

CREATE POLICY "incident read" ON public.incidents FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR assigned_helper_id = auth.uid() OR public.can_view_incident(id, auth.uid()));
CREATE POLICY "incident insert own" ON public.incidents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "incident update own or assigned" ON public.incidents FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR assigned_helper_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR assigned_helper_id = auth.uid());

CREATE POLICY "requests visible to helper or victim" ON public.emergency_requests FOR SELECT TO authenticated
  USING (helper_id = auth.uid() OR EXISTS (SELECT 1 FROM public.incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()));
CREATE POLICY "victim creates requests" ON public.emergency_requests FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.incidents i WHERE i.id = incident_id AND i.user_id = auth.uid()));
CREATE POLICY "helper responds" ON public.emergency_requests FOR UPDATE TO authenticated
  USING (helper_id = auth.uid()) WITH CHECK (helper_id = auth.uid());

-- ============ incident_events ============
CREATE TABLE public.incident_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stage public.incident_stage NOT NULL,
  note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX incident_events_incident_idx ON public.incident_events(incident_id, created_at);
GRANT SELECT, INSERT ON public.incident_events TO authenticated;
GRANT ALL ON public.incident_events TO service_role;
ALTER TABLE public.incident_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events readable by participants" ON public.incident_events FOR SELECT TO authenticated
  USING (public.can_view_incident(incident_id, auth.uid()));
CREATE POLICY "events insert by participants" ON public.incident_events FOR INSERT TO authenticated
  WITH CHECK (public.can_view_incident(incident_id, auth.uid()));

-- ============ helper_locations ============
CREATE TABLE public.helper_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_m NUMERIC(6,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX helper_locations_incident_idx ON public.helper_locations(incident_id, created_at DESC);
GRANT SELECT, INSERT ON public.helper_locations TO authenticated;
GRANT ALL ON public.helper_locations TO service_role;
ALTER TABLE public.helper_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "helper writes own location" ON public.helper_locations FOR INSERT TO authenticated WITH CHECK (helper_id = auth.uid());
CREATE POLICY "location readable by participants" ON public.helper_locations FOR SELECT TO authenticated
  USING (helper_id = auth.uid() OR (incident_id IS NOT NULL AND public.can_view_incident(incident_id, auth.uid())));

-- ============ notifications ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own notifications delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "participants notify" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR (incident_id IS NOT NULL AND public.can_view_incident(incident_id, auth.uid())));

-- ============ signup bootstrap ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.medical_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.helpers (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ state machine ============
CREATE OR REPLACE FUNCTION public.allowed_next_stages(_stage public.incident_stage)
RETURNS public.incident_stage[] LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE _stage
    WHEN 'normal' THEN ARRAY['possible_accident','cancelled']::public.incident_stage[]
    WHEN 'possible_accident' THEN ARRAY['alarm_1','escalated','cancelled']::public.incident_stage[]
    WHEN 'alarm_1' THEN ARRAY['alarm_2','escalated','cancelled']::public.incident_stage[]
    WHEN 'alarm_2' THEN ARRAY['alarm_3','escalated','cancelled']::public.incident_stage[]
    WHEN 'alarm_3' THEN ARRAY['escalated','cancelled']::public.incident_stage[]
    WHEN 'escalated' THEN ARRAY['helper_search','cancelled']::public.incident_stage[]
    WHEN 'helper_search' THEN ARRAY['helper_assigned','cancelled']::public.incident_stage[]
    WHEN 'helper_assigned' THEN ARRAY['helper_navigating','cancelled']::public.incident_stage[]
    WHEN 'helper_navigating' THEN ARRAY['victim_reached','cancelled']::public.incident_stage[]
    WHEN 'victim_reached' THEN ARRAY['hospital_navigation','incident_completed','cancelled']::public.incident_stage[]
    WHEN 'hospital_navigation' THEN ARRAY['incident_completed','cancelled']::public.incident_stage[]
    ELSE ARRAY[]::public.incident_stage[]
  END;
$$;

CREATE OR REPLACE FUNCTION public.advance_incident(
  _incident_id UUID,
  _next_stage public.incident_stage,
  _note TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS public.incidents LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inc public.incidents; uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO inc FROM public.incidents WHERE id = _incident_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Incident not found'; END IF;
  IF inc.user_id <> uid AND COALESCE(inc.assigned_helper_id, '00000000-0000-0000-0000-000000000000'::uuid) <> uid THEN
    RAISE EXCEPTION 'Not allowed to update this incident';
  END IF;
  IF inc.stage = _next_stage THEN RETURN inc; END IF;
  IF NOT (_next_stage = ANY (public.allowed_next_stages(inc.stage))) THEN
    RAISE EXCEPTION 'Invalid transition % -> %', inc.stage, _next_stage;
  END IF;

  UPDATE public.incidents SET
    stage = _next_stage,
    alarm_stage = CASE
      WHEN _next_stage = 'alarm_1' THEN 1
      WHEN _next_stage = 'alarm_2' THEN 2
      WHEN _next_stage = 'alarm_3' THEN 3
      ELSE alarm_stage END,
    escalated_at = CASE WHEN _next_stage = 'escalated' THEN now() ELSE escalated_at END,
    victim_response = CASE WHEN _next_stage = 'cancelled' THEN 'safe' ELSE victim_response END,
    completed_at = CASE WHEN _next_stage IN ('incident_completed','cancelled') THEN now() ELSE completed_at END
  WHERE id = _incident_id RETURNING * INTO inc;

  INSERT INTO public.incident_events (incident_id, actor_id, stage, note, metadata)
  VALUES (_incident_id, uid, _next_stage, _note, _metadata);

  IF _next_stage IN ('incident_completed','cancelled') THEN
    UPDATE public.helpers SET current_incident_id = NULL, is_available = true
      WHERE current_incident_id = _incident_id;
    UPDATE public.emergency_requests SET status = 'cancelled'
      WHERE incident_id = _incident_id AND status = 'pending';
  END IF;

  IF inc.assigned_helper_id IS NOT NULL AND uid = inc.assigned_helper_id THEN
    INSERT INTO public.notifications (user_id, incident_id, kind, title, body)
    VALUES (inc.user_id, _incident_id, 'incident', 'Rescue update', 'Status: ' || _next_stage::text);
  ELSIF inc.assigned_helper_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, incident_id, kind, title, body)
    VALUES (inc.assigned_helper_id, _incident_id, 'incident', 'Incident update', 'Status: ' || _next_stage::text);
  END IF;

  RETURN inc;
END; $$;
GRANT EXECUTE ON FUNCTION public.advance_incident(UUID, public.incident_stage, TEXT, JSONB) TO authenticated;

-- start (or reuse) an incident
CREATE OR REPLACE FUNCTION public.start_incident(
  _latitude DOUBLE PRECISION DEFAULT NULL,
  _longitude DOUBLE PRECISION DEFAULT NULL,
  _address TEXT DEFAULT NULL,
  _speed NUMERIC DEFAULT NULL,
  _severity public.incident_severity DEFAULT 'high',
  _probability NUMERIC DEFAULT 0.9,
  _source TEXT DEFAULT 'manual',
  _sensor JSONB DEFAULT '{}'::jsonb,
  _features JSONB DEFAULT '{}'::jsonb,
  _initial_stage public.incident_stage DEFAULT 'possible_accident'
) RETURNS public.incidents LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inc public.incidents; uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO inc FROM public.incidents
    WHERE user_id = uid AND stage NOT IN ('incident_completed','cancelled')
    ORDER BY created_at DESC LIMIT 1;
  IF FOUND THEN RETURN inc; END IF;

  INSERT INTO public.incidents (user_id, stage, severity, accident_probability, detection_source,
                                latitude, longitude, address, speed_kmh, sensor_data, ml_features,
                                alarm_stage)
  VALUES (uid, _initial_stage, _severity, _probability, _source,
          _latitude, _longitude, _address, _speed, _sensor, _features,
          CASE _initial_stage WHEN 'alarm_1' THEN 1 WHEN 'alarm_2' THEN 2 WHEN 'alarm_3' THEN 3 ELSE 0 END)
  RETURNING * INTO inc;

  INSERT INTO public.incident_events (incident_id, actor_id, stage, note)
  VALUES (inc.id, uid, inc.stage, 'Incident created (' || _source || ')');

  INSERT INTO public.notifications (user_id, incident_id, kind, title, body)
  VALUES (uid, inc.id, 'incident', 'Emergency detected', 'ResQNow started an emergency countdown.');

  RETURN inc;
END; $$;
GRANT EXECUTE ON FUNCTION public.start_incident(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, NUMERIC, public.incident_severity, NUMERIC, TEXT, JSONB, JSONB, public.incident_stage) TO authenticated;

-- dispatch: create requests for eligible helpers
CREATE OR REPLACE FUNCTION public.dispatch_helpers(_incident_id UUID, _radius_km NUMERIC DEFAULT 10)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inc public.incidents; n INTEGER := 0; h RECORD; d NUMERIC;
BEGIN
  SELECT * INTO inc FROM public.incidents WHERE id = _incident_id;
  IF NOT FOUND OR inc.user_id <> auth.uid() THEN RAISE EXCEPTION 'Not allowed'; END IF;

  FOR h IN
    SELECT * FROM public.helpers
    WHERE user_id <> inc.user_id AND is_available AND current_incident_id IS NULL
  LOOP
    d := CASE
      WHEN inc.latitude IS NULL OR h.last_latitude IS NULL THEN NULL
      ELSE round((111.045 * sqrt(power(h.last_latitude - inc.latitude, 2)
             + power((h.last_longitude - inc.longitude) * cos(radians(inc.latitude)), 2)))::numeric, 2)
    END;
    IF d IS NULL OR d <= _radius_km THEN
      INSERT INTO public.emergency_requests (incident_id, helper_id, distance_km)
      VALUES (_incident_id, h.user_id, d)
      ON CONFLICT (incident_id, helper_id) DO NOTHING;
      INSERT INTO public.notifications (user_id, incident_id, kind, title, body)
      VALUES (h.user_id, _incident_id, 'request', 'New emergency nearby',
              'Someone near you needs immediate help.');
      n := n + 1;
    END IF;
  END LOOP;
  RETURN n;
END; $$;
GRANT EXECUTE ON FUNCTION public.dispatch_helpers(UUID, NUMERIC) TO authenticated;

-- atomic accept
CREATE OR REPLACE FUNCTION public.accept_emergency_request(_request_id UUID)
RETURNS public.incidents LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE req public.emergency_requests; inc public.incidents; uid UUID := auth.uid(); updated INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO req FROM public.emergency_requests WHERE id = _request_id AND helper_id = uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found'; END IF;
  IF req.status <> 'pending' THEN RAISE EXCEPTION 'This request is no longer available'; END IF;

  -- atomic claim: only succeeds while no helper is assigned
  UPDATE public.incidents
     SET assigned_helper_id = uid, stage = 'helper_assigned'
   WHERE id = req.incident_id
     AND assigned_helper_id IS NULL
     AND stage NOT IN ('incident_completed','cancelled')
  RETURNING * INTO inc;
  GET DIAGNOSTICS updated = ROW_COUNT;

  IF updated = 0 THEN
    UPDATE public.emergency_requests SET status = 'expired', responded_at = now() WHERE id = _request_id;
    RAISE EXCEPTION 'Another helper has already been assigned';
  END IF;

  UPDATE public.emergency_requests SET status = 'accepted', responded_at = now() WHERE id = _request_id;
  UPDATE public.emergency_requests SET status = 'expired', responded_at = now()
    WHERE incident_id = req.incident_id AND id <> _request_id AND status = 'pending';
  UPDATE public.helpers SET current_incident_id = req.incident_id, is_available = false WHERE user_id = uid;

  INSERT INTO public.incident_events (incident_id, actor_id, stage, note)
  VALUES (req.incident_id, uid, 'helper_assigned', 'Helper accepted the request');

  INSERT INTO public.notifications (user_id, incident_id, kind, title, body)
  VALUES (inc.user_id, req.incident_id, 'helper', 'A helper is on the way',
          'A verified ResQNow helper accepted your emergency.');

  RETURN inc;
END; $$;
GRANT EXECUTE ON FUNCTION public.accept_emergency_request(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.decline_emergency_request(_request_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.emergency_requests SET status = 'declined', responded_at = now()
   WHERE id = _request_id AND helper_id = auth.uid() AND status = 'pending';
END; $$;
GRANT EXECUTE ON FUNCTION public.decline_emergency_request(UUID) TO authenticated;

-- ============ realtime ============
ALTER TABLE public.incidents REPLICA IDENTITY FULL;
ALTER TABLE public.emergency_requests REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.incident_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_events;
