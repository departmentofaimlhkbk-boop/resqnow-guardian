# ResQNow Guardian

RESQNOW — ONE-SHOT FULL BACKEND BUILD AND FRONTEND INTEGRATION

I have uploaded the latest ZIP containing my EXISTING ResQNow frontend.

THIS ZIP IS THE SOURCE OF TRUTH.

Build the complete backend around this exact frontend and connect everything into ONE fully working application.

IMPORTANT:

Do not redesign my frontend.

Do not replace my frontend.

Do not create a new UI.

Do not create a generic dashboard.

Do not remove existing screens.

Do not remove existing buttons.

Do not change the visual design unless absolutely necessary to fix a functional problem.

I want the EXISTING frontend preserved and a matching, reliable backend built specifically for it.

============================================================

MOST IMPORTANT INSTRUCTION — ONE-SHOT EXECUTION

============================================================

Do NOT stop and ask me to make optional architectural decisions.

Do NOT ask me to choose:

- database

- authentication method

- routing strategy

- realtime strategy

- table structure

- API structure

- state-management approach

- UI design

- backend architecture

- error-handling strategy

Inspect the uploaded project and make the technically appropriate decision yourself.

Use the technologies already present in the uploaded project whenever possible.

If Supabase is already used by the project, use the existing Supabase architecture.

Do not introduce unnecessary technologies.

Do not create duplicate backend systems.

Do not create duplicate authentication systems.

Do not create duplicate routers.

Do not create duplicate database clients.

If something is not configured yet, implement the application architecture correctly and use environment variables/configuration rather than inventing secrets.

NEVER fabricate credentials, API keys, SMS credentials, database passwords or service-role keys.

============================================================

PRIMARY OBJECTIVE

============================================================

The final application must be:

EXISTING RESQNOW FRONTEND

+

WORKING AUTHENTICATION

+

WORKING DATABASE

+

WORKING BACKEND LOGIC

+

WORKING ROUTING

+

WORKING EMERGENCY SYSTEM

+

WORKING HELPER SYSTEM

+

WORKING NOTIFICATIONS

+

WORKING REALTIME

+

SECURE DATA ACCESS

+

AI/ML-READY ARCHITECTURE

Every existing frontend workflow must be connected to the backend.

============================================================

PHASE 1 — INSPECT THE ENTIRE ZIP

============================================================

Before modifying code, inspect the complete uploaded project.

Inspect all relevant files including:

package.json

src/

src/routes/

src/screens/

src/components/

src/app/

hooks

services

utilities

authentication

database code

Supabase code

router

state management

mock data

environment configuration

Pay particular attention to:

Auth.tsx

Emergency.tsx

Helper.tsx

Onboarding.tsx

Permissions.tsx

SelectContacts.tsx

Tabs.tsx

VictimHome.tsx

Also inspect every other screen/component present in the ZIP.

Understand the existing architecture BEFORE changing it.

Build an internal map:

SCREEN

→ USER ACTION

→ BUTTON

→ FUNCTION

→ API/DATABASE

→ BACKEND LOGIC

→ RESPONSE

→ UI UPDATE

Every existing button and interactive element must have an intended working behavior.

============================================================

PHASE 2 — PRESERVE THE FRONTEND

============================================================

The uploaded frontend is the source of truth.

Preserve:

- layout

- colors

- typography

- spacing

- cards

- buttons

- icons

- screens

- navigation

- animations

- mobile-style phone interface

- ResQNow branding

Do not redesign the application.

Only modify frontend code where necessary to connect it correctly to the backend or fix an existing functional defect.

============================================================

PHASE 3 — AUTHENTICATION FIRST

============================================================

Authentication must be completely reliable.

The required flow is:

OPEN APP

↓

CHECK SESSION

↓

AUTH LOADING

↓

LOGGED OUT → LOGIN/REGISTER

↓

LOGGED IN → CORRECT RESQNOW DASHBOARD

Use the existing authentication architecture.

