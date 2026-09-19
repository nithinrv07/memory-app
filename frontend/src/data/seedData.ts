import { DocumentRecord, GraphEdge, GraphNode } from '../types.js';

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'ADR-042',
    title: 'ADR-042: Migration from MongoDB to PostgreSQL 16',
    type: 'ADR',
    author: 'Sarah Chen (Principal Data Architect)',
    approver: 'Marcus Vance (VP Engineering)',
    date: '2024-03-12',
    status: 'APPROVED',
    summary: 'Replaced MongoDB replica sets with PostgreSQL 16 to support multi-table ACID transactions in the billing ledger, eliminate eventual consistency race conditions, and leverage native JSONB query performance.',
    content: `# ADR-042: Migration from MongoDB to PostgreSQL 16
Status: APPROVED
Date: 2024-03-12
Author: Sarah Chen (Principal Data Architect)
Approver: Marcus Vance (VP Engineering)

## Context & Problem Statement
Our core transactional billing and ledger system previously operated on MongoDB 4.2. Over the last three quarters, transaction volume scaled 8x to 14,000 writes/sec. The lack of multi-document ACID transactions across shards caused ledger inconsistencies (documented in INCIDENT-309). Additionally, MongoDB Enterprise licensing renewals represented a 140% cost increase.

## Decision
We decided to migrate the core billing ledger, subscription states, and account ledgers from MongoDB to PostgreSQL 16 managed on Google Cloud SQL.
- Primary Storage: PostgreSQL 16 with pg_stat_statements and Read Replicas.
- Semi-structured data: Persisted in PostgreSQL JSONB with GIN indexing, providing equivalent document-store flexibility with relational integrity.
- Zero-Downtime Pipeline: Debezium CDC (Change Data Capture) with dual-write reconciliation for 14 days before final cutover.

## Consequences & Trade-offs
- Positive: Guaranteed ACID transactions with zero ledger race conditions. 42% decrease in monthly database infrastructure costs.
- Positive: Native foreign key constraints eliminate dangling invoice records.
- Negative: Required rewriting 28 Mongoose ODM repository classes into Drizzle ORM and raw SQL query builders.
- Mitigated: Sharding will eventually be required once single-instance storage exceeds 4TB (projected 2027).`,
    tags: ['database', 'postgres', 'mongodb', 'acid', 'billing', 'cloud-sql']
  },
  {
    id: 'ADR-058',
    title: 'ADR-058: Deprecation of Session Cookies in favor of Asymmetric JWT (RS256)',
    type: 'ADR',
    author: 'Alex Rivera (Principal Security Architect)',
    approver: 'Lisa Gomez (CISO)',
    date: '2024-05-18',
    status: 'APPROVED',
    summary: 'Deprecated centralized Redis session cookies in favor of stateless RS256 signed JSON Web Tokens with Envoy API Gateway local verification and a Bloom filter revocation list.',
    content: `# ADR-058: Deprecation of Session Cookies in favor of Asymmetric JWT (RS256)
Status: APPROVED
Date: 2024-05-18
Author: Alex Rivera (Principal Security Architect)
Approver: Lisa Gomez (CISO)

## Context & Problem Statement
Prior to this decision, all microservices validated user sessions by querying a centralized Redis cluster in us-east-1. As services expanded to eu-central-1 and ap-southeast-1, cross-region latency on every HTTP request added 85ms-120ms to p99 latency. During the Redis failover of April 2024, all global authentication halted.

## Decision
We decided to deprecate server-side stateful session cookies and adopt short-lived (15 minutes) asymmetric JWTs signed with RSA-256 (RS256) private keys via Cloud KMS.
- Token Verification: Executed locally in microseconds by Envoy Gateway sidecars using the public JWKS endpoint.
- Revocation: Redis is utilized strictly for a high-performance Bloom filter storing revoked JTI (JWT IDs) during logout or security breaches.
- Refresh Tokens: Rotating refresh tokens stored in HTTP-only, SameSite=Strict cookies with client fingerprint hashing.

## Consequences & Trade-offs
- Positive: Reduced internal microservice p99 latency from 110ms to 2.4ms per authenticated hop.
- Positive: Total resilience against cross-region network partitions; auth verification continues offline.
- Negative: Revocation is not instantaneous (up to 15s sync delay on Bloom filter propagation).`,
    tags: ['security', 'auth', 'jwt', 'envoy', 'redis', 'rs256']
  },
  {
    id: 'ADR-071',
    title: 'ADR-071: Event Bus Standardization: Apache Kafka over RabbitMQ',
    type: 'ADR',
    author: 'Dev Patel (Staff Infrastructure Engineer)',
    approver: 'Marcus Vance (VP Engineering)',
    date: '2024-07-02',
    status: 'APPROVED',
    summary: 'Standardized the organization on Apache Kafka (Strimzi operator on Kubernetes) for asynchronous event distribution, superseding RabbitMQ to gain 7-day replay capabilities and handle 150k msg/sec telemetry streams.',
    content: `# ADR-071: Event Bus Standardization: Apache Kafka over RabbitMQ
Status: APPROVED
Date: 2024-07-02
Author: Dev Patel (Staff Infrastructure Engineer)
Approver: Marcus Vance (VP Engineering)

## Context & Problem Statement
The platform operated two distinct message brokers: RabbitMQ for task queues and an ad-hoc Redis Pub/Sub for notifications. As real-time analytics and audit logging requirements grew, RabbitMQ suffered queue backpressure and lacked event replay capabilities when downstream consumer services crashed.

## Decision
We decided to standardize all asynchronous communication and event-driven architectures on Apache Kafka.
- Event Log Retention: Configured for 7 days across tiered storage, enabling zero-loss replay for recovery or new service backfills.
- Serialization: Protocol Buffers (Protobuf) with Confluent Schema Registry enforcement.
- Deployment: Strimzi Kafka Operator on Google Kubernetes Engine (GKE) across 3 availability zones.

## Consequences & Trade-offs
- Positive: Consumer services can replay events from arbitrary offsets during incident remediation.
- Positive: Sustained throughput of 150,000 events/sec with sub-10ms producer latencies.
- Negative: Higher operational complexity compared to RabbitMQ; requires ZooKeeper-less KRaft quorum management and partition monitoring.`,
    tags: ['event-bus', 'kafka', 'rabbitmq', 'streaming', 'architecture']
  },
  {
    id: 'POSTMORTEM-2024-Q3',
    title: 'POSTMORTEM-2024-Q3: Payment Service Cascading Timeout Incident',
    type: 'POSTMORTEM',
    author: 'Site Reliability Team (Lead: David Kim)',
    approver: 'Sarah Chen & Marcus Vance',
    date: '2024-08-14',
    status: 'RESOLVED',
    summary: 'Root cause analysis of the 47-minute payment gateway outage caused by unbounded database connection pooling and lack of circuit breakers during Stripe API degradation.',
    content: `# POSTMORTEM-2024-Q3: Payment Service Cascading Timeout Incident
Status: RESOLVED
Date: 2024-08-14
Incident Lead: David Kim (Staff SRE)
Sign-off: Sarah Chen, Marcus Vance

## Summary
On August 14, 2024 at 14:22 UTC, third-party payment partner Stripe experienced elevated response latencies (average 8.2s). Because our checkout service lacked circuit breaking and had an unbounded database connection pool timeout (60s), all 200 HTTP worker threads stalled waiting on outgoing sockets. This saturated the PostgreSQL connection pool (max_connections=500), cascading failures to auth and order processing services. Total downtime: 47 minutes.

## Root Causes
1. Missing Circuit Breaker: Outgoing Stripe API calls lacked fault isolation or adaptive throttling.
2. Connection Pool Starvation: Worker threads held PostgreSQL connections while waiting for external HTTP responses.
3. Health Check Cascading: Readiness probes failed because DB connections timed out, causing Kubernetes to terminate healthy pods.

## Action Items & Lineage Changes
1. Immediate: Introduced Resilience4j circuit breakers with 2.5s hard timeout on payment gateways (PR-1182).
2. Architectural Change: Decoupled database transactions from external HTTP requests; db transactions now commit before third-party calls or use outbox patterns (Motivated ADR-078).
3. Capped PostgreSQL connection pool at 40 per replica with PgBouncer connection multiplexing.`,
    tags: ['incident', 'outage', 'resilience', 'postgres', 'circuit-breaker', 'sre']
  },
  {
    id: 'ADR-089',
    title: 'ADR-089: Adoption of gRPC for Inter-Service Microservice RPCs',
    type: 'ADR',
    author: 'Elena Rostova (Systems Architect)',
    approver: 'Marcus Vance (VP Engineering)',
    date: '2024-09-30',
    status: 'APPROVED',
    summary: 'Transitioned internal East-West microservice communication from REST/JSON over HTTP/1.1 to gRPC over HTTP/2 with strongly typed Protocol Buffers.',
    content: `# ADR-089: Adoption of gRPC for Inter-Service Microservice RPCs
Status: APPROVED
Date: 2024-09-30
Author: Elena Rostova (Systems Architect)
Approver: Marcus Vance (VP Engineering)

## Context & Problem Statement
With 64 microservices communicating over JSON/REST, CPU profiling revealed 34% of service compute cycles were consumed purely by JSON string serialization and deserialization. Additionally, unversioned API payload drift caused 5 runtime production crashes in Q2.

## Decision
We decided to standardize all internal service-to-service communication on gRPC with Protocol Buffers v3.
- Contract-First Development: All RPC interfaces defined in central \`buf.build\` schema registry with automated TypeScript and Go SDK generation.
- Transport: HTTP/2 multiplexing, eliminating TCP handshake overhead between persistent service mesh pods.

## Consequences & Trade-offs
- Positive: 34% reduction in microservice cluster CPU utilization. Network egress payloads decreased by 61%.
- Positive: Compile-time type safety prevents breaking schema changes before deployment.
- Negative: Browser clients cannot call gRPC directly without gRPC-Web proxy or Envoy transcoding.`,
    tags: ['grpc', 'protobuf', 'microservices', 'performance', 'rpc']
  },
  {
    id: 'ADR-095',
    title: 'ADR-095: Storage Tiering & Cloud Storage Glacier for SOC-2 Audit Records',
    type: 'ADR',
    author: 'Jordan Lee (Compliance & Security Lead)',
    approver: 'Lisa Gomez (CISO)',
    date: '2024-11-10',
    status: 'APPROVED',
    summary: 'Implemented automated lifecycle tiering moving audit logs older than 90 days from standard Cloud Storage to Archive / Glacier storage with WORM (Write Once Read Many) immutability.',
    content: `# ADR-095: Storage Tiering & Cloud Storage Glacier for SOC-2 Audit Records
Status: APPROVED
Date: 2024-11-10
Author: Jordan Lee (Compliance & Security Lead)
Approver: Lisa Gomez (CISO)

## Context & Problem Statement
To satisfy SOC-2 Type II and HIPAA compliance requirements, all financial audit trails and authentication access logs must be retained for 7 years. Retaining 140TB of logs in Hot Cloud Storage resulted in $3,200/mo unnecessary expenditures.

## Decision
We decided to implement automated GCS Bucket Object Lifecycle policies:
- Hot Tier (Standard): 0 to 90 days for active security investigation and SIEM ingestion.
- Archive Tier (Coldline/Archive): Day 91 to 7 Years with Object Retention Locks (WORM compliance) to guarantee tamper-proof audit trails.

## Consequences & Trade-offs
- Positive: Reduced compliance log storage costs by 87% ($2,780/mo recurring savings). Full compliance with SOC-2 Section CC6.8.
- Negative: Retrieval of archived logs requires a 3-5 hour batch restore time.`,
    tags: ['compliance', 'soc2', 'storage', 'audit-logs', 'security']
  }
];

