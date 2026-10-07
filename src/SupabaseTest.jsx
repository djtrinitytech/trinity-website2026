import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

const SupabaseTest = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('teams')
          .select('*')
          .order('name');

        if (fetchError) {
          throw fetchError;
        }

        setTeams(data || []);
      } catch (err) {
        console.error('Supabase query error:', err);
        setError(err.message || 'Failed to fetch teams from Supabase');
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#fff', backgroundColor: '#050b18', minHeight: '100vh' }}>
      <h1 style={{ color: '#dc9d4a', marginBottom: '1.5rem' }}>Supabase Test</h1>

      {loading && <p>Loading teams from Supabase...</p>}

      {error && (
        <div style={{ color: '#ef4444', padding: '1rem', border: '1px solid #ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {!loading && !error && teams.length === 0 && (
        <p>No teams found in the `teams` table.</p>
      )}

      {!loading && !error && teams.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0, fontSize: '1.2rem', lineHeight: '2' }}>
          {teams.map((team) => {
            const sports = team.sports_points ?? team.sportsPoints ?? 0;
            const cultural = team.cultural_points ?? team.culturalPoints ?? 0;
            const total = sports + cultural;

            return (
              <li key={team.id || team.name}>
                {team.name}: {total}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SupabaseTest;