If Supabase authentication is already present:

USE SUPABASE AUTH.

Do not create another authentication system.

============================================================

REGISTRATION

============================================================

Connect the existing registration UI.

Registration must:

1. Validate input.

2. Create the user.

3. Create the corresponding profile.

4. Establish an authenticated session.

5. Load the user's profile.

6. Determine the user's role.

7. Continue to the correct existing ResQNow screen.

For this prototype/demo:

Prefer immediate sign-in after successful registration rather than requiring email confirmation.

Do not make the user wait for email verification during normal testing.

Do not fabricate email verification.

============================================================

LOGIN

============================================================

Login must:

1. Submit credentials.

2. Show a loading state.

3. Authenticate with the backend.

4. Wait until the authenticated session is confirmed.

5. Load the user profile.

6. Determine the correct role.

7. Navigate to the existing dashboard.

CRITICAL:

DO NOT navigate before authentication state is confirmed.

Prevent:

- login succeeds but dashboard does not open

- login returns to login page

- blank screen

- infinite redirect

- route loop

- authentication race condition

============================================================

SESSION PERSISTENCE

============================================================

Test:

LOGIN

↓

DASHBOARD

↓

REFRESH

↓

DASHBOARD STILL OPEN

Also test:

LOGOUT

↓

LOGIN PAGE

And:

LOGGED OUT

↓

DIRECT PROTECTED ROUTE

↓

LOGIN PAGE

Authentication loading must be handled separately from authenticated/unauthenticated state.

============================================================

PHASE 4 — ROUTING

============================================================

Inspect the existing TanStack Router architecture if present.

Pay special attention to:

src/routes/__root.tsx

routeTree.gen.ts

router configuration

authentication guards

all route files

Ensure:

- root route loads

- child routes load

- protected routes work

- public routes work

- login navigation works

- dashboard navigation works

- logout navigation works

- browser refresh works

- direct URL navigation works

- browser back/forward works

Do not create multiple conflicting routers.

Do not create authentication redirect loops.

============================================================

PHASE 5 — DATABASE

============================================================

Build the database required by the EXISTING frontend.

If Supabase exists in the project, use Supabase.

Create/use appropriate entities such as:

profiles

emergency_contacts

medical_profiles

user_settings

helpers

helper_locations

incidents

incident_events

emergency_requests

notifications

hospitals

Only create tables that are actually required.

Use:

- primary keys

- foreign keys

- timestamps

- constraints

- indexes

- proper relationships

Do not create duplicate versions of the same entity.

============================================================

PHASE 6 — SECURITY

============================================================

Protect user data.

A user must not be able to access another user's private information.

Protect:

- profiles

- emergency contacts

- medical data

- settings

- incidents

- location

If Supabase is used, implement appropriate Row Level Security policies.

Never expose:

- service-role keys

- private database credentials

- secret API keys

in frontend source code.

Use environment variables.

============================================================

PHASE 7 — PROFILE

============================================================

Connect the existing profile interface.

Support:

- view profile

- edit profile

- save profile

- loading

- success

- error

Changes must persist after refresh.

============================================================

PHASE 8 — EMERGENCY CONTACTS

============================================================

Connect SelectContacts.tsx to the database.

Support:

- load contacts

- add contact

- edit contact

- delete contact

- select contact

- unselect contact

- save contacts

If the existing frontend is designed for five contacts:

enforce the five-contact limit at the backend/database level too.

Prevent duplicate contacts where appropriate.

============================================================

PHASE 9 — MEDICAL DETAILS

============================================================

Connect the existing medical details functionality.

Persist the fields already represented by the frontend, such as:

- blood group

- allergies

- medical conditions

- medications

- emergency notes

Protect this information.

============================================================

PHASE 10 — SETTINGS

============================================================

Connect existing settings.

Persist relevant settings already represented in the UI:

- notifications

- privacy

- language

- emergency preferences

- location preferences

Do not redesign the Settings screen.

============================================================

