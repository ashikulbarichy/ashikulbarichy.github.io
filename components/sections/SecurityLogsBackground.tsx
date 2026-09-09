'use client'

import { useState, useEffect } from 'react';

const SECURITY_LOGS = [
  'SEC_KERN: Initializing security kernel...',
  'FIREWALL: [PASS] Inbound TLS traffic on port 443 allowed',
  'IPS: Active inspection enabled on interface eth0',
  'SHIELD: Buffer overflow protection active (ASLR enabled)',
  'KEY_EXCH: ECDH key exchange completed successfully',
  'INTEGRITY: Verification hash matching SHA-256 signatures: OK',
  'HONEYPOT: Port 22 decoy container spawned',
  'VAULT: Access granted to secrets manager (token verified)',
  'AUDIT: Log rotation daemon verified and running',
  'IDS: Threat level nominal (0 active alerts)',
  'MALWARE_SCAN: Static heuristic engine initialized',
  'NET: Scanning subnets for rogue network devices...',
  "CERT: Let's Encrypt SSL certificate auto-renew verified",
  'POLICY: Access Control List loaded (127 rules)',
  'ENTROPY: System entropy pool gathered: 4096 bits',
  'DNS_SEC: DNSSEC validation active for all resolver queries',
  'ROOT: Rootkit detector scan completed (0 warnings)',
  'SANDBOX: Secure execution chamber initialized',
  'IP_BAN: Blackhole routing enabled for known bad actors',
  'TELEMETRY: Secure log pipeline connected to backup vault',
];

/**
 * SecurityLogsBackground
 *
 * Renders a scrolling stream of fake security log lines as a decorative
 * background element in the Hero section left column.
 * Entirely presentational — pointer-events are disabled.
 */
const SecurityLogsBackground = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Seed with 25 past-timestamped entries so the column looks populated immediately
    const initialLogs: string[] = [];
    for (let i = 0; i < 25; i++) {
      const template  = SECURITY_LOGS[Math.floor(Math.random() * SECURITY_LOGS.length)];
      const timestamp = new Date(Date.now() - (25 - i) * 2000).toLocaleTimeString();
      initialLogs.push(`[${timestamp}] ${template}`);
    }
    setLogs(initialLogs);

    // Push a new log every 2 seconds, evicting the oldest to keep length stable
    const interval = setInterval(() => {
      const template  = SECURITY_LOGS[Math.floor(Math.random() * SECURITY_LOGS.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev.slice(1), `[${timestamp}] ${template}`]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.05] sm:opacity-[0.07] font-mono text-[9px] sm:text-[10px] leading-relaxed p-6 select-none z-0"
    >
      <div className="flex flex-col gap-1 justify-end h-full">
        {logs.map((log, index) => (
          <div key={index} className="truncate whitespace-nowrap text-emerald-500">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityLogsBackground;