export const INITIAL_NODES: GraphNode[] = [
  // Documents
  {
    id: 'doc-adr-042',
    type: 'document',
    label: 'ADR-042: MongoDB to Postgres',
    subtitle: 'Architectural Decision Record',
    metadata: {
      status: 'APPROVED',
      date: '2024-03-12',
      author: 'Sarah Chen',
      approver: 'Marcus Vance',
      docId: 'ADR-042',
      category: 'Database Architecture',
      details: 'Migrated billing ledger from MongoDB to PostgreSQL 16 to guarantee ACID compliance.'
    },
    position: { x: 320, y: 180 }
  },
  {
    id: 'doc-adr-058',
    type: 'document',
    label: 'ADR-058: RS256 JWT Auth',
    subtitle: 'Architectural Decision Record',
    metadata: {
      status: 'APPROVED',
      date: '2024-05-18',
      author: 'Alex Rivera',
      approver: 'Lisa Gomez',
      docId: 'ADR-058',
      category: 'Security & Auth',
      details: 'Replaced Redis cookies with stateless asymmetric JWTs verified by Envoy sidecars.'
    },
    position: { x: 320, y: 380 }
  },
  {
    id: 'doc-adr-071',
    type: 'document',
    label: 'ADR-071: Kafka Event Bus',
    subtitle: 'Architectural Decision Record',
    metadata: {
      status: 'APPROVED',
      date: '2024-07-02',
      author: 'Dev Patel',
      approver: 'Marcus Vance',
      docId: 'ADR-071',
      category: 'Messaging & Streaming',
      details: 'Standardized event bus on Kafka over RabbitMQ for 7-day replay and 150k msg/s.'
    },
    position: { x: 320, y: 580 }
  },
  {
    id: 'doc-postmortem-q3',
    type: 'document',
    label: 'Postmortem: Payment Outage',
    subtitle: 'Incident Root Cause Analysis',
    metadata: {
      status: 'RESOLVED',
      date: '2024-08-14',
      author: 'David Kim',
      approver: 'Sarah Chen',
      docId: 'POSTMORTEM-2024-Q3',
      category: 'Reliability & Resilience',
      details: 'Cascading payment timeouts due to unbounded DB connection pooling during Stripe lag.'
    },
    position: { x: 320, y: 780 }
  },
  {
    id: 'doc-adr-089',
    type: 'document',
    label: 'ADR-089: gRPC Microservices',
    subtitle: 'Architectural Decision Record',
    metadata: {
      status: 'APPROVED',
      date: '2024-09-30',
      author: 'Elena Rostova',
      approver: 'Marcus Vance',
      docId: 'ADR-089',
      category: 'Service Mesh',
      details: 'Adopted gRPC with Protobuf, slashing internal CPU usage by 34%.'
    },
    position: { x: 320, y: 980 }
  },

  // Decisions
  {
    id: 'dec-acid-ledger',
    type: 'decision',
    label: 'Enforce ACID on Billing',
    subtitle: 'Status: APPROVED',
    metadata: {
      status: 'APPROVED',
      date: '2024-03-12',
      docId: 'ADR-042',
      category: 'Data Integrity',
      details: 'Prevent invoice race conditions and financial discrepancy during scale.'
    },
    position: { x: 680, y: 150 }
  },
  {
    id: 'dec-jwt-stateless',
    type: 'decision',
    label: 'Stateless Edge Auth',
    subtitle: 'Status: APPROVED',
    metadata: {
      status: 'APPROVED',
      date: '2024-05-18',
      docId: 'ADR-058',
      category: 'Security Architecture',
      details: 'RS256 asymmetric keys verified locally in Envoy without Redis network hop.'
    },
    position: { x: 680, y: 350 }
  },
  {
    id: 'dec-7day-replay',
    type: 'decision',
    label: '7-Day Event Sourcing Replay',
    subtitle: 'Status: APPROVED',
    metadata: {
      status: 'APPROVED',
      date: '2024-07-02',
      docId: 'ADR-071',
      category: 'Streaming',
      details: 'Permits re-indexing and disaster recovery across downstream consumers.'
    },
    position: { x: 680, y: 550 }
  },
  {
    id: 'dec-circuit-breaker',
    type: 'decision',
    label: 'Circuit Breaker Isolation',
    subtitle: 'Status: RESOLVED',
    metadata: {
      status: 'RESOLVED',
      date: '2024-08-15',
      docId: 'POSTMORTEM-2024-Q3',
      category: 'Resilience',
      details: 'Resilience4j circuit breakers + capped connection pool of 40 with PgBouncer.'
    },
    position: { x: 680, y: 750 }
  },

  // People
  {
    id: 'person-sarah-chen',
    type: 'person',
    label: 'Sarah Chen',
    subtitle: 'Principal Data Architect',
    metadata: {
      category: 'Architecture Staff',
      details: 'Lead architect for data pipelines, transaction isolation, and PostgreSQL migration.'
    },
    position: { x: 40, y: 160 }
  },
  {
    id: 'person-marcus-vance',
    type: 'person',
    label: 'Marcus Vance',
    subtitle: 'VP Engineering',
    metadata: {
      category: 'Executive Sign-off',
      details: 'Technical sign-off for infrastructure transitions and architectural roadmap.'
    },
    position: { x: 40, y: 460 }
  },
  {
    id: 'person-alex-rivera',
    type: 'person',
    label: 'Alex Rivera',
    subtitle: 'Principal Security Architect',
    metadata: {
      category: 'Security Lead',
      details: 'Designer of RS256 token verification and Envoy zero-trust security mesh.'
    },
    position: { x: 40, y: 330 }
  },
  {
    id: 'person-lisa-gomez',
    type: 'person',
    label: 'Lisa Gomez',
    subtitle: 'Chief Information Security Officer',
    metadata: {
      category: 'Executive Security',
      details: 'Authorized security compliance sign-off for token deprecation and SOC-2 policies.'
    },
    position: { x: 40, y: 640 }
  },

  // Systems / Tech
  {
    id: 'tech-mongodb',
    type: 'system',
    label: 'MongoDB 4.2 (Legacy)',
    subtitle: 'Deprecated in Q1 2024',
    metadata: {
      status: 'DEPRECATED',
      category: 'NoSQL Document Store',
      details: 'Former billing document store, suffered eventual consistency anomalies.'
    },
    position: { x: 1040, y: 100 }
  },
  {
    id: 'tech-postgres',
    type: 'system',
    label: 'PostgreSQL 16 (Cloud SQL)',
    subtitle: 'Current Core Ledger',
    metadata: {
      status: 'APPROVED',
      category: 'Relational ACID RDBMS',
      details: 'Primary transactional billing ledger with JSONB GIN indices.'
    },
    position: { x: 1040, y: 220 }
  },
  {
    id: 'tech-redis',
    type: 'system',
    label: 'Redis Session Cluster',
    subtitle: 'Scoped to Revocation Bloom Filter',
    metadata: {
      status: 'MIGRATED',
      category: 'In-Memory Cache',
      details: 'Central session store deprecated; now holds lightweight bloom filter for revoked tokens.'
    },
    position: { x: 1040, y: 360 }
  },
  {
    id: 'tech-envoy',
    type: 'system',
    label: 'Envoy API Gateway (RS256)',
    subtitle: 'Edge Token Verifier',
    metadata: {
      status: 'APPROVED',
      category: 'Service Mesh Ingress',
      details: 'Performs sub-millisecond cryptographic JWT validation at the ingress tier.'
    },
    position: { x: 1040, y: 480 }
  },
  {
    id: 'tech-kafka',
    type: 'system',
    label: 'Apache Kafka 3.6',
    subtitle: 'Organizational Event Bus',
    metadata: {
      status: 'APPROVED',
      category: 'Distributed Stream Log',
      details: 'Handles 150k msg/s with 7-day replay window on Strimzi Kubernetes operator.'
    },
    position: { x: 1040, y: 600 }
  },
  {
    id: 'tech-pgbouncer',
    type: 'system',
    label: 'PgBouncer Pooler',
    subtitle: 'PostgreSQL Multiplexer',
    metadata: {
      status: 'APPROVED',
      category: 'Connection Multiplexer',
      details: 'Prevents backend connection exhaustion by pooling socket descriptors.'
    },
    position: { x: 1040, y: 760 }
  },

  // Events / Incidents
  {
    id: 'evt-incident-309',
    type: 'event',
    label: 'INCIDENT-309: Ledger Inconsistency',
    subtitle: 'Jan 2024 Race Condition',
    metadata: {
      date: '2024-01-22',
      category: 'Production Incident',
      details: 'Concurrent write conflict in MongoDB caused $12,400 balance discrepancy.'
    },
    position: { x: 680, y: 40 }
  },
  {
    id: 'evt-outage-q3',
    type: 'event',
    label: 'INCIDENT-891: Stripe Cascading Outage',
    subtitle: 'Aug 2024 47-Min Downtime',
    metadata: {
      date: '2024-08-14',
      category: 'Production Incident',
      details: 'Slow external partner socket holds consumed entire 500 DB connection pool.'
    },
    position: { x: 680, y: 880 }
  }
];