PHASE 11 — INCIDENT DATABASE

============================================================

Create a proper emergency incident system.

An incident should support appropriate fields such as:

incident_id

victim/user_id

created_at

updated_at

latitude

longitude

speed

sensor information

accident probability

severity

current stage

alarm stage

victim response

escalation status

assigned helper

hospital

incident status

Use proper relationships.

Prevent duplicate incidents.

============================================================

PHASE 12 — RESQNOW EMERGENCY STATE MACHINE

============================================================

Connect the existing emergency screens to a real incident state machine.

Use the following logical workflow where it matches the existing frontend:

NORMAL

↓

POSSIBLE_ACCIDENT

↓

ALARM_1

↓

ALARM_2

↓

ALARM_3

↓

ESCALATED

↓

HELPER_SEARCH

↓

HELPER_ASSIGNED

↓

HELPER_NAVIGATING

↓

VICTIM_REACHED

↓

HOSPITAL_NAVIGATION

↓

INCIDENT_COMPLETED

Support valid cancellation.

Support:

"I'M SAFE"

When the user selects I'm Safe:

- stop escalation

- update incident

- record incident event

- update frontend state

Prevent invalid state transitions.

Prevent duplicate escalation.

============================================================

PHASE 13 — THREE 30-SECOND ALARMS

============================================================

Connect the existing alarm UI.

Alarm 1:

30 seconds

Alarm 2:

30 seconds

Alarm 3:

30 seconds

If the user responds:

I'M SAFE

stop escalation.

If no response:

advance to the next stage.

After the final timeout:

escalate the incident.

Important:

The frontend timer is only for displaying the countdown.

The backend/database must maintain authoritative incident state.

Prevent duplicate timers and duplicate escalation.

============================================================

PHASE 14 — HELPER SYSTEM

============================================================

Connect the existing Helper interface.

Support:

- helper profile

- helper availability

- verification status

- helper location

- emergency requests

- accept

- reject

- active assignment

- navigation state

- victim reached

- rescue completed

============================================================

PHASE 15 — HELPER DISPATCH

============================================================

Find eligible helpers using appropriate:

- location

- distance

- availability

- verification

- current assignment

Create emergency requests.

Update the victim and helper state correctly.

============================================================

CRITICAL HELPER CONCURRENCY

============================================================

If two helpers attempt to accept the same incident:

ONLY ONE can become the assigned helper.

Implement atomic/transaction-safe logic.

Never allow two primary helpers to be assigned to the same incident.

============================================================

PHASE 16 — LOCATION

============================================================

Connect existing location functionality.

Support where represented by the frontend:

- victim location

- helper location

- timestamp

- accuracy

Do not expose unnecessary location information.

============================================================

PHASE 17 — HOSPITAL

============================================================

Connect existing hospital functionality.

Support:

- preferred hospital

- hospital selection

- hospital destination

- hospital location

- navigation state

Do not falsely claim that a real hospital has been contacted unless a real integration exists.

============================================================

PHASE 18 — NOTIFICATIONS

============================================================

Implement database-backed in-app notifications.

Support:

- victim notifications

- helper notifications

- emergency updates

- helper assignment

- incident updates

- read/unread

- timestamp

Connect the existing notification UI.

============================================================

PHASE 19 — INCIDENT HISTORY

============================================================

Connect Incident History to real database records.

Show appropriate existing information:

- date

- time

- location

- severity

- helper

- hospital

- status

Persist records after refresh.

============================================================

PHASE 20 — REALTIME

============================================================

REALTIME MUST BE IMPLEMENTED CORRECTLY.

The previous implementation caused:

"Cannot add 'postgres_changes' callbacks for realtime ... after 'subscribe()'"

This must NEVER happen.

Search the ENTIRE codebase for:

postgres_changes

