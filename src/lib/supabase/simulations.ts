import { supabase } from './client';
import { InventoryParams, SimulationResult } from '../../types/inventory';

export const saveSimulation = async (params: InventoryParams, results: SimulationResult) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        // User might not be logged in, handled by RLS policies usually, 
        // but here we just try to get the ID if available.

        // We intentionally don't throw if variables are missing (client stubbed),
        // but if we have a client and the request fails, we throw.
        // if (!supabase.supabaseUrl) return null;

        const { data, error } = await supabase
            .from('simulations')
            .insert([
                {
                    product_name: params.name || 'Unnamed SKU',
                    input_params: params,
                    simulation_results: results, // Note: column name in request was "results" but usually "simulation_results" in schema or mapped. 
                    // User asked for "results: results" in snippet, but schema snippet said "simulation_results JSONB".
                    // I will use "simulation_results" to match the schema snippet I saw in the prompt: "simulation_results JSONB".
                    // Wait, user snippet in prompt: 
                    // .insert([ { ..., results: results, ... } ])
                    // BUT SQL snippet: "simulation_results JSONB".
                    // Mapping: I'll use "simulation_results" to match SQL.

                    user_id: user?.id
                }
            ])
            .select();

        if (error) {
            console.error('Error saving simulation:', error);
            throw error;
        }
        return data;
    } catch (err) {
        console.error('Failed to save simulation:', err);
        // Don't crash the app if analytics fail
        return null;
    }
};
