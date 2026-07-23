# OC Kindergarten Development Plan

## Next: OpenClaw plugin beta.3 multi-Agent credentials

Status: prepared, not started. Start only after the production fix for the
stuck `syncing` state and missing reply bubble has passed final regression.

Goal: allow one OpenClaw Gateway to pair multiple Agents without one pairing
overwriting another Agent's scoped credential.

Preparation and acceptance scope:

1. Replace the plugin's single `token` setting with a credential store keyed by
   `provider + nativeAgentId` or stable binding identity.
2. Make `openclaw kindergarten pair --agent <id>` update only that Agent's
   credential and preserve every other paired Agent.
3. Resolve the correct credential from the lifecycle hook's Agent context; do
   not fall back to another Agent's scoped token.
4. Migrate the existing single-token beta.2 configuration without printing or
   reissuing secret values. Keep legacy/internal global-token compatibility
   isolated from external beta credentials.
5. Add automated coverage for two Agents on one Gateway: pairing order,
   Gateway restart persistence, credential rotation, archive/revoke isolation,
   restore/resume, and deletion of one Agent without affecting the other.
6. Publish a fixed beta tag, upgrade `pi-home`, then repeat production
   acceptance with disposable Agents and complete cleanup.

Release gate: until this scope passes, each Gateway may pair only one scoped
Agent. Existing multi-Agent Gateways must remain on the legacy/internal global
token and must not distribute that token to beta users.
