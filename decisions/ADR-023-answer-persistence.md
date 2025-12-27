# ADR-023: Answer Persistence with Supabase

**Date:** 2024-12-27
**Status:** Accepted
**Role:** Architect

## Context

Pro analýzu problémových oblastí a sledování pokroku potřebujeme ukládat odpovědi uživatelů. Aplikace bude v budoucnu podporovat více uživatelů, což vyžaduje centrální úložiště.

## Decision

### 1. Storage: Supabase

- **Proč**: Multi-user podpora, synchronizace, free tier (50k MAU, 500MB)
- **Alternativy zamítnuty**:
  - localStorage only - bez multi-user
  - Custom backend - zbytečná komplexita

### 2. Sync strategie: Local-first + batch sync

```
Uživatel odpovídá → localStorage cache → Konec session → Supabase sync
```

- Chrání před ztrátou dat (zavření prohlížeče)
- Šetří API quota
- Offline-first přístup

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

### 4. Supabase schema

```sql
-- Users table (Supabase Auth handles this)

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  topic VARCHAR(50),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  problems_count INTEGER DEFAULT 0
);

-- Attempts table
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID REFERENCES sessions(id),

  -- Question snapshot
  question_id VARCHAR(50) NOT NULL,
  question_stem TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  topic VARCHAR(50) NOT NULL,
  difficulty SMALLINT DEFAULT 1,

  -- Answer
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  mode VARCHAR(20) NOT NULL,

  -- Analysis context
  hints_used SMALLINT DEFAULT 0,
  hints_shown TEXT[] DEFAULT '{}',
  time_spent_ms INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_question_id ON attempts(question_id);
CREATE INDEX idx_attempts_topic ON attempts(topic);
CREATE INDEX idx_attempts_created_at ON attempts(created_at);

-- RLS policies
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Implementation

### Phase 1: Local cache (bez Supabase)
1. Přidat `useAttemptCache` hook
2. Ukládat do localStorage při každé odpovědi
3. Rozšířit existující `saveSession()` v App.tsx

### Phase 2: Supabase integration
1. Setup Supabase projekt
2. Vytvořit schema (SQL výše)
3. Přidat `@supabase/supabase-js`
4. Implementovat sync service
5. Auth flow (magic link nebo OAuth)

### Phase 3: Analytics views
1. Dashboard pro rodiče/tutora
2. Problémové oblasti (vysoké hints_used, nízké is_correct)
3. Časová analýza (pomalé odpovědi = nejistota)

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
- Multi-user ready
- Offline-first (žádná ztráta dat)
- Synchronizace napříč zařízeními

**Negative:**
- Závislost na externím service (Supabase)
- Nutnost řešit auth
- GDPR considerations (data dítěte)

## Open Questions

1. Auth flow - magic link vs OAuth vs parent-managed accounts?
2. Data retention - jak dlouho uchovávat?
3. Export format - JSON vs CSV pro analýzu?

## Related

- [ADR-014](ADR-014-unified-content-format.md) - Question format (question_id, topic)
- [ADR-022](ADR-022-multi-mode-questions.md) - Modes (numeric, type_recognition)
- [PDR-001](PDR-001-psychological-safety-review.md) - No scores in UI
