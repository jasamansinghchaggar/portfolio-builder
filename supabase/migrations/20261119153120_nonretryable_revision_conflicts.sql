-- A stale editor revision is an expected application conflict, not a
-- serialization failure. Hasql (used by PostgREST) retries SQLSTATE 40001
-- indefinitely, so a single stale save can saturate the database.
-- Keep the revision_conflict message used by the actions, but use the
-- non-retryable PL/pgSQL exception code P0001 (HTTP 400 in PostgREST).
do $$
declare
  v_signature text;
  v_definition text;
  v_old constant text := 'errcode = ''40001'', message = ''revision_conflict''';
  v_new constant text := 'errcode = ''P0001'', message = ''revision_conflict''';
begin
  foreach v_signature in array array[
    'public.save_portfolio_draft(uuid,jsonb,integer)',
    'public.publish_portfolio(uuid,jsonb,jsonb,uuid[],integer)',
    'public.unpublish_portfolio(uuid,integer)',
    'public.admin_save_portfolio_draft(uuid,jsonb,integer)',
    'public.admin_publish_portfolio(uuid,jsonb,jsonb,uuid[],integer)',
    'public.admin_unpublish_portfolio(uuid,integer)'
  ]
  loop
    v_definition := pg_get_functiondef(v_signature::regprocedure);

    -- Abort rather than silently missing a function or changing an
    -- unexpected number of exception sites after a schema change.
    if length(v_definition) - length(replace(v_definition, v_old, ''))
      <> length(v_old) then
      raise exception 'Expected exactly one revision_conflict in %', v_signature;
    end if;

    execute replace(v_definition, v_old, v_new);
  end loop;
end;
$$;

-- The incident circuit breaker revoked these grants. Restore normal draft
-- saving only after every conflict path above is non-retryable.
revoke all on function public.save_portfolio_draft(uuid, jsonb, integer)
  from public, anon;
revoke all on function public.admin_save_portfolio_draft(uuid, jsonb, integer)
  from public, anon;
grant execute on function public.save_portfolio_draft(uuid, jsonb, integer)
  to authenticated;
grant execute on function public.admin_save_portfolio_draft(uuid, jsonb, integer)
  to authenticated;
