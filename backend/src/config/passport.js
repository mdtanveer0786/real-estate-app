'use strict';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Google OAuth 2.0 Strategy.
 *
 * Environment variables required:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_CALLBACK_URL  (defaults to /api/auth/google/callback)
 */
const setupGoogleStrategy = () => {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
        console.warn('⚠️  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.');
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL:
                    process.env.GOOGLE_CALLBACK_URL ||
                    '/api/auth/google/callback',
                proxy: true, // Fix for redirect URI mismatch on proxy/Render securely
                scope: ['profile', 'email'],
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) return done(new Error('No email found in Google profile'), null);

                    // Check if user already exists by googleId or email
                    let user = await User.findOne({
                        $or: [{ googleId: profile.id }, { email }],
                    });

                    if (user) {
                        // Link Google account if not already linked
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            user.isVerified = true;
                            if (!user.avatar && profile.photos?.[0]?.value) {
                                user.avatar = profile.photos[0].value;
                            }
                            await user.save({ validateBeforeSave: false });
                        }
                    } else {
                        // Create new user from Google profile
                        user = await User.create({
                            name: profile.displayName,
                            email,
                            googleId: profile.id,
                            avatar: profile.photos?.[0]?.value || '',
                            isVerified: true, // Google emails are already verified
                            password: undefined, // No password for OAuth users
                        });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );

    // Serialize/deserialize for session support (not typically needed with JWT)
    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};

module.exports = { setupGoogleStrategy };
