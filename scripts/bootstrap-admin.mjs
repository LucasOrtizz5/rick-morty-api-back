import process from 'node:process';

const args = process.argv.slice(2);

const apiUrl = args[0] ?? process.env.API_URL ?? 'http://localhost:3000';
const email = args[1] ?? process.env.ADMIN_EMAIL ?? 'admin@gmail.com';
const bootstrapSecret = args[2] ?? process.env.BOOTSTRAP_ADMIN_SECRET;

if (!bootstrapSecret) {
  console.error('Missing bootstrap secret. Set BOOTSTRAP_ADMIN_SECRET in .env or pass it as the third argument.');
  console.error('Usage: npm run bootstrap:admin -- [apiUrl] [email] [bootstrapSecret]');
  process.exit(1);
}

const endpoint = `${apiUrl}/auth/bootstrap-admin`;

try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bootstrap-secret': bootstrapSecret,
    },
    body: JSON.stringify({ email }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Bootstrap admin request failed.');
    console.error(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  console.log('Bootstrap admin completed successfully.');
  console.log(JSON.stringify(payload, null, 2));
} catch (error) {
  console.error('Could not reach backend endpoint.');
  console.error(error);
  process.exit(1);
}
