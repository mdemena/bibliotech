#!/usr/bin/env node
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("# Añade estas variables a .env.local (Vercel: project settings):");
console.log(`VAPID_PUBLIC_KEY=${keys.public}`);
console.log(`VAPID_PRIVATE_KEY=${keys.private}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.public}`);