.channel(

.subscribe(

.removeChannel(

on("postgres_changes"

Correct every realtime subscription.

Correct lifecycle:

CREATE CHANNEL

↓

REGISTER ALL postgres_changes LISTENERS

↓

SUBSCRIBE ONCE

↓

STORE CHANNEL REFERENCE

↓

CLEAN UP WHEN COMPONENT UNMOUNTS

NEVER:

subscribe()

↓

add postgres_changes listener

All listeners MUST be registered before subscribe().

Do not create duplicate channels.

Do not subscribe on every render.

Do not create subscriptions from unstable React dependencies.

Use proper useEffect lifecycle.

Clean up subscriptions.

Prevent memory leaks.

Prevent duplicate event handling.

============================================================

PHASE 21 — useResQ.ts

============================================================

Inspect:

src/useResQ.ts

very carefully.

Fix any realtime lifecycle problems.

Ensure:

- no listener added after subscribe

- no duplicate subscriptions

- no repeated channel creation

- no subscriptions on every render

- proper dependencies

- proper cleanup

- no stale subscriptions

- no state updates after unmount

The ResQNow application MUST NOT crash because of realtime.

============================================================

PHASE 22 — ROOT ROUTE

============================================================

Inspect:

src/routes/__root.tsx

and the entire route hierarchy.

Fix any root-route errors.

The root component must render correctly.

Do not hide route errors.

Do not create a second root router.

============================================================

PHASE 23 — EVERY BUTTON

============================================================

Audit every button in the uploaded frontend.

For EVERY button:

Determine its intended behavior from the existing UI/code.

Then implement it.

Every button must have:

- correct event handler

- correct navigation

- correct backend operation if required

- loading state where appropriate

- error handling

- success handling

- correct UI state update

NO:

- dead buttons

- empty handlers

- console.log-only handlers

- fake success

- broken navigation

- accidental no-op buttons

============================================================

PHASE 24 — EVERY FORM

============================================================

Audit every form.

Implement:

- validation

- submission

- loading

- backend operation

- success

- error

- persistence

- duplicate-submission prevention

============================================================

PHASE 25 — AI/ML ARCHITECTURE

============================================================

This is an AIML student project.

Do NOT incorrectly label ordinary frontend/backend logic as AI.

Build a clean ML-ready architecture.

Intended pipeline:

PHONE SENSOR DATA

↓

PREPROCESSING

↓

FEATURE EXTRACTION

↓

ML MODEL

↓

ACCIDENT PROBABILITY

↓

SEVERITY CLASSIFICATION

↓

EMERGENCY DECISION

↓

INCIDENT SYSTEM

Potential features:

- accelerometer X/Y/Z

- gyroscope X/Y/Z

- speed

- sudden deceleration

- impact characteristics

- GPS

If the ZIP does not contain an actual trained ML model:

DO NOT invent an ML model.

Instead create a clean inference interface/service where an actual Python ML model can later be connected.

Keep:

RULE-BASED LOGIC

separate from:

ACTUAL ML INFERENCE.

============================================================

PHASE 26 — EXTERNAL SERVICES

============================================================

Do NOT fake external actions.

Never claim:

SMS sent

voice call completed

police notified

hospital contacted

AI inference completed

unless an actual service exists and succeeds.

For the prototype:

Use real database-backed in-app notifications.

Keep the architecture ready for future Twilio/SMS/voice integration.

============================================================

PHASE 27 — LOADING / ERROR / EMPTY STATES

============================================================

Every backend-connected screen must correctly handle:

LOADING

SUCCESS

ERROR

EMPTY

UNAUTHORIZED

Never leave the user staring at a blank page.

Never display fake success after a failed database operation.

Allow retry where appropriate.

============================================================

PHASE 28 — DATABASE FAILURE HANDLING

============================================================

If a database/API operation fails:

DO NOT crash.

DO NOT silently ignore it.

DO NOT pretend it succeeded.

Show a controlled user-friendly error.

Allow retry.

============================================================

PHASE 29 — PERFORMANCE

============================================================

Prevent:

- duplicate API requests

- duplicate realtime listeners

- memory leaks

- unnecessary subscriptions

- duplicate incidents

- duplicate helper assignment

- duplicate notifications

- race conditions

============================================================

PHASE 30 — COMPLETE BUILD VALIDATION

============================================================

After implementation:

Run the project's correct installation/build/lint/type checks.

Use the package manager already used by the project.

Verify the application actually starts.

Verify production build succeeds.

Fix application-caused errors.

============================================================

PHASE 31 — MANDATORY TESTING

============================================================

Actually test these flows before declaring completion.

AUTH:

Register

→ immediate session

→ correct screen

Login

→ session

→ dashboard

Refresh

→ dashboard remains

Logout

→ login

Protected route while logged out

→ login

Login again

→ dashboard

NAVIGATION:

Test every existing route.

Test every tab.

Test every important button.

DATABASE:

Create

Read

Update

Delete

Persistence

Authorization

EMERGENCY:

Possible accident

→ Alarm 1

→ Alarm 2

→ Alarm 3

→ escalation

Also:

I'm Safe

→ cancellation

HELPER:

Helper available

→ request

→ accept

→ assignment

→ navigation

→ victim reached

→ completion

REALTIME:

Incident update

→ realtime update

Notification

→ realtime update

Unmount screen

→ subscription cleanup

Navigate back and forth

→ no duplicate subscriptions

============================================================

PHASE 32 — BROWSER CONSOLE

============================================================

Inspect the browser console.

Fix all application-caused errors.

The following MUST NOT appear:

"Cannot add 'postgres_changes' callbacks for realtime ... after 'subscribe()'"

Also investigate and fix application-caused errors involving:

src/routes/__root.tsx

Do not hide errors.

Do not disable error reporting.

Do not remove functionality simply to make the console look clean.

============================================================

PHASE 33 — FINAL ACCEPTANCE CHECKLIST

============================================================

Before declaring the project complete, verify:

[ ] Frontend loads

[ ] Login loads

[ ] Register works

[ ] Immediate sign-in works

[ ] Login works

[ ] Dashboard opens after login

[ ] Refresh preserves session

[ ] Logout works

[ ] Protected routes work

[ ] No authentication redirect loop

[ ] Profile works

[ ] Emergency contacts work

[ ] Medical details work

[ ] Settings work

[ ] Emergency incident creation works

[ ] Alarm 1 works

[ ] Alarm 2 works

[ ] Alarm 3 works

[ ] I'm Safe works

[ ] Escalation works

[ ] Helper discovery works

[ ] Helper request works

[ ] Helper accept works

[ ] Helper assignment is atomic

[ ] Location workflow works

[ ] Hospital workflow works

[ ] Notifications work

[ ] Incident history works

[ ] Realtime works

[ ] Realtime cleanup works

[ ] No duplicate realtime subscriptions

[ ] No postgres_changes lifecycle error

[ ] Root route works

[ ] All buttons work

[ ] All forms work

[ ] Loading states work

[ ] Error states work

[ ] Empty states work

[ ] Unauthorized access is blocked

[ ] Database persistence works

[ ] Build succeeds

[ ] No obvious application runtime errors

============================================================

FINAL INSTRUCTION

============================================================

DO NOT merely generate code and claim completion.

Follow this cycle:

INSPECT

→ IMPLEMENT

→ CONNECT

→ RUN

→ TEST

→ FIND ERRORS

→ FIX

→ RUN AGAIN

→ TEST AGAIN

If you find an error, fix the root cause.

Do not hide errors.

Do not disable features to make the preview load.

Do not redesign the frontend.

Do not create a new application.

Do not replace the existing ResQNow screens.

Build the backend specifically around the uploaded ResQNow frontend.

The final result must behave as ONE integrated ResQNow application.

The uploaded ZIP is the source of truth for the frontend.

Make reasonable technical decisions yourself and proceed without unnecessary clarification questions.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/37e7c4f8-52bf-48ff-b3c7-e05d1071b226).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
