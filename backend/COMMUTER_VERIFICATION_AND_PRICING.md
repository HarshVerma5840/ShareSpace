# Commuter Verification And Pricing Documentation

## Purpose

This document explains the current user classification, commuter verification flow, booking discount rules, platform-fee handling, and the present state of Indian driving-license verification in this project.

It covers both:

- what is implemented right now
- what "verifying an Indian driving license" would mean in a real production system

Primary implementation files:

- `backend/src/main/java/com/sharespace/backend/user/UserRole.java`
- `backend/src/main/java/com/sharespace/backend/user/UserVerificationStatus.java`
- `backend/src/main/java/com/sharespace/backend/user/AppUser.java`
- `backend/src/main/java/com/sharespace/backend/user/UserController.java`
- `backend/src/main/java/com/sharespace/backend/auth/AuthService.java`
- `backend/src/main/java/com/sharespace/backend/booking/Booking.java`
- `backend/src/main/java/com/sharespace/backend/booking/BookingService.java`
- `backend/src/main/java/com/sharespace/backend/booking/BookingResponse.java`
- `backend/src/main/java/com/sharespace/backend/wallet/WalletService.java`
- `src/App.jsx`

## Business Rules

The platform now distinguishes users like this:

- `HOST`
- `TOURIST`
- `COMMUTER`

There is also legacy compatibility for:

- `GUEST`

`GUEST` is treated as an older commuter-style account so existing users do not break.

Verification rules:

- tourists do not need verification
- commuters can verify
- verified commuters receive a permanent `5%` booking discount
- the `5%` discount is treated as waived platform fee
- hosts still receive the base spot price

Meaning:

- tourist: can book, no verification, no commuter discount
- unverified commuter: can book, no discount
- verified commuter: can book, gets `5%` off
- host: cannot book own spot, does not use commuter verification flow

## Current Data Model

## User Role Enum

File:

- `backend/src/main/java/com/sharespace/backend/user/UserRole.java`

Current values:

- `HOST`
- `GUEST`
- `TOURIST`
- `COMMUTER`

Why `GUEST` still exists:

- older accounts may already be stored with that enum value
- removing it now could break startup or old rows
- the app treats old `GUEST` users as commuter-like for compatibility

## User Verification Status Enum

File:

- `backend/src/main/java/com/sharespace/backend/user/UserVerificationStatus.java`

Current values:

- `NOT_APPLICABLE`
- `UNVERIFIED`
- `VERIFIED`

Meaning:

- `NOT_APPLICABLE`: non-commuter verification not needed
- `UNVERIFIED`: commuter can still book but does not get discount
- `VERIFIED`: commuter receives verified badge and `5%` fee waiver

## AppUser Fields

File:

- `backend/src/main/java/com/sharespace/backend/user/AppUser.java`

Relevant current fields:

- `role`
- `verificationStatus`

Current logic:

- newly registered commuters get `UNVERIFIED`
- newly registered tourists and hosts get `NOT_APPLICABLE`
- legacy `GUEST` users default to commuter-like `UNVERIFIED` behavior if no explicit verification status exists

## Auth And Registration Flow

File:

- `backend/src/main/java/com/sharespace/backend/auth/AuthService.java`

Current registration behavior:

1. create user
2. store selected role
3. assign verification status
4. create wallet with demo balance
5. return user summary plus wallet

Verification status assignment on register:

- `COMMUTER` -> `UNVERIFIED`
- everything else -> `NOT_APPLICABLE`

## User Summary API Shape

File:

- `backend/src/main/java/com/sharespace/backend/user/UserSummaryResponse.java`

Current fields:

- `id`
- `fullName`
- `email`
- `phone`
- `role`
- `verificationStatus`

Important:

- verified commuter state is derived from `role == COMMUTER` and `verificationStatus == VERIFIED`

## Verification Endpoint

File:

- `backend/src/main/java/com/sharespace/backend/user/UserController.java`

Current endpoint:

- `POST /api/users/{id}/verify`

Current behavior:

1. load user by id
2. reject if user is not commuter-like
3. if role is legacy `GUEST`, convert to `COMMUTER`
4. set verification status to `VERIFIED`
5. save user
6. return updated user summary

