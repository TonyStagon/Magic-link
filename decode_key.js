const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2c2dlcmd3a3pqcW9ncG1zcGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyMjIsImV4cCI6MjA3OTYzMzIyMn0.MJ4kOamgtl8DJytVEnXhiLgluemAuQUzQnhrVY6DcA0';

function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT');
    }
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(decoded);
}

try {
    const payload = decodeJWT(anonKey);
    console.log('JWT payload:', payload);
    console.log('Project ref:', payload.ref);
    console.log('Issuer:', payload.iss);
} catch (err) {
    console.error(err);
}