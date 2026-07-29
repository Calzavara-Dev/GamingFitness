// src/services/stravaApi.ts

export const STRAVA_CLIENT_ID = '267831';
export const STRAVA_CLIENT_SECRET = 'e980d96c790220de3c1a71494e06262d591e74a4';

export const stravaDiscovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

// Função para buscar atividades recentes (hoje)
export const fetchTodayRunningDistance = async (accessToken: string, ignoreActivityId?: string | number | null) => {
  try {
    // Pegar o timestamp do início do dia de hoje (em segundos)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const afterTimestamp = Math.floor(today.getTime() / 1000);

    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${afterTimestamp}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar atividades do Strava');
    }

    const activities = await response.json();
    
    // O Strava retorna distância em metros. Precisamos converter para km.
    let totalDistanceKm = 0;
    
    activities.forEach((activity: any) => {
      // Ignora a atividade se foi usada como punição
      if (ignoreActivityId && activity.id === ignoreActivityId) return;

      // type: 'Run' (Corrida)
      if (activity.type === 'Run') {
        totalDistanceKm += (activity.distance / 1000);
      }
    });

    return totalDistanceKm;
  } catch (error) {
    console.error('Strava Fetch Error:', error);
    return 0;
  }
};

// Verifica se houve alguma atividade hoje para liberar a punição
export const checkStravaPenaltyWorkout = async (accessToken: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const afterTimestamp = Math.floor(today.getTime() / 1000);

    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${afterTimestamp}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error('Falha ao buscar Strava');
    
    const activities = await response.json();
    
    // Anti-cheat: A atividade deve ser do tipo "Run" E
    // ter 'hiit' ou 'castigo' no nome, OU ter workout_type === 3 (Workout)
    const validWorkout = activities.find((activity: any) => {
      if (activity.type !== 'Run') return false;
      
      const name = (activity.name || '').toLowerCase();
      const isHIITName = name.includes('hiit') || name.includes('castigo') || name.includes('intervalado');
      const isWorkoutType = activity.workout_type === 3;
      
      return isHIITName || isWorkoutType;
    });

    return validWorkout ? validWorkout.id : null;
  } catch (error) {
    console.error('Strava Fetch Error:', error);
    return null;
  }
};