This endpoint is what the frontend Settings page calls when the user presses the `Verify` button.

## Important Truth About Current Indian Driving License Verification

The current implementation does not actually inspect or validate an Indian driving license document.

What the current code really does:

- it exposes a manual in-app verification action
- pressing `Verify` marks a commuter as verified
- no document upload happens
- no OCR happens
- no government database lookup happens
- no KYC provider is called

Strictly speaking:

- the project currently implements commuter verification state
- it does not yet implement real Indian driving-license verification

So if someone asks "how are we verifying an Indian driving license right now?", the correct answer is:

- we are not performing document-level Indian driving-license validation yet
- we are currently using an app-side/manual verification action to unlock the verified commuter state

## Current Frontend Verification Flow

File:

- `src/App.jsx`

## Registration Screen

Users can register as:

- Tourist
- Commuter
- Host

Current UX message:

- tourists can book instantly
- commuters can verify later in Settings to waive the `5%` platform fee

## Settings Screen

Current Settings behavior:

- shows user role
- shows commuter verification badge where applicable
- shows `Verify` button for commuter-like users

Button states:

- unverified commuter -> `Verify`
- already verified commuter -> `Verified`

When clicked:

- frontend calls `POST /api/users/{id}/verify`
- updated user is saved into session state
- badge and pricing behavior update immediately

## Navigation / Identity Display

The sidebar now displays:

- user name
- user classification
- commuter verification label when applicable

Examples:

- `Tourist`
- `Commuter · Unverified Commuter`
- `Commuter · Verified Commuter`

## Booking Pricing Model

Files:

- `backend/src/main/java/com/sharespace/backend/booking/BookingService.java`
- `backend/src/main/java/com/sharespace/backend/booking/Booking.java`
- `backend/src/main/java/com/sharespace/backend/booking/BookingResponse.java`
- `backend/src/main/java/com/sharespace/backend/wallet/WalletService.java`

## Current Pricing Formula

The system currently uses:

- base spot amount
- platform fee = `5%` of base amount
- verified commuter discount = platform fee amount
- host payout = base amount
- final commuter charge = base + fee - discount

In formula form:

```text
baseAmount = hourlyRate
platformFeeAmount = baseAmount * 0.05
discountAmount = verifiedCommuter ? platformFeeAmount : 0
hostPayoutAmount = baseAmount
totalAmount = baseAmount + platformFeeAmount - discountAmount
```

## Pricing Outcomes

### Tourist

- pays base amount + `5%` platform fee
- gets no commuter discount

### Unverified Commuter

- pays base amount + `5%` platform fee
- gets no commuter discount

### Verified Commuter

- pays base amount only
- `5%` platform fee is waived

### Host

- receives base amount
- host payout is not reduced by commuter discount

This means the platform absorbs the waiver from its own margin, not from the host’s earnings.

## Example

If spot hourly rate is `Rs.100`:

- base amount = `Rs.100`
- platform fee = `Rs.5`

Unverified tourist or commuter:

- total paid = `Rs.105`
- host receives = `Rs.100`
- platform keeps = `Rs.5`

Verified commuter:

- total paid = `Rs.100`
- host receives = `Rs.100`
- platform keeps = `Rs.0`

## Wallet Settlement Logic

File:

- `backend/src/main/java/com/sharespace/backend/wallet/WalletService.java`

Current booking settlement uses:

- debit payer by final total charge
- credit host by base payout only

This is done through:

- `settleBooking(payerId, payeeId, totalCharge, hostPayout)`

That makes the pricing rule enforceable in balance movement, not only in UI display.

## Booking Persistence Fields

File:

- `backend/src/main/java/com/sharespace/backend/booking/Booking.java`

Current stored booking values:

- `baseAmount`
- `discountAmount`
- `platformFeeAmount`
- `hostPayoutAmount`
- `totalAmount`

This is useful because:

- receipts can show exact breakdown later
- history pages can display correct totals
- host earnings can use host payout instead of commuter payment total

## Booking API Response

File:

- `backend/src/main/java/com/sharespace/backend/booking/BookingResponse.java`

Current response fields include:

- booking identity fields
- guest and host details
- `baseAmount`
- `discountAmount`
- `platformFeeAmount`
- `hostPayoutAmount`
- `totalAmount`
- status and timestamp

