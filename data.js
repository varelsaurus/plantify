// ==========================================
// 🌿 PLANTIFY DATA - Plant Database & Products
// ==========================================

// DATABASE TANAMAN (Updated: Areca Palm Max Temp 32°C)
const plantDatabase = [
    {
        id: 'snake_plant',
        name: 'Snake Plant',
        scientific: 'Dracaena trifasciata',
        tags: ['removes_co2', 'low_light', 'cam_photosynthesis', 'bedroom_friendly', 'removes_tvoc'],
        // Snake plant sangat kuat (Tahan sampai 40C, Tahan kering)
        safety_limits: { min_hum: 0, max_temp: 40 },
        water_freq: "Every 2-3 weeks",
        light_needs: "Low to Bright Indirect",
        maintenance: "Low",
        price: 'S$ 11.00',
        efficiency: 'High CO2 removal',
        image: 'assets/snake_plant.jpg',
        shop_link: 'https://tokopedia.com/search?q=snake+plant'
    },
    {
        id: 'boston_fern',
        name: 'Boston Fern',
        scientific: 'Nephrolepis exaltata',
        tags: ['humidifier', 'removes_tvoc'],
        // Sangat sensitif kering. Mati jika humidity < 40%
        safety_limits: { min_hum: 40, max_temp: 30 },
        water_freq: "Twice weekly (Keep moist)",
        light_needs: "Bright Indirect",
        maintenance: "High",
        price: 'S$ 21.90',
        efficiency: 'Natural Humidifier',
        image: 'assets/boston_fern.jpg',
        shop_link: 'https://tokopedia.com/search?q=boston+fern'
    },
    {
        id: 'peace_lily',
        name: 'Peace Lily',
        scientific: 'Spathiphyllum',
        tags: ['removes_tvoc', 'humidifier'],
        // Tidak tahan panas ekstrem
        safety_limits: { min_hum: 30, max_temp: 28 },
        water_freq: "Weekly (will droop when thirsty)",
        light_needs: "Low to Medium",
        maintenance: "Low",
        price: 'S$ 9.00',
        efficiency: 'Best VOC Fighter',
        image: 'assets/peace_lily.jpg',
        shop_link: 'https://tokopedia.com/search?q=peace+lily'
    },
    {
        id: 'areca_palm',
        name: 'Areca Palm',
        scientific: 'Dypsis lutescens',
        tags: ['removes_co2', 'humidifier', 'removes_heat'],
        // UPDATED: Mati jika suhu > 32°C
        safety_limits: { min_hum: 40, max_temp: 32 },
        water_freq: "Weekly",
        light_needs: "Bright Indirect",
        maintenance: "Medium",
        price: 'S$ 30.00',
        efficiency: 'Highest O2 production',
        image: 'assets/areca_palm.jpg',
        shop_link: 'https://tokopedia.com/search?q=areca+palm'
    },
    {
        id: 'rubber_plant',
        name: 'Rubber Plant',
        scientific: 'Ficus elastica',
        tags: ['removes_co2', 'removes_heat', 'removes_tvoc'],
        // Lebih tahan panas daripada Areca
        safety_limits: { min_hum: 20, max_temp: 35 },
        water_freq: "Weekly",
        light_needs: "Low to Bright",
        maintenance: "Low",
        price: 'S$ 15.30',
        efficiency: 'Absorbs Heat & Toxins',
        image: 'assets/rubber_plant.jpg',
        shop_link: 'https://tokopedia.com/search?q=karet+kebo'
    },
    {
        id: 'english_ivy',
        name: 'English Ivy',
        scientific: 'Hedera helix',
        tags: ['removes_mold', 'removes_tvoc'],
        // Suka sejuk
        safety_limits: { min_hum: 30, max_temp: 30 },
        water_freq: "Weekly",
        light_needs: "Low to Bright Indirect",
        maintenance: "Medium",
        price: 'S$ 12.00',
        efficiency: 'Mold Fighter',
        image: 'assets/english_ivy.jpg',
        shop_link: 'https://tokopedia.com/search?q=english+ivy'
    },
    {
        id: 'jade_plant',
        name: "Jade Plant",
        scientific: "Crassula ovata",
        tags: ['removes_tvoc'],
        // Kaktus/Sukulen: Tahan panas & kering
        safety_limits: { min_hum: 0, max_temp: 38 },
        water_freq: "Every 2 weeks",
        light_needs: "Bright Direct",
        maintenance: "Low",
        price: 'S$ 10.00',
        efficiency: 'Dry Air Survivor',
        image: 'assets/jade_plant.jpg',
        shop_link: 'https://tokopedia.com/search?q=jade+plant'
    }
];

// VIDAVERDE PRODUCTS
const vidaVerdeProducts = [
    {
        name: "Nature's Defender",
        desc: "Pest Control Spray",
        icon: "shield-check",
        color: "text-red-500",
        bg: "bg-red-50",
        link: "https://shopee.sg/Nature's-Defender-Garden-Pest-Control-Spray-all-natural-poison-free-for-plant-pests-and-insects-Vidaverde-300ml-i.481505002.10946631746"
    },
    {
        name: "Tweetmint Cleaner",
        desc: "Enzyme Cleaner",
        icon: "sparkles",
        color: "text-teal-500",
        bg: "bg-teal-50",
        link: "https://shopee.sg/Tweetmint-Enzyme-Cleaner-safe-non-toxic-all-in-one-cleaner-hypoallergenic-biodegradable-Vidaverde-i.481505002.13507041095"
    },
    {
        name: "Ocean Solution",
        desc: "Plant Mineraliser",
        icon: "droplet",
        color: "text-blue-500",
        bg: "bg-blue-50",
        link: "https://www.vidaverde-ipl.sg/mineraliser"
    },
    {
        name: "SERAMIX Potting Mix",
        desc: "Premium Soil",
        icon: "layers",
        color: "text-amber-600",
        bg: "bg-amber-50",
        link: "https://shopee.sg/SERAMIX-Premium-Semi-Hydro-Potting-Mix-For-Houseplants-Edibles-Can-Soil-Amendment-Vidaverde-International-i.481505002.20347239405"
    }
];
