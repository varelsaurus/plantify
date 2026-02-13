// ==========================================
// 🌿 PLANTIFY DATA - Plant Database & Products
// ==========================================

// DATABASE TANAMAN - 13 Plants with survival ranges from The Spruce
// Sources: The Spruce care guides, NASA Clean Air Study (1989), Wolverton et al.
const plantDatabase = [
    {
        id: 'snake_plant',
        name: 'Snake Plant',
        scientific: 'Dracaena trifasciata',
        tags: ['removes_co2', 'low_light', 'cam_photosynthesis', 'bedroom_friendly', 'removes_tvoc'],
        safety_limits: { min_temp: 10, max_temp: 35, min_hum: 20, max_hum: 80 },
        toxicity: true,
        voc_targets: ['formaldehyde', 'benzene', 'trichloroethylene', 'xylene'],
        water_freq: "Every 2-3 weeks",
        light_needs: "Low to Bright Indirect",
        maintenance: "Low",
        price: 'S$ 11.00',
        efficiency: 'High CO2 removal',
        image: 'assets/snake_plant.jpg',
        references: 'NASA Clean Air Study (1989) — removes benzene, formaldehyde, trichloroethylene, xylene. CAM photosynthesis converts CO₂ to O₂ at night.'
    },
    {
        id: 'boston_fern',
        name: 'Boston Fern',
        scientific: 'Nephrolepis exaltata',
        tags: ['humidifier', 'removes_tvoc'],
        safety_limits: { min_temp: 15, max_temp: 35, min_hum: 50, max_hum: 90 },
        toxicity: false,
        voc_targets: ['formaldehyde'],
        water_freq: "Twice weekly (Keep moist)",
        light_needs: "Bright Indirect",
        maintenance: "High",
        price: 'S$ 21.90',
        efficiency: 'Natural Humidifier',
        image: 'assets/boston_fern.jpg',
        references: 'NASA Clean Air Study — top performer for removing formaldehyde (1,863 µg/h). Wolverton (1996) rated it the best air-purifying houseplant.'
    },
    {
        id: 'peace_lily',
        name: 'Peace Lily',
        scientific: 'Spathiphyllum',
        tags: ['removes_tvoc', 'humidifier', 'low_light'],
        safety_limits: { min_temp: 13, max_temp: 32, min_hum: 30, max_hum: 80 },
        toxicity: true,
        voc_targets: ['benzene', 'formaldehyde', 'trichloroethylene', 'ammonia', 'xylene', 'toluene'],
        water_freq: "Weekly (will droop when thirsty)",
        light_needs: "Low to Medium",
        maintenance: "Low",
        price: 'S$ 9.00',
        efficiency: 'Best VOC Fighter',
        image: 'assets/peace_lily.jpg',
        references: 'NASA Clean Air Study — removes benzene, formaldehyde, trichloroethylene, ammonia, xylene, toluene. One of only 3 plants effective against ammonia.'
    },
    {
        id: 'areca_palm',
        name: 'Areca Palm',
        scientific: 'Dypsis lutescens',
        tags: ['removes_co2', 'humidifier', 'removes_heat'],
        safety_limits: { min_temp: 16, max_temp: 30, min_hum: 40, max_hum: 80 },
        toxicity: false,
        voc_targets: ['xylene', 'toluene'],
        water_freq: "Weekly",
        light_needs: "Bright Indirect",
        maintenance: "Medium",
        price: 'S$ 30.00',
        efficiency: 'Highest O2 production',
        image: 'assets/areca_palm.jpg',
        references: 'Wolverton (1996) rated #1 for overall air purification. Transpires ~1 liter of water/day (natural humidifier). Removes xylene & toluene per NASA study.'
    },
    {
        id: 'rubber_plant',
        name: 'Rubber Plant',
        scientific: 'Ficus elastica',
        tags: ['removes_co2', 'removes_heat', 'removes_tvoc'],
        safety_limits: { min_temp: 15, max_temp: 30, min_hum: 30, max_hum: 80 },
        toxicity: true,
        voc_targets: ['formaldehyde'],
        water_freq: "Weekly",
        light_needs: "Low to Bright",
        maintenance: "Low",
        price: 'S$ 15.30',
        efficiency: 'Absorbs Heat & Toxins',
        image: 'assets/rubber_plant.jpg',
        references: 'NASA Clean Air Study — effective at removing formaldehyde. Large leaves provide significant CO₂ absorption surface area (Journal of Environmental Horticulture, 2009).'
    },
    {
        id: 'english_ivy',
        name: 'English Ivy',
        scientific: 'Hedera helix',
        tags: ['removes_mold', 'removes_tvoc'],
        safety_limits: { min_temp: 10, max_temp: 32, min_hum: 30, max_hum: 80 },
        toxicity: true,
        voc_targets: ['benzene', 'formaldehyde', 'toluene', 'xylene'],
        water_freq: "Weekly",
        light_needs: "Low to Bright Indirect",
        maintenance: "Medium",
        price: 'S$ 12.00',
        efficiency: 'Mold Fighter',
        image: 'assets/english_ivy.jpg',
        references: 'NASA Clean Air Study — removes benzene, formaldehyde. American College of Allergy (2005) found it reduces airborne mold by 78% in 12 hours.'
    },
    {
        id: 'jade_plant',
        name: "Jade Plant",
        scientific: "Crassula ovata",
        tags: ['removes_tvoc', 'removes_co2'],
        safety_limits: { min_temp: 13, max_temp: 35, min_hum: 20, max_hum: 60 },
        toxicity: true,
        voc_targets: ['toluene'],
        water_freq: "Every 2 weeks",
        light_needs: "Bright Direct",
        maintenance: "Low",
        price: 'S$ 10.00',
        efficiency: 'Dry Air Survivor',
        image: 'assets/jade_plant.jpg',
        references: 'University of Connecticut Extension — absorbs CO₂ and toluene. Succulent with CAM photosynthesis, efficient water usage in dry climates.'
    },
    {
        id: 'aglaonema',
        name: 'Aglaonema',
        scientific: 'Aglaonema commutatum',
        tags: ['removes_tvoc', 'low_light'],
        safety_limits: { min_temp: 15, max_temp: 32, min_hum: 30, max_hum: 80 },
        toxicity: true,
        voc_targets: ['benzene', 'formaldehyde'],
        water_freq: "Weekly",
        light_needs: "Low to Medium",
        maintenance: "Low",
        price: 'S$ 14.00',
        efficiency: 'Air Purifier',
        image: 'assets/agloanema.jpg',
        references: 'NASA Clean Air Study — removes benzene and formaldehyde. Thrives in low-light indoor environments (Journal of the American Society for Horticultural Science).'
    },
    {
        id: 'aloe_vera',
        name: 'Aloe Vera',
        scientific: 'Aloe barbadensis miller',
        tags: ['removes_co2', 'removes_tvoc', 'cam_photosynthesis', 'bedroom_friendly'],
        safety_limits: { min_temp: 13, max_temp: 35, min_hum: 20, max_hum: 60 },
        toxicity: true,
        voc_targets: ['formaldehyde', 'benzene'],
        water_freq: "Every 2-3 weeks",
        light_needs: "Bright Direct",
        maintenance: "Low",
        price: 'S$ 8.00',
        efficiency: 'Night O2 Producer',
        image: 'assets/aloe_vera.jpg',
        references: 'NASA Clean Air Study — removes formaldehyde & benzene. CAM photosynthesis releases O₂ at night. Wolverton (1996) recommended for bedroom use.'
    },
    {
        id: 'bamboo_palm',
        name: 'Bamboo Palm',
        scientific: 'Chamaedorea seifrizii',
        tags: ['removes_co2', 'humidifier', 'removes_tvoc'],
        safety_limits: { min_temp: 16, max_temp: 30, min_hum: 35, max_hum: 80 },
        toxicity: false,
        voc_targets: ['formaldehyde', 'benzene', 'trichloroethylene'],
        water_freq: "Twice weekly",
        light_needs: "Bright Indirect",
        maintenance: "Medium",
        price: 'S$ 25.00',
        efficiency: 'Formaldehyde Fighter',
        image: 'assets/bamboo_palm.jpg',
        references: 'NASA Clean Air Study — ranked #3 for removing formaldehyde. Also removes benzene, trichloroethylene. High transpiration rate for natural humidification.'
    },
    {
        id: 'golden_pothos',
        name: 'Golden Pothos',
        scientific: 'Epipremnum aureum',
        tags: ['removes_tvoc', 'removes_co2', 'low_light'],
        safety_limits: { min_temp: 15, max_temp: 35, min_hum: 30, max_hum: 80 },
        toxicity: true,
        voc_targets: ['formaldehyde', 'benzene', 'xylene', 'toluene'],
        water_freq: "Weekly",
        light_needs: "Low to Bright Indirect",
        maintenance: "Low",
        price: 'S$ 7.00',
        efficiency: 'Unkillable Purifier',
        image: 'assets/golden_pothos.jpg',
        references: 'NASA Clean Air Study — removes formaldehyde, benzene, xylene, toluene. Studies show 73% reduction in CO in sealed chambers (Environ. Sci. Technol., 2009).'
    },
    {
        id: 'spider_plant',
        name: 'Spider Plant',
        scientific: 'Chlorophytum comosum',
        tags: ['removes_co2', 'removes_tvoc', 'humidifier'],
        safety_limits: { min_temp: 10, max_temp: 32, min_hum: 30, max_hum: 80 },
        toxicity: false,
        voc_targets: ['formaldehyde'],
        water_freq: "Weekly",
        light_needs: "Low to Bright Indirect",
        maintenance: "Low",
        price: 'S$ 9.00',
        efficiency: 'CO & Toxin Remover',
        image: 'assets/spider_plant.jpg',
        references: 'NASA Clean Air Study — removes formaldehyde (95% in 24h) and carbon monoxide. Non-toxic to pets (ASPCA verified). University of Hawaii study confirmed VOC reduction.'
    },
    {
        id: 'zz_plant',
        name: 'ZZ Plant',
        scientific: 'Zamioculcas zamiifolia',
        tags: ['removes_tvoc', 'low_light', 'removes_co2'],
        safety_limits: { min_temp: 15, max_temp: 30, min_hum: 20, max_hum: 80 },
        toxicity: true,
        voc_targets: ['xylene', 'toluene', 'benzene'],
        water_freq: "Every 2-3 weeks",
        light_needs: "Low to Bright Indirect",
        maintenance: "Low",
        price: 'S$ 18.00',
        efficiency: 'Drought Survivor',
        image: 'assets/zz_plant.jpg',
        references: 'University of Copenhagen study (2014) — removes xylene, toluene, and benzene from indoor air. Extremely drought-tolerant due to rhizome water storage.'
    }
];

// VOC SOURCE MAPPING - Used by questionnaire
const vocSourceMapping = {
    new_furniture: { label: 'New Furniture / Renovation (< 12 months)', targets: ['formaldehyde', 'toluene'] },
    new_paint: { label: 'New Paint / Finishing (< 6 months)', targets: ['toluene', 'xylene', 'formaldehyde'] },
    chemicals: { label: 'Art / Lab / Cleaning Chemicals', targets: ['toluene', 'xylene', 'ethanol', 'isopropanol'] },
    traffic: { label: 'Nearby Outdoor Traffic / Parking', targets: ['benzene'] },
    poor_ventilation: { label: 'Poor Ventilation (Windows usually closed)', targets: ['formaldehyde', 'benzene', 'toluene', 'xylene'] }
};

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
