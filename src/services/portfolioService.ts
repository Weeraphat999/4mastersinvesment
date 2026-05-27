import { supabase } from '../lib/supabase';
import type { PortfolioHolding } from '../data/types';

/**
 * Database row shape for the holdings table (snake_case columns).
 */
interface DatabaseHolding {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string;
  shares: number;
  avg_cost: number;
  current_price: number;
  purchase_date: string;
  category: string;
  risk_level: 'low' | 'medium' | 'high';
  notes: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database row (snake_case) to a client-side PortfolioHolding (camelCase).
 */
export function toClientHolding(row: DatabaseHolding): PortfolioHolding {
  return {
    id: row.id,
    ticker: row.ticker,
    companyName: row.company_name,
    shares: Number(row.shares),
    avgCost: Number(row.avg_cost),
    currentPrice: Number(row.current_price),
    purchaseDate: row.purchase_date,
    category: row.category,
    riskLevel: row.risk_level,
    notes: row.notes,
  };
}

/**
 * Maps a client-side PortfolioHolding (camelCase) to database columns (snake_case).
 * Excludes id, user_id, created_at, and updated_at which are managed by the database.
 */
export function toDatabaseHolding(
  holding: Omit<PortfolioHolding, 'id'>
): Omit<DatabaseHolding, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    ticker: holding.ticker,
    company_name: holding.companyName,
    shares: holding.shares,
    avg_cost: holding.avgCost,
    current_price: holding.currentPrice,
    purchase_date: holding.purchaseDate,
    category: holding.category,
    risk_level: holding.riskLevel,
    notes: holding.notes,
  };
}

/**
 * Retrieves all holdings for the current authenticated user.
 * RLS ensures only the user's own holdings are returned.
 */
export async function getHoldings(): Promise<PortfolioHolding[]> {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DatabaseHolding[]).map(toClientHolding);
}

/**
 * Adds a new holding for the current authenticated user.
 */
export async function addHolding(
  holding: Omit<PortfolioHolding, 'id'>
): Promise<PortfolioHolding> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No authenticated user');

  const dbHolding = toDatabaseHolding(holding);

  const { data, error } = await supabase
    .from('holdings')
    .insert({ ...dbHolding, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return toClientHolding(data as DatabaseHolding);
}

/**
 * Updates an existing holding by ID.
 * RLS ensures only the user's own holdings can be updated.
 */
export async function updateHolding(
  id: string,
  updates: Partial<PortfolioHolding>
): Promise<PortfolioHolding> {
  // Convert camelCase updates to snake_case for the database
  const dbUpdates: Record<string, unknown> = {};

  if (updates.ticker !== undefined) dbUpdates.ticker = updates.ticker;
  if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
  if (updates.shares !== undefined) dbUpdates.shares = updates.shares;
  if (updates.avgCost !== undefined) dbUpdates.avg_cost = updates.avgCost;
  if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice;
  if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.riskLevel !== undefined) dbUpdates.risk_level = updates.riskLevel;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from('holdings')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return toClientHolding(data as DatabaseHolding);
}

/**
 * Deletes a holding by ID.
 * RLS ensures only the user's own holdings can be deleted.
 */
export async function deleteHolding(id: string): Promise<void> {
  const { error } = await supabase
    .from('holdings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
