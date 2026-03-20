# Fase 1A: E2E Testing Guide - Notification System

## Overview
This guide provides step-by-step scenarios to manually test the complete notification system end-to-end, covering both backend and frontend functionality.

**Duration:** ~30 minutes
**Prerequisites:** Backend running on :3000, Frontend running on :3001, Database accessible

---

## Setup: Test Accounts

Use these seed accounts for testing:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Tutor (Ana) | ana@mitra.com | Mitra@2024 | Sends invites, receives confirmations |
| Tutor (Bruno) | bruno@mitra.com | Mitra@2024 | Creates pets |
| Prestador (Carlos) | carlos@mitra.com | Mitra@2024 | Receives invites, accepts |

---

## Test Scenario 1: Tutor Invites Prestador

### Objective
Verify that when a tutor invites a prestador, both notification creation and email delivery work.

### Steps

1. **Login as Ana (Tutor)**
   - Navigate to http://localhost:3001/login
   - Email: `ana@mitra.com`
   - Password: `Mitra@2024`
   - ✓ Should see home with "Meus pets"

2. **Select a Pet**
   - Click on Luna (Golden Retriever)
   - ✓ Should see pet details page

3. **Invite Prestador**
   - Find "Prestadores" tab/section
   - Click "Convidar prestador"
   - Modal appears with form:
     - Email: `carlos@mitra.com`
     - Tipo: Veterinário
     - Permissões: [VISUALIZAR, REGISTRAR_SERVICO, REGISTRAR_VACINA, EDITAR_SAUDE]
     - Click "Enviar convite"
   - ✓ Modal closes
   - ✓ Toast appears: "Convite enviado com sucesso"

