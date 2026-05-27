import { supabase } from '../lib/supabase';
import type { DecisionEntry } from '../data/types';

/**
 * Database row type for the journal_entries table (snake_case columns).
 */
interface DatabaseJournalEntry {
  id: string;
  user_id: string;
  date: string;
  ticker: string;
  company_name: string;
  decision: 'BUY' | 'PASS' | 'WATCHLIST';
  position_size_percent: number;
  position_size_amount: number;
  entry_price_target: number;
  current_price: number;
  reasoning: string;
  expected_outcome: string;
  exit_plan: string;
  review_dates: string[];
  scores: {
    buffett: number;
    munger: number;
    lynch: number;
    rothschild: number;
    overall: number;
  };
  alerts_set: string[];
  status: 'active' | 'closed';
  actual_outcome: string;
  lessons_learned: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database row (snake_case) to a client DecisionEntry (camelCase).
 */
export function toClientEntry(row: DatabaseJournalEntry): DecisionEntry {
  return {
    id: row.id,
    date: row.date,
    ticker: row.ticker,
    companyName: row.company_name,
    decision: row.decision,
    positionSizePercent: Number(row.position_size_percent),
    positionSizeAmount: Number(row.position_size_amount),
    entryPriceTarget: Number(row.entry_price_target),
    currentPrice: Number(row.current_price),
    reasoning: row.reasoning,
    expectedOutcome: row.expected_outcome,
    exitPlan: row.exit_plan,
    reviewDates: row.review_dates,
    scores: row.scores,
    alertsSet: row.alerts_set,
    status: row.status,
    actualOutcome: row.actual_outcome,
    lessonsLearned: row.lessons_learned,
  };
}

/**
 * Maps a client DecisionEntry (camelCase) to database columns (snake_case).
 * Excludes id, user_id, created_at, updated_at which are managed by the database.
 */
export function toDatabaseEntry(
  entry: Omit<DecisionEntry, 'id'>
): Omit<DatabaseJournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    date: entry.date,
    ticker: entry.ticker,
    company_name: entry.companyName,
    decision: entry.decision,
    position_size_percent: entry.positionSizePercent,
    position_size_amount: entry.positionSizeAmount,
    entry_price_target: entry.entryPriceTarget,
    current_price: entry.currentPrice,
    reasoning: entry.reasoning,
    expected_outcome: entry.expectedOutcome,
    exit_plan: entry.exitPlan,
    review_dates: entry.reviewDates,
    scores: entry.scores,
    alerts_set: entry.alertsSet,
    status: entry.status,
    actual_outcome: entry.actualOutcome,
    lessons_learned: entry.lessonsLearned,
  };
}

/**
 * Maps partial client updates (camelCase) to partial database columns (snake_case).
 */
function toPartialDatabaseEntry(
  updates: Partial<DecisionEntry>
): Record<string, unknown> {
  const mapping: Record<string, unknown> = {};

  if (updates.date !== undefined) mapping.date = updates.date;
  if (updates.ticker !== undefined) mapping.ticker = updates.ticker;
  if (updates.companyName !== undefined) mapping.company_name = updates.companyName;
  if (updates.decision !== undefined) mapping.decision = updates.decision;
  if (updates.positionSizePercent !== undefined) mapping.position_size_percent = updates.positionSizePercent;
  if (updates.positionSizeAmount !== undefined) mapping.position_size_amount = updates.positionSizeAmount;
  if (updates.entryPriceTarget !== undefined) mapping.entry_price_target = updates.entryPriceTarget;
  if (updates.currentPrice !== undefined) mapping.current_price = updates.currentPrice;
  if (updates.reasoning !== undefined) mapping.reasoning = updates.reasoning;
  if (updates.expectedOutcome !== undefined) mapping.expected_outcome = updates.expectedOutcome;
  if (updates.exitPlan !== undefined) mapping.exit_plan = updates.exitPlan;
  if (updates.reviewDates !== undefined) mapping.review_dates = updates.reviewDates;
  if (updates.scores !== undefined) mapping.scores = updates.scores;
  if (updates.alertsSet !== undefined) mapping.alerts_set = updates.alertsSet;
  if (updates.status !== undefined) mapping.status = updates.status;
  if (updates.actualOutcome !== undefined) mapping.actual_outcome = updates.actualOutcome;
  if (updates.lessonsLearned !== undefined) mapping.lessons_learned = updates.lessonsLearned;

  return mapping;
}

/**
 * Retrieves all journal entries for the current authenticated user.
 * Entries are ordered by date descending (newest first).
 */
export async function getJournalEntries(): Promise<DecisionEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data as DatabaseJournalEntry[]).map(toClientEntry);
}

/**
 * Creates a new journal entry for the current authenticated user.
 */
export async function createJournalEntry(
  entry: Omit<DecisionEntry, 'id'>,
  userId: string
): Promise<DecisionEntry> {
  const dbEntry = toDatabaseEntry(entry);

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ ...dbEntry, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return toClientEntry(data as DatabaseJournalEntry);
}

/**
 * Updates an existing journal entry by ID.
 */
export async function updateJournalEntry(
  id: string,
  updates: Partial<DecisionEntry>
): Promise<DecisionEntry> {
  const dbUpdates = toPartialDatabaseEntry(updates);

  const { data, error } = await supabase
    .from('journal_entries')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toClientEntry(data as DatabaseJournalEntry);
}

/**
 * Deletes a journal entry by ID.
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
