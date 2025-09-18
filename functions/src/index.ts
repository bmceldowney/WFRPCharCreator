/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize the Admin SDK
admin.initializeApp();

// ... (previous imports and admin.initializeApp())

export const setCustomUserRole = functions.https.onCall(async (data, context) => {
    // 1. **Authentication and Authorization Check:**
    //    Crucially, verify that the person calling this function is authorized
    //    to set roles. For example, only an existing 'admin' should be able to do this.
    if (!context.auth) {
        // User is not authenticated
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to perform this action.'
        );
    }

    // Example: Check if the caller has an 'admin' custom claim
    // You'd typically set the initial admin user's claim directly via the Firebase console
    // or a one-off Admin SDK script.
    if (!(context.auth.token && context.auth.token.admin === true)) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only administrators can set user roles.'
        );
    }

    // 2. **Validate Request Data:**
    //    Ensure that the client provides the necessary data.
    const targetUid = data.uid;
    const newRole = data.role; // e.g., 'editor', 'basic', 'moderator'

    if (!targetUid || typeof targetUid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The "uid" argument is required and must be a string.'
        );
    }
    if (!newRole || typeof newRole !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The "role" argument is required and must be a string.'
        );
    }

    // 3. **Set the Custom Claim:**
    try {
        // Get the current claims for the target user (optional, but good practice
        // if you want to merge claims instead of overwriting)
        const user = await admin.auth().getUser(targetUid);
        const currentCustomClaims = user.customClaims || {};

        // Create the new set of claims, including the new role.
        // This example *overwrites* the 'role' claim. If you have multiple claims
        // and want to only update one, merge them:
        // const updatedClaims = { ...currentCustomClaims, role: newRole };
        const updatedClaims = { ...currentCustomClaims, role: newRole };


        await admin.auth().setCustomUserClaims(targetUid, updatedClaims);

        // It's important to force a refresh of the user's ID token on the client side
        // for the new claims to take effect immediately. We'll handle this on the client.
        // Forcing token refresh is done client-side after this call returns.

        return { message: `Successfully set role for user ${targetUid} to ${newRole}.` };

    } catch (error: any) {
        // Handle specific Firebase Auth errors, e.g., user not found
        if (error.code === 'auth/user-not-found') {
            throw new functions.https.HttpsError(
                'not-found',
                `User with UID ${targetUid} not found.`,
                error.message
            );
        }
        // Catch any other errors
        throw new functions.https.HttpsError(
            'internal',
            'Failed to set custom user role.',
            error.message
        );
    }
});
