require('dotenv').config();
const localDriver = require('../models/localDriver');
const firebaseDriver = require('../models/firebaseDriver');
const supabaseDriver = require('../models/supabaseDriver');

let dbDriver;

if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  console.log('Database Config: Connecting with Supabase Driver');
  dbDriver = supabaseDriver;
} else if (process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.log('Database Config: Connecting with Firebase Firestore Driver');
  dbDriver = firebaseDriver;
} else {
  console.log('Database Config: Connecting with Local JSON DB Fallback (data/db.json)');
  dbDriver = localDriver;
}

module.exports = dbDriver;
