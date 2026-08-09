
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_selected_contact_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.can_view_incident(UUID, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.allowed_next_stages(public.incident_stage) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.advance_incident(UUID, public.incident_stage, TEXT, JSONB) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.start_incident(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, NUMERIC, public.incident_severity, NUMERIC, TEXT, JSONB, JSONB, public.incident_stage) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.dispatch_helpers(UUID, NUMERIC) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.accept_emergency_request(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.decline_emergency_request(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.can_view_incident(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.allowed_next_stages(public.incident_stage) TO authenticated;
GRANT EXECUTE ON FUNCTION public.advance_incident(UUID, public.incident_stage, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_incident(DOUBLE PRECISION, DOUBLE PRECISION, TEXT, NUMERIC, public.incident_severity, NUMERIC, TEXT, JSONB, JSONB, public.incident_stage) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dispatch_helpers(UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_emergency_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_emergency_request(UUID) TO authenticated;
