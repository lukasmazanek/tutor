# ADR-023: Answer Persistence with Supabase

**Date:** 2024-12-27
**Status:** Implemented (Phase 1 + Phase 2)
**Role:** Architect

## Context

Pro analýzu problémových oblastí a sledování pokroku potřebujeme ukládat odpovědi uživatelů.

## Decision

### 1. Storage: Supabase (Simplified)

- **Proč**: Centrální úložiště pro sledování pokroku
- **Zjednodušení**: Single-user setup, hardcoded `user_id = 'anezka'`
- **Bez autentizace**: Není potřeba login - appka prostě ukládá

### 2. Storage strategie: Direct to Supabase

```
Supabase configured? → Ano → Ukládá do Supabase
                     → Ne  → Fallback na localStorage
```

- Env vars určují zda použít Supabase
- Bez složité sync logiky
- Otec vidí pokrok v Supabase dashboardu

### 3. Data struktura: Maximum pro analýzu

```typescript
interface AttemptRecord {
  // Identifikace
  id: string                  // uuid
  user_id: string             // uuid - odkaz na uživatele
  session_id: string          // uuid - seskupení do sessions

  // Otázka (snapshot pro review)
  question_id: string         // "PYTH-C01"
  question_stem: string       // Text otázky
  correct_answer: string      // Správná odpověď
  topic: string               // "pythagorean" | "equations" | ...
  difficulty: number          // 1-3

  // Odpověď
  user_answer: string         // Co zadal uživatel
  is_correct: boolean         // Správně/špatně
  mode: string                // "numeric" | "type_recognition" | "lightning"

  // Kontext pro analýzu
  hints_used: number          // Počet použitých hintek
  hints_shown: string[]       // Které hinty viděl
  time_spent_ms: number       // Čas na odpověď

  // Metadata
  created_at: string          // ISO timestamp
}
```

### 4. Supabase schema (Simplified)

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- hardcoded 'anezka'
  topic TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  problems_count INTEGER DEFAULT 0
);

-- Attempts table
CREATE TABLE attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,  -- hardcoded 'anezka'
  session_id UUID REFERENCES sessions(id),
  question_id TEXT NOT NULL,
  question_stem TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  mode TEXT NOT NULL,
  hints_used INTEGER DEFAULT 0,
  hints_shown JSONB DEFAULT '[]',
  time_spent_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (allow all for single-user app)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON attempts FOR ALL USING (true);
```

Full schema: `lib/supabase/schema.sql`

## Implementation

### Phase 1: Local cache ✅
- `lib/storage/localStorage.ts` - localStorage provider
- `lib/storage/types.ts` - shared TypeScript types
- Fallback když Supabase není configured

### Phase 2: Supabase integration ✅ (2024-12-29)
- `lib/supabase/client.ts` - Supabase client (hardcoded USER_ID)
- `lib/storage/supabase.ts` - Supabase provider
- `lib/storage/index.ts` - auto-select provider based on config
- `lib/supabase/schema.sql` - database schema
- `app/.env.local` - credentials (not in git)

### Phase 3: Analytics views (TODO)
- Dashboard pro rodiče/tutora
- SQL queries pro analýzu v Supabase dashboard

## Affected Components

| Komponenta | Změna |
|------------|-------|
| `ProblemCard` | Volat saveAttempt() po odpovědi |
| `LightningRound` | Volat saveAttempt() po každé odpovědi |
| `TypeDrill` | Volat saveAttempt() po type+strategy |
| `App.tsx` | Session management, sync trigger |
| Nový: `lib/supabase.ts` | Supabase client |
| Nový: `hooks/useAttempts.ts` | Cache + sync logic |

## Psychological Safety

- **Žádné skóre v UI** - data jsou pro analýzu, ne pro zobrazení studentovi
- **"Závod sama se sebou"** - porovnání s vlastními předchozími výsledky
- **Export pro tutora** - rodič/tutor vidí pokrok, student nevidí "známky"

## Consequences

**Positive:**
- Kompletní data pro analýzu problémových oblastí
- Otec vidí pokrok v Supabase dashboardu
- Anežka nic nepozná - prostě cvičí
- Jednoduchá implementace bez auth komplexity

**Negative:**
- Závislost na externím service (Supabase)
- Single-user only (hardcoded user_id)
- Credentials v env vars (musí být při buildu)

## Resolved Questions

1. ~~Auth flow~~ → Bez auth, hardcoded user_id = 'anezka'
2. ~~Multi-user~~ → Single-user pro teď, rozšířitelné později
3. Dashboard → Supabase Table Editor + SQL queries

## Related

- [ADR-014](ADR-014-unified-content-format.md) - Question format (question_id, topic)
- [ADR-022](ADR-022-multi-mode-questions.md) - Modes (numeric, type_recognition)
- [PDR-001](PDR-001-psychological-safety-review.md) - No scores in UI