4. **Verify Database Entry**
   - In Prisma Studio (http://localhost:5555):
     - Navigate to `PetPrestador` table
     - ✓ Should see new row with:
       - `petId`: Luna's ID
       - `prestadorId`: Carlos's profile ID
       - `aceito: false`
       - `statusVinculo: ATIVO`
       - `convidadoPor`: Ana's user ID

5. **Verify Email Sent**
   - Check Resend dashboard or email logs
   - ✓ Email should be received by `carlos@mitra.com`
   - ✓ Subject: "Novo convite para Luna"
   - ✓ Body includes: "Ana convida você para atender Luna"
   - ✓ Deep link button: "/prestador/pendencias"

6. **Verify Notification Created**
   - Prisma Studio → `Notificacao` table
   - ✓ Should see new row:
     - `usuarioId`: Carlos's user ID
     - `tipo: CONVITE_PRESTADOR`
     - `titulo: "Novo convite para Luna"`
     - `lida: false`
     - `deepLink: "/prestador/pendencias"`

---

## Test Scenario 2: Toast Alert on New Notification

### Objective
Verify that prestador sees toast alert when new notification arrives.

### Steps

1. **Open Two Browser Windows**
   - Window A: Ana logged in (http://localhost:3001/home)
   - Window B: Carlos logged in (http://localhost:3001/home)

2. **Observe Carlos's Notification Bell**
   - Window B: Top-right navbar
   - ✓ Should show bell icon
   - Badge count: 0 or previous count

3. **Ana Sends Invite (from Window A)**
   - Click pet Luna → Invite Carlos
   - Submit invitation form

4. **Watch Window B**
   - ✓ Within 30 seconds, notification bell badge updates
   - ✓ Toast appears: "1 nova notificação"
   - ✓ Toast disappears after 5 seconds
   - ✓ Bell badge now shows "1"

5. **Click Toast or Bell**
   - Click on notification bell
   - ✓ Navigates to /notificacoes page

---

## Test Scenario 3: NotificacaoCenter Page

### Objective
Verify notification center displays and manages notifications correctly.

### Steps

1. **Navigate to Notificações Page**
   - Click bell icon in navbar
   - ✓ URL: http://localhost:3001/notificacoes
   - ✓ Page title: "Notificações"

2. **Verify Notification Display**
   - ✓ Should see card with:
     - Emoji icon (🤝 for CONVITE_PRESTADOR)
     - Title: "Novo convite para Luna"
     - Message: "Ana convida você para atender Luna"
     - Time: "Agora" or "5m atrás"
     - Blue dot indicator (unread)
     - "Ver detalhes" link
     - "Marcar como lida" button

3. **Test Filters**
   - Click "Não-lidas" tab
     - ✓ Shows only unread notifications
   - Click "Lidas" tab
     - ✓ Empty (no read notifications yet)
   - Click "Todas" tab
     - ✓ Shows all notifications again

4. **Mark as Read**
   - Click "Marcar como lida" button
   - ✓ Blue dot disappears
   - ✓ Card styling changes (no longer highlighted)
   - ✓ Notification moves to "Lidas" filter

5. **Bulk Mark as Read**
   - Create another notification (send invite from Ana again)
   - Go back to Notificações
   - ✓ Should see "Marcar todas como lidas" button
   - Click it
   - ✓ All notifications marked as read
   - ✓ Bell badge disappears from navbar

6. **Test Deep Links**
   - In Notificações, click "Ver detalhes"
   - ✓ Should navigate to pet's prestador tab or relevant page

---

## Test Scenario 4: Prestador Accepts Invitation

### Objective
Verify that when prestador accepts, tutor receives notification.

### Steps

1. **Carlos Accepts Invite**
   - Window B (Carlos logged in)
   - In Notificações page, find "Novo convite para Luna"
   - Click "Ver detalhes"
   - ✓ Should navigate to accept/manage page
   - Click "Aceitar" button
   - ✓ Success toast: "Convite aceito"

2. **Verify Database Update**
   - Prisma Studio → `PetPrestador` table
   - ✓ Row for Luna + Carlos:
     - `aceito: true`
     - `dataAceite: <current timestamp>`

3. **Ana Receives Notification**
   - Window A (Ana)
   - ✓ Within 30 seconds, bell badge updates (now shows "1")
   - ✓ Toast appears: "1 nova notificação"
   - ✓ Toast says: "Carlos aceitou convite"

4. **Ana Checks Notificação**
   - Click bell icon
   - ✓ Navigate to /notificacoes
   - ✓ Should see card:
     - Emoji: ✅ (PRESTADOR_ACEITO_CONVITE)
     - Title: "Carlos aceitou convite"
     - Message: "Carlos aceitou seu convite para atender Luna"
     - Deep link to pet details

5. **Verify Email to Ana**
   - Check email inbox for ana@mitra.com
   - ✓ Subject: "Carlos aceitou convite"
   - ✓ Body mentions Luna and Carlos's acceptance

---

## Test Scenario 5: Tutor Revokes Access

### Objective
Verify notification when tutor removes prestador access.

### Steps

1. **Ana Revokes Carlos's Access**
   - Window A (Ana)
   - Navigate to Luna pet details
   - Find "Prestadores" section → Carlos's entry
   - Click "X" or "Remover acesso" button
   - Confirm: "Remover acesso?"
   - ✓ Success toast

2. **Verify Database Update**
   - Prisma Studio → `PetPrestador` table
   - ✓ Row for Luna + Carlos:
     - `statusVinculo: BLOQUEADO` (soft delete)
     - NOT hard-deleted

3. **Carlos Receives Notification**
   - Window B (Carlos)
   - ✓ Within 30 seconds, bell badge updates
   - ✓ Toast: "1 nova notificação"

4. **Verify Notification Content**
   - Click bell
   - ✓ See card with:
     - Emoji: 🚫 (ACESSO_REMOVIDO_PRESTADOR)
     - Title: "Acesso removido para Luna"
     - Message: "Ana removeu seu acesso para atender Luna"

5. **Verify Email**
   - Check carlos@mitra.com email
   - ✓ Subject: "Acesso removido para Luna"
   - ✓ Email confirms removal of access

---

## Test Scenario 6: Polling & Real-time Updates

### Objective
Verify that 30-second polling is fetching notifications correctly.

### Steps

1. **Open Network Inspector**
   - Window: Carlos's browser (http://localhost:3001/notificacoes)
   - Open DevTools → Network tab
   - Filter by XHR/Fetch

2. **Observe Polling Requests**
   - ✓ Every ~30 seconds, see request to `/api/v1/notifications`
   - ✓ Response includes array of notifications
   - ✓ Each notification has: `id`, `titulo`, `mensagem`, `lida`, `criadoEm`, `deepLink`

3. **Send New Notification While Watching**
   - In another window, send a new invite
   - ✓ Next polling request (within 30s) includes new notification
   - ✓ UI updates automatically without page refresh

---

## Test Scenario 7: Error Handling

### Objective
Verify system handles errors gracefully.

### Steps

1. **Simulate Network Error (Optional)**
   - In DevTools, set offline mode
   - ✓ Toast notification system still works
   - ✓ Falls back to mock data (if configured)
   - Go back online
   - ✓ Syncs with real backend data

2. **Invalid Deep Links**
   - Create notification with invalid deep link
   - Click "Ver detalhes"
   - ✓ Either navigates gracefully or shows error toast
   - ✓ App doesn't crash

3. **Missing Notification Data**
   - Manually create notification without some fields
   - In Notificações page
   - ✓ Components render with sensible defaults
   - ✓ No console errors

---

## Test Scenario 8: UI/UX Validation

### Objective
Verify visual design and user experience.

### Steps

1. **Bell Icon & Badge**
   - Badge shows: 0, 1, 2, ..., 9, 9+
   - ✓ Red background, white text
   - ✓ Positioned at top-right of bell
   - ✓ Disappears when count = 0

2. **Toast Styling**
   - Success toast: Green background
   - Error toast: Red background
   - Info toast: Blue background
   - ✓ All have close button (X)
   - ✓ Auto-dismiss after 5 seconds
   - ✓ Smooth fade animation

3. **NotificacaoCenter Responsive**
   - Test on mobile (375px width)
   - Test on tablet (768px width)
   - Test on desktop (1280px width)
   - ✓ Layout adjusts appropriately
   - ✓ No horizontal scroll
   - ✓ Buttons are clickable on touch devices

4. **Notification Cards**
   - Unread: Light blue background
   - Read: White background
   - ✓ Hover effects work
   - ✓ Emoji icons load correctly
   - ✓ Text wraps properly for long messages

---

## Test Scenario 9: Performance

### Objective
Verify system performs well under normal conditions.

### Steps

1. **Page Load Time**
   - Navigate to /notificacoes
   - ✓ Page loads in < 2 seconds
   - ✓ No layout shift
   - ✓ Smooth scrolling

2. **Notification Count**
   - Create 50+ notifications
   - Open /notificacoes
   - ✓ Page still loads quickly
   - ✓ Scrolling is smooth
   - ✓ No memory leaks (check DevTools)

3. **Polling Performance**
   - Keep browser open for 5 minutes
   - Monitor Network tab
   - ✓ Polling requests are consistent
   - ✓ No duplicate requests
   - ✓ Memory usage stable

---

## Test Scenario 10: Edge Cases

### Objective
Test unusual but valid scenarios.

### Steps

1. **Multiple Invites from Same Tutor**
   - Ana invites Carlos to Luna multiple times
   - ✓ Each invite creates separate notification
   - ✓ Doesn't show "already invited" error
   - (Backend should handle this gracefully)

2. **Rapid Invite/Accept/Revoke**
   - Send invite, immediately accept, immediately revoke
   - ✓ No race conditions
   - ✓ All notifications appear eventually
   - ✓ Database state is consistent

3. **Very Long Titles/Messages**
   - Create notification with 500-char title
   - In Notificacoes
   - ✓ Text truncates properly
   - ✓ Doesn't break layout
   - ✓ Full text visible on hover (tooltip)

4. **Special Characters in Names**
   - Create user with name: "Ana & José"
   - Send invite
   - ✓ Notification renders correctly (no HTML injection)
   - ✓ Email displays properly

---

## Verification Checklist

### Backend ✅
- [ ] Notifications created in database
- [ ] `lida` field defaults to `false`
- [ ] `criadoEm` timestamp set correctly
- [ ] `lidaEm` null until marked as read
- [ ] Email sent successfully to correct address
- [ ] PetPrestador updated with correct status
- [ ] No database errors in logs
- [ ] Soft delete pattern working (statusVinculo)

### Frontend ✅
- [ ] Contexts load without errors
- [ ] Toast component renders
- [ ] Polling works (30s intervals)
- [ ] Bell icon displays with correct badge
- [ ] /notificacoes page loads
- [ ] Notifications display with correct info
- [ ] Filters work (Todas, Não-lidas, Lidas)
- [ ] Mark as read updates state
- [ ] Deep links navigate correctly
- [ ] No console errors

### Email ✅
- [ ] Resend API call succeeds
- [ ] Email received in inbox (not spam)
- [ ] Subject line correct
- [ ] Body content accurate
- [ ] Deep link button works
- [ ] Footer with unsubscribe link

### User Experience ✅
- [ ] Toast appears within 5 seconds of event
- [ ] Bell badge updates within 30 seconds
- [ ] No notifications lost
- [ ] UI responsive on all screen sizes
- [ ] No broken links
- [ ] Clear loading states
- [ ] Error messages helpful

---

## Troubleshooting

### Notification Not Appearing

**Check:**
1. Backend logs for errors in invitePrestador()
2. Resend logs for email delivery failures
3. Database: Is PetPrestador row created?
4. Database: Is Notificacao row created?
5. Frontend polling: Network tab → /api/v1/notifications response

**Common Issues:**
- RESEND_API_KEY not set → Check .env
- User not authenticated → Check auth cookies
- Polling disabled → Check NotificacaoProvider useEffect

### Toast Not Showing

**Check:**
1. ToastProvider wraps children in layout.tsx
2. useToast hook called from component within ToastProvider
3. Browser DevTools → no console errors
4. Check if toast duration is 0 (would dismiss immediately)

### Email Not Received

**Check:**
1. Resend API key valid
2. RESEND_FROM_EMAIL set in .env
3. Recipient email valid
4. Check spam/junk folder
5. Resend dashboard → Email logs

### Bell Badge Not Updating

**Check:**
1. NotificacaoProvider wraps entire app
2. useNotificacoes hook called in TopBar
3. contNaoLidas value in browser DevTools
4. Check polling interval (should be 30s)

---

## Success Criteria

All tests pass when:

✅ Notifications created when expected
✅ Emails delivered within 2 minutes
✅ Bell badge updates within 30 seconds
✅ Toast alerts appear for new notifications
✅ NotificacaoCenter displays all notifications
✅ Filtering works correctly
✅ Mark as read updates database
✅ Deep links navigate successfully
✅ No errors in console
✅ UI responsive and accessible

---

**Date Tested:** ___________
**Tested By:** ___________
**Result:** PASS / FAIL
**Notes:**

---

## Sign-Off

- [ ] Backend developer verified
- [ ] Frontend developer verified
- [ ] QA approved for staging
- [ ] Ready for production deployment

