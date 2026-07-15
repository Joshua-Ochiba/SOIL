// This is our Mock Database Client. 
// Later, we can swap this out with real fetch() calls to a backend, 
// and the rest of our app won't even notice the difference!


const STORAGE_KEY = 'soil_seeds';

const SeedEntity = {
    // Fetch a list of seeds from local storage
    list: async (sortBy, limit) => {
        // Simulate network delay so it feels real
        await new Promise(resolve => setTimeout(resolve, 500));

        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return data.slice(0, limit || 10);
    },



    //Save a new seed to local storage
    create: async (seedData) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const newSeed = {
            id: Date.now().toString(),
            ...seedData,
            created_date: new Date().toISOString(),
        };

        data.unshift(newSeed); // Add to the top of the list

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return newSeed;
    },
};

export const base44 = {
    entities: {
        Seed: SeedEntity,
    },
};