export const INITIAL_EDGES: GraphEdge[] = [
  // Document Authors & Approvers
  {
    id: 'e1',
    source: 'doc-adr-042',
    target: 'person-sarah-chen',
    label: 'Authored By',
    relationType: 'AUTHORED_BY'
  },
  {
    id: 'e2',
    source: 'doc-adr-042',
    target: 'person-marcus-vance',
    label: 'Approved By',
    relationType: 'APPROVED_BY'
  },
  {
    id: 'e3',
    source: 'doc-adr-058',
    target: 'person-alex-rivera',
    label: 'Authored By',
    relationType: 'AUTHORED_BY'
  },
  {
    id: 'e4',
    source: 'doc-adr-058',
    target: 'person-lisa-gomez',
    label: 'Approved By',
    relationType: 'APPROVED_BY'
  },
  {
    id: 'e5',
    source: 'doc-adr-071',
    target: 'person-marcus-vance',
    label: 'Approved By',
    relationType: 'APPROVED_BY'
  },

  // Document Contains Decisions
  {
    id: 'e6',
    source: 'doc-adr-042',
    target: 'dec-acid-ledger',
    label: 'Contains Decision',
    relationType: 'CONTAINS_DECISION'
  },
  {
    id: 'e7',
    source: 'doc-adr-058',
    target: 'dec-jwt-stateless',
    label: 'Contains Decision',
    relationType: 'CONTAINS_DECISION'
  },
  {
    id: 'e8',
    source: 'doc-adr-071',
    target: 'dec-7day-replay',
    label: 'Contains Decision',
    relationType: 'CONTAINS_DECISION'
  },
  {
    id: 'e9',
    source: 'doc-postmortem-q3',
    target: 'dec-circuit-breaker',
    label: 'Mandates Action',
    relationType: 'RESOLVED_BY'
  },

  // Decisions -> Tech & Migration Lineage
  {
    id: 'e10',
    source: 'dec-acid-ledger',
    target: 'tech-mongodb',
    label: 'Migrated From',
    relationType: 'MIGRATED_FROM'
  },
  {
    id: 'e11',
    source: 'dec-acid-ledger',
    target: 'tech-postgres',
    label: 'Migrated To',
    relationType: 'MIGRATED_TO'
  },
  {
    id: 'e12',
    source: 'dec-jwt-stateless',
    target: 'tech-redis',
    label: 'Deprecated Central Store',
    relationType: 'DEPRECATED'
  },
  {
    id: 'e13',
    source: 'dec-jwt-stateless',
    target: 'tech-envoy',
    label: 'Enforces Via',
    relationType: 'AFFECTS'
  },
  {
    id: 'e14',
    source: 'dec-7day-replay',
    target: 'tech-kafka',
    label: 'Adopted System',
    relationType: 'AFFECTS'
  },
  {
    id: 'e15',
    source: 'dec-circuit-breaker',
    target: 'tech-pgbouncer',
    label: 'Multiplexes via',
    relationType: 'AFFECTS'
  },

  // Decisions Motivated By Incidents
  {
    id: 'e16',
    source: 'dec-acid-ledger',
    target: 'evt-incident-309',
    label: 'Triggered By Incident',
    relationType: 'MOTIVATED_BY'
  },
  {
    id: 'e17',
    source: 'dec-circuit-breaker',
    target: 'evt-outage-q3',
    label: 'Remediates Outage',
    relationType: 'MOTIVATED_BY'
  }
];
