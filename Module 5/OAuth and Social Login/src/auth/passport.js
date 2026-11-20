'use strict';
// auth/passport.js — Google OAuth strategy

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    // Google's stable ID must be checked before email.
    const existingGoogleUser = users.find((user) => user.googleId === profile.id);
    if (existingGoogleUser) {
      return done(null, existingGoogleUser);
    }

    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const existingEmailUser = users.find((user) => user.email === email);

    if (existingEmailUser) {
      // Never link an existing local account using an unverified email.
      if (profile._json?.email_verified !== true) {
        return done(null, false);
      }

      existingEmailUser.googleId = profile.id;
      return done(null, existingEmailUser);
    }

    const newUser = {
      id: nextId(),
      googleId: profile.id,
      email,
      name: profile.displayName,
      role: 'member',
    };

    users.push(newUser);
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/auth/google/callback',
    },
    verifyCallback,
  ),
);

module.exports = { passport, verifyCallback };