## Frontend Booking UX

File:

- `src/App.jsx`

Current commuter map/spot card shows:

- spot rate
- distance
- drive info
- platform fee preview
- verified discount preview
- final amount preview
- a tag that explains whether the user is paying fee or getting `5%` off

Current booking history shows:

- spot title
- host
- base amount
- fee
- discount
- total paid

Current host earnings screens now show:

- host payout amount instead of commuter charge

This avoids overstating host earnings by accidentally including the waived platform fee.

## How Indian Driving License Verification Should Work In Production

The current implementation is a placeholder/manual verification flow. A real Indian driving-license verification system should look very different.

## Production-Grade Verification Flow

### 1. Document Capture

Collect:

- front image of Indian driving license
- back image if needed
- optional selfie/liveness image
- optional typed license number for cross-check

### 2. OCR Extraction

Run OCR to extract:

- name
- driving license number
- date of birth
- issue date
- expiry date
- issuing authority / RTO details if available

### 3. Document Quality Checks

Validate:

- image sharpness
- glare
- cropping
- tampering clues
- whether required fields are readable

### 4. Data Matching

Compare extracted data with the platform account:

- account full name vs license name
- optional phone/email/profile KYC info
- expiry date must still be valid

### 5. License Format Validation

Validate number structure against expected DL formatting rules used in India.

This is not enough by itself, but it helps reject obvious junk input.

### 6. Authoritative Verification

For real trust, integrate with:

- approved KYC/document verification provider
- or a compliant authoritative verification source

The exact provider choice depends on compliance, contracts, and allowed access patterns.

### 7. Manual Review Fallback

If OCR/provider confidence is weak:

- move case to `PENDING_REVIEW`
- allow admin/manual reviewer to approve or reject

### 8. Audit Trail

Store:

- who verified
- when verified
- what method was used
- why rejected if rejected

## Recommended Verification Statuses For A Real Version

If this feature is expanded later, the status enum should probably evolve to:

- `NOT_APPLICABLE`
- `UNVERIFIED`
- `PENDING`
- `VERIFIED`
- `REJECTED`
- `EXPIRED`

That would support a real document workflow much better than the current simplified enum.

## Recommended Additional Data Model For Real DL Verification

The current implementation keeps only user verification state. A real system should add a separate verification record, for example:

- `userId`
- `licenseNumberMasked`
- `licenseNumberHash`
- `documentFrontUrl`
- `documentBackUrl`
- `ocrName`
- `ocrExpiryDate`
- `verificationProvider`
- `providerReferenceId`
- `status`
- `submittedAt`
- `reviewedAt`
- `reviewNotes`

Why separate entity is better:

- keeps sensitive verification data out of the base user table
- supports re-verification
- supports admin review and audit logs

## Security And Compliance Notes

For a real Indian driving-license verification feature:

- never return full DL number to ordinary frontend clients
- store only masked value for display
- encrypt sensitive values at rest
- validate upload type and size
- avoid storing raw documents in repo or local public folders
- use proper object storage for uploaded files
- define retention/deletion policy for KYC documents
- restrict admin review access carefully

## Current Implementation Summary

What is implemented now:

- tourist / commuter / host registration
- commuter verification status in backend
- `Verify` button in settings
- verified commuter badge
- `5%` fee waiver for verified commuters
- booking fee breakdown in backend and frontend
- host payout preserved at base spot rate
- legacy `GUEST` compatibility

What is not implemented yet:

- Indian DL image upload
- OCR extraction
- number parsing
- expiry validation from document
- government/provider-backed verification
- pending/rejected review workflow
- admin verification dashboard

## Strict Statement On Indian License Verification

The most accurate statement today is:

- the app currently supports commuter verification as a platform status
- it does not yet perform real Indian driving-license document verification
- the current `Verify` button is a manual/mock verification trigger

## Suggested Next Step If You Want Real DL Verification

The cleanest next step would be:

1. add a `DrivingLicenseVerification` entity
2. add document upload endpoint
3. store uploaded DL images securely
4. run OCR and field extraction
5. compare extracted fields with account data
6. mark status as `PENDING` or `VERIFIED`
7. replace the current one-click Verify button with a submit-for-review flow
