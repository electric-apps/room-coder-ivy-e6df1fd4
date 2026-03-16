#!/bin/bash
# Forward AskUserQuestion hook events to Electric Agent studio.
# Blocks until the user answers in the web UI.
BODY="$(cat)"
RESPONSE=$(curl -s -X POST "http://host.docker.internal:4400/api/sessions/e6df1fd4-b4e0-4555-9321-581acf95b6dd/hook-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 1d29226154b6428318590b8ce95260eb27e3e7579d83deba9af14e8ec78b8b3f" \
  -d "${BODY}" \
  --max-time 360 \
  --connect-timeout 5 \
  2>/dev/null)
if echo "${RESPONSE}" | grep -q '"hookSpecificOutput"'; then
  echo "${RESPONSE}"
fi
exit 0