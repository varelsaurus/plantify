// ==========================================
// 🌿 PLANTIFY INTELLIGENCE ENGINE (script.js)
// ==========================================

const GROQ_API_KEY = "";
let mySavedPlants = [];

// ==========================================
// 🌍 DATA MODE & LOCATION VARIABLES
// ==========================================
let currentDataMode = 'sensor'; // 'sensor' or 'location'
let locationData = {
    name: '',
    country: '',
    temp: 24,
    humidity: 50,
    co2: 450,  // Estimated from API or default
    tvoc: 100  // Estimated based on location type
};

// Switch between sensor mode and location mode
function switchDataMode(mode) {
    currentDataMode = mode;

    const btnSensor = document.getElementById('btn-sensor-mode');
    const btnLocation = document.getElementById('btn-location-mode');
    const sensorSection = document.getElementById('sensor-input-section');
    const locationSection = document.getElementById('location-input-section');
    const recommendationBadge = document.getElementById('recommendation-badge');

    if (mode === 'sensor') {
        // Activate sensor mode
        btnSensor.className = 'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all bg-green-600 text-white shadow-lg shadow-green-200';
        btnLocation.className = 'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all bg-gray-100 text-gray-600 hover:bg-gray-200';
        sensorSection.classList.remove('hidden');
        locationSection.classList.add('hidden');
        if (recommendationBadge) recommendationBadge.textContent = 'Auto-Match';

        // Reset to slider values
        updateGauges();
    } else {
        // Activate location mode
        btnLocation.className = 'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-200';
        btnSensor.className = 'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all bg-gray-100 text-gray-600 hover:bg-gray-200';
        sensorSection.classList.add('hidden');
        locationSection.classList.remove('hidden');
        if (recommendationBadge) recommendationBadge.textContent = 'Location-Based';
    }

    lucide.createIcons();
}

// Fetch location data from Open-Meteo API (Free, no API key required)
async function fetchLocationData() {
    const searchInput = document.getElementById('location-search');
    const locationStatus = document.getElementById('location-status');
    const locationName = document.getElementById('location-name');
    const locationDetails = document.getElementById('location-details');
    const btnSearch = document.getElementById('btn-search-location');

    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a city name');
        return;
    }

    // Show loading state
    btnSearch.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';
    btnSearch.disabled = true;
    locationStatus.classList.remove('hidden');
    locationName.textContent = 'Searching...';
    locationDetails.textContent = 'Finding your location...';
    lucide.createIcons();

    try {
        // Step 1: Geocoding - Get coordinates from city name
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found. Please try another name.');
        }

        const location = geoData.results[0];
        const { latitude, longitude, name, country, population } = location;

        // Step 2: Get weather data from Open-Meteo
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
        const weatherData = await weatherResponse.json();

        const temp = Math.round(weatherData.current.temperature_2m);
        const humidity = Math.round(weatherData.current.relative_humidity_2m);

        // Step 3: Estimate CO2 and TVOC based on location type
        // Urban areas typically have higher pollution
        const isUrban = population && population > 100000;
        const estimatedCO2 = isUrban ? Math.round(450 + Math.random() * 200) : Math.round(400 + Math.random() * 100);
        const estimatedTVOC = isUrban ? Math.round(150 + Math.random() * 200) : Math.round(50 + Math.random() * 100);

        // Store location data
        locationData = {
            name: name,
            country: country,
            temp: temp,
            humidity: humidity,
            co2: estimatedCO2,
            tvoc: estimatedTVOC,
            isUrban: isUrban
        };

        // Update UI
        locationName.textContent = `${name}, ${country}`;
        locationDetails.textContent = `${temp}°C • ${humidity}% humidity • ${isUrban ? 'Urban' : 'Rural'} area`;
        document.getElementById('location-source').textContent = isUrban ? 'Urban' : 'Rural';

        // Update gauges with location data
        updateGaugesWithLocationData();

        // Run analysis with location data
        analyzeManualData();

    } catch (error) {
        locationName.textContent = 'Error';
        locationDetails.textContent = error.message || 'Failed to fetch data. Please try again.';
        console.error('Location fetch error:', error);
    } finally {
        btnSearch.innerHTML = '<i data-lucide="search" class="w-4 h-4"></i>';
        btnSearch.disabled = false;
        lucide.createIcons();
    }
}

// Update gauges with location-based data
function updateGaugesWithLocationData() {
    const { temp, humidity, co2, tvoc } = locationData;

    // Update slider values (for consistency)
    document.getElementById('temp-slider').value = temp;
    document.getElementById('hum-slider').value = humidity;
    document.getElementById('co2-slider').value = co2;
    document.getElementById('tvoc-slider').value = tvoc;

    // Update display values
    document.getElementById('val-temp').innerText = temp + "°C";
    document.getElementById('val-hum').innerText = humidity + "%";
    document.getElementById('val-tvoc').innerText = tvoc + " ppb";
    document.getElementById('val-co2').innerText = co2 + " ppm";

    // Update gauges
    updateGauges();
}

// Add Enter key support for location search
document.addEventListener('DOMContentLoaded', () => {
    const locationSearch = document.getElementById('location-search');
    if (locationSearch) {
        locationSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                fetchLocationData();
            }
        });
    }
});

// 1. DATABASE TANAMAN (Updated: Areca Palm Max Temp 32°C)
const plantDatabase = [
    {
        id: 'snake_plant',
        name: 'Snake Plant',
        scientific: 'Dracaena trifasciata',
        tags: ['removes_co2', 'low_light', 'cam_photosynthesis', 'bedroom_friendly', 'removes_tvoc'],
        // Snake plant sangat kuat (Tahan sampai 40C, Tahan kering)
        safety_limits: { min_hum: 0, max_temp: 40 },
        water_freq: "Every 2-3 weeks",
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
        price: 'S$ 10.00',
        efficiency: 'Dry Air Survivor',
        image: 'assets/jade_plant.jpg',
        shop_link: 'https://tokopedia.com/search?q=jade+plant'
    }
];

// ==========================================
// 🧭 NAVIGATION
// ==========================================

function switchPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const desktopNav = document.getElementById('nav-' + pageId);
    if (desktopNav) desktopNav.classList.add('active');

    if (window.innerWidth < 1024) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }

    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.style.opacity = '0';
        targetPage.style.transform = 'translateY(10px)';
        setTimeout(() => {
            targetPage.classList.add('active');
            targetPage.style.opacity = '1';
            targetPage.style.transform = 'translateY(0)';
        }, 50);
    }

    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);

    document.getElementById('page-title').innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);

    if (pageId === 'myplants') renderMyPlantsPage();
    if (pageId === 'careguide') renderCareGuidePage();
    if (pageId === 'reminders') renderRemindersPage();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

// ==========================================
// 🧠 ANALYSIS LOGIC (SAFETY CHECK KETAT)
// ==========================================

function analyzeManualData() {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 animate-pulse">
            <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-3 text-green-600"></i>
            <p>Checking plant survival rates...</p>
        </div>
    `;
    lucide.createIcons();

    setTimeout(() => {
        const temp = parseInt(document.getElementById('temp-slider').value);
        const hum = parseInt(document.getElementById('hum-slider').value);
        const tvoc = parseInt(document.getElementById('tvoc-slider').value);
        const co2 = parseInt(document.getElementById('co2-slider').value);
        const light = document.getElementById('pref-light').value;
        const safety = document.getElementById('pref-safety').value;

        // 1. Definisikan Masalah
        let problems = [];
        if (co2 > 1000) problems.push({ type: 'removes_co2', label: 'High CO₂ Solution' });
        if (tvoc > 300) problems.push({ type: 'removes_tvoc', label: 'Toxin Filter' });
        if (temp > 28) problems.push({ type: 'removes_heat', label: 'Cooling Plants' });
        if (hum < 40) problems.push({ type: 'humidifier', label: 'Humidifiers' });

        if (problems.length === 0) problems.push({ type: 'general', label: 'Great for Maintenance' });

        container.innerHTML = '';

        let anyResult = false;

        problems.forEach(problem => {
            // FILTER 1: Cari kandidat yg cocok dengan masalah (misal: Cooling)
            let candidates = plantDatabase.filter(p => {
                if (safety === 'Yes' && p.toxicity === true) return false;
                if (light === 'Low' && !p.light_needs.includes('Low')) return false;
                if (problem.type === 'general') return true;
                return p.tags.includes(problem.type);
            });

            // FILTER 2: SURVIVAL CHECK (PENTING!)
            // Buang tanaman yang akan MATI di kondisi ini
            let survivors = candidates.filter(p => {
                if (!p.safety_limits) return true;

                // Cek Batas Atas Suhu
                // Contoh: Jika user 33°C, Areca Palm (Max 32°C) akan return FALSE -> Dibuang
                if (temp > p.safety_limits.max_temp) return false;

                // Cek Batas Bawah Kelembaban
                // Contoh: Jika humidity 20%, Boston Fern (Min 40%) akan return FALSE -> Dibuang
                if (hum < p.safety_limits.min_hum) return false;

                return true;
            });

            if (survivors.length > 0) {
                anyResult = true;
                const sectionTitle = `
                    <div class="col-span-full mt-4 mb-2">
                        <h4 class="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                            ${problem.label}
                        </h4>
                    </div>`;
                container.innerHTML += sectionTitle;

                survivors.forEach(plant => {
                    container.innerHTML += renderPlantCard(plant);
                });
            }
        });

        // Tampilkan Warning jika TIDAK ADA tanaman yang selamat
        if (!anyResult) {
            container.innerHTML = `
                <div class="col-span-full text-center p-6 bg-red-50 rounded-xl border border-red-100">
                    <p class="text-red-500 font-bold mb-1">Conditions too harsh for plants! ⚠️</p>
                    <p class="text-xs text-red-400">
                        Current: <b>${temp}°C</b> / <b>${hum}% Humidity</b>.<br>
                        Most plants (like Areca Palm or Ferns) will die here.<br>
                        👉 Try <strong>Snake Plant</strong> or <strong>Jade Plant</strong> (Survivors), or adjust your AC/Humidifier first.
                    </p>
                </div>`;
        }

        lucide.createIcons();
    }, 600);
}

function renderPlantCard(plant) {
    const isSaved = mySavedPlants.includes(plant.id);
    const btnClass = isSaved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white';

    return `
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col h-full">
        <a href="${plant.shop_link}" target="_blank" class="block">
            <div class="relative overflow-hidden rounded-xl mb-4">
                <img src="${plant.image}" class="w-full h-32 object-cover transform group-hover:scale-105 transition-transform duration-500">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                    <p class="text-white text-[10px] font-medium flex items-center gap-1">
                        <i data-lucide="zap" class="w-3 h-3 text-yellow-400"></i> ${plant.efficiency}
                    </p>
                </div>
            </div>
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${plant.name}</h4>
                    <p class="text-[10px] text-gray-500 italic">${plant.scientific}</p>
                </div>
                <span class="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">${plant.price}</span>
            </div>
        </a>
        <div class="mt-auto pt-3 border-t border-gray-50">
            <button id="btn-save-${plant.id}" onclick="toggleSavePlant('${plant.id}')" class="w-full py-2 rounded-lg font-bold text-xs transition-colors ${btnClass}">
                ${isSaved ? '<i data-lucide="check" class="w-3 h-3 inline"></i> Added' : '<i data-lucide="plus" class="w-3 h-3 inline"></i> Add to My Plants'}
            </button>
        </div>
    </div>`;
}

// ==========================================
// 📊 GAUGE & SLIDER LOGIC
// ==========================================

function updateGauges() {
    const temp = parseInt(document.getElementById('temp-slider').value);
    const hum = parseInt(document.getElementById('hum-slider').value);
    const tvoc = parseInt(document.getElementById('tvoc-slider').value);
    const co2 = parseInt(document.getElementById('co2-slider').value);

    document.getElementById('val-temp').innerText = temp + "°C";
    document.getElementById('val-hum').innerText = hum + "%";
    document.getElementById('val-tvoc').innerText = tvoc + " ppb";
    document.getElementById('val-co2').innerText = co2 + " ppm";

    const gTemp = document.querySelector('#g-temp .gauge-value'); if (gTemp) gTemp.innerText = temp;
    const gHum = document.querySelector('#g-hum .gauge-value'); if (gHum) gHum.innerText = hum;
    const gTvoc = document.querySelector('#g-tvoc .gauge-value'); if (gTvoc) gTvoc.innerText = tvoc;
    const gCo2 = document.querySelector('#g-co2 .gauge-value'); if (gCo2) gCo2.innerText = co2;

    const cGreen = "#22c55e", cYellow = "#eab308", cRed = "#ef4444";

    updateSingleGauge('temp', temp, 18, 28, ['Cool', 'Good', 'Hot'], [cYellow, cGreen, cRed]);
    updateSingleGauge('hum', hum, 30, 60, ['Dry', 'Ideal', 'Damp'], [cRed, cGreen, cRed]);
    updateSingleGauge('tvoc', tvoc, 200, 600, ['Safe', 'Mod', 'High'], [cGreen, cYellow, cRed]);
    updateSingleGauge('co2', co2, 800, 1500, ['Fresh', 'Stuffy', 'Poor'], [cGreen, cYellow, cRed]);

    updateAQI(temp, hum, tvoc, co2);
}

function updateAQI(t, h, tvoc, co2) {
    let penalty = ((tvoc / 1000) * 30) + ((co2 / 2000) * 30);
    if (t > 30 || t < 18) penalty += 10;
    if (h < 30 || h > 70) penalty += 10;

    let score = Math.round(100 - penalty);
    if (score < 0) score = 0;

    const scoreElement = document.getElementById('aqi-score');
    const statusElement = document.getElementById('aqi-status');
    const barElement = document.getElementById('aqi-bar');
    const msgElement = document.getElementById('aqi-msg');

    if (scoreElement) scoreElement.innerText = score;
    if (barElement) barElement.style.width = score + "%";

    let statusText = "Excellent", colorClass = "text-green-400", message = "Air is clean.";
    if (score < 50) {
        statusText = "Poor"; colorClass = "text-red-500";
        if (barElement) barElement.className = "h-full bg-red-500 rounded-full transition-all duration-500";
        message = "High pollution detected.";
    } else if (score < 80) {
        statusText = "Moderate"; colorClass = "text-yellow-400";
        if (barElement) barElement.className = "h-full bg-yellow-400 rounded-full transition-all duration-500";
        message = "Air quality is okay.";
    } else {
        if (barElement) barElement.className = "h-full bg-green-500 rounded-full transition-all duration-500";
    }

    if (statusElement) { statusElement.innerText = statusText; statusElement.className = `font-medium mb-2 ${colorClass}`; }
    if (msgElement) msgElement.innerText = message;
}

function updateSingleGauge(id, val, limit1, limit2, texts, colors) {
    const needle = document.querySelector(`#g-${id} .gauge-needle`);
    const arc = document.querySelector(`#g-${id} .gauge-arc`);
    const statusText = document.querySelector(`#g-${id} ~ .status-text`);

    let deg = -90, color = colors[0], status = texts[0];

    if (val <= limit1) {
        color = colors[0]; status = texts[0]; deg = -90 + (val / limit1) * 60;
    } else if (val > limit1 && val <= limit2) {
        color = colors[1]; status = texts[1]; deg = -30 + ((val - limit1) / (limit2 - limit1)) * 60;
    } else {
        color = colors[2]; status = texts[2]; deg = 30 + ((val - limit2) / limit2) * 60;
        if (deg > 90) deg = 90;
    }

    if (id === 'hum') {
        if (val < 30) { color = colors[0]; status = texts[0]; deg = -90 + (val / 30) * 60; }
        else if (val <= 60) { color = colors[1]; status = texts[1]; deg = 0; }
        else { color = colors[2]; status = texts[2]; deg = 45; }
    }

    if (needle) needle.style.transform = `rotate(${deg}deg)`;
    if (arc) arc.style.background = `conic-gradient(${colors[0]} 0deg 60deg, ${colors[1]} 60deg 120deg, ${colors[2]} 120deg 180deg, transparent 180deg)`;
    if (statusText) { statusText.innerText = status; statusText.style.color = color; }
}

function askAIAboutCurrentStats() {
    const temp = document.getElementById('temp-slider').value;
    const hum = document.getElementById('hum-slider').value;
    const tvoc = document.getElementById('tvoc-slider').value;
    const co2 = document.getElementById('co2-slider').value;

    if (!isChatOpen) toggleChat();

    const prompt = `My room stats: Temp ${temp}°C, Humidity ${hum}%, TVOC ${tvoc}ppb, CO2 ${co2}ppm. What plants do you recommend?`;

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = prompt;
        document.getElementById('chat-send-btn').click();
    }
}

// ==========================================
// ⏰ REMINDERS & SAVED PLANTS
// ==========================================

function toggleSavePlant(plantId) {
    const index = mySavedPlants.indexOf(plantId);
    if (index > -1) mySavedPlants.splice(index, 1);
    else mySavedPlants.push(plantId);

    const btn = document.getElementById(`btn-save-${plantId}`);
    if (btn) updateSaveButton(btn, mySavedPlants.includes(plantId));

    const activePage = document.querySelector('.page-content.active');
    if (activePage) {
        if (activePage.id === 'page-myplants') renderMyPlantsPage();
        if (activePage.id === 'page-careguide') renderCareGuidePage();
        if (activePage.id === 'page-reminders') renderRemindersPage();
    }
}

function renderRemindersPage() {
    const container = document.getElementById('rm-list');
    if (!container) return;

    container.innerHTML = "";

    if (mySavedPlants.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <i data-lucide="bell-off" class="w-8 h-8"></i>
                </div>
                <p class="text-gray-500 font-medium text-center">No plants tracked.<br>Add plants to see watering schedule.</p>
                <button onclick="switchPage('dashboard')" class="mt-4 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition">Find Plants</button>
            </div>`;
    } else {
        mySavedPlants.forEach(id => {
            const p = plantDatabase.find(x => x.id === id);
            if (!p) return;

            container.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mb-4 hover:shadow-md transition-all">
                <div class="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-green-100">
                    <img src="${p.image}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 text-sm">${p.name}</h4>
                    <div class="text-xs text-blue-600 font-bold flex items-center gap-1 mt-1 bg-blue-50 w-fit px-2 py-1 rounded-md">
                        <i data-lucide="droplets" class="w-3 h-3"></i> ${p.water_freq}
                    </div>
                </div>
                <label class="relative cursor-pointer group">
                    <input type="checkbox" class="peer sr-only">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 peer-checked:bg-green-500 peer-checked:text-white transition-all group-hover:bg-gray-200">
                        <i data-lucide="check" class="w-6 h-6"></i>
                    </div>
                </label>
            </div>`;
        });
    }
    lucide.createIcons();
}

function updateSaveButton(btn, isSaved) {
    if (isSaved) {
        btn.innerHTML = `<i data-lucide="check" class="w-3 h-3 inline"></i> Added`;
        btn.className = "w-full py-2 rounded-lg font-bold text-xs transition-colors bg-green-100 text-green-700";
    } else {
        btn.innerHTML = `<i data-lucide="plus" class="w-3 h-3 inline"></i> Add to My Plants`;
        btn.className = "w-full py-2 rounded-lg font-bold text-xs transition-colors bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white";
    }
    lucide.createIcons();
}

// ... (renderMyPlantsPage & renderCareGuidePage tidak diubah) ...

const vidaVerdeProducts = [
    { name: "Nature's Defender", desc: "Pest Control Spray", icon: "shield-check", color: "text-red-500", bg: "bg-red-50", link: "https://shopee.sg/Nature's-Defender-Garden-Pest-Control-Spray-all-natural-poison-free-for-plant-pests-and-insects-Vidaverde-300ml-i.481505002.10946631746" },
    { name: "Tweetmint Cleaner", desc: "Enzyme Cleaner", icon: "sparkles", color: "text-teal-500", bg: "bg-teal-50", link: "https://shopee.sg/Tweetmint-Enzyme-Cleaner-safe-non-toxic-all-in-one-cleaner-hypoallergenic-biodegradable-Vidaverde-i.481505002.13507041095" },
    { name: "Ocean Solution", desc: "Plant Mineraliser", icon: "droplet", color: "text-blue-500", bg: "bg-blue-50", link: "https://www.vidaverde-ipl.sg/mineraliser" },
    { name: "SERAMIX Potting Mix", desc: "Premium Soil", icon: "layers", color: "text-amber-600", bg: "bg-amber-50", link: "https://shopee.sg/SERAMIX-Premium-Semi-Hydro-Potting-Mix-For-Houseplants-Edibles-Can-Soil-Amendment-Vidaverde-International-i.481505002.20347239405" }
];

function renderMyPlantsPage() {
    const container = document.getElementById('myplants-container');
    if (!container) return;
    container.innerHTML = '';
    if (mySavedPlants.length === 0) {
        container.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4"><i data-lucide="sprout" class="w-10 h-10 text-green-300"></i></div>
                <h3 class="font-[Poppins] text-xl font-bold text-gray-700">Your jungle is empty!</h3>
                <button onclick="switchPage('dashboard')" class="mt-4 px-6 py-2 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition">Find Plants</button>
            </div>`;
        lucide.createIcons();
        return;
    }
    mySavedPlants.forEach(id => {
        const plant = plantDatabase.find(p => p.id === id);
        if (!plant) return;
        const card = `<div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 relative group">
                <div class="w-24 h-24 rounded-xl overflow-hidden shrink-0"><img src="${plant.image}" class="w-full h-full object-cover"></div>
                <div class="flex-1 flex flex-col justify-center">
                    <h4 class="font-bold text-gray-800 text-lg">${plant.name}</h4>
                    <p class="text-xs text-gray-500 italic mb-2">${plant.scientific}</p>
                    <a href="${plant.shop_link}" target="_blank" class="text-xs text-green-600 font-bold hover:underline">Buy Again ↗</a>
                </div>
                <button onclick="toggleSavePlant('${plant.id}')" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </div>`;
        container.innerHTML += card;
    });
    lucide.createIcons();
}

function renderCareGuidePage() {
    const container = document.getElementById('careguide-container');
    if (!container) return;
    container.innerHTML = '';
    if (mySavedPlants.length === 0) {
        container.innerHTML += `<div class="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-dashed border-gray-300 mb-8"><i data-lucide="book" class="w-10 h-10 text-gray-300 mb-4"></i><p class="text-gray-400 font-medium">Add plants to see guides.</p></div>`;
    } else {
        mySavedPlants.forEach(id => {
            const plant = plantDatabase.find(p => p.id === id);
            if (!plant) return;
            const card = `<div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8">
                    <div class="h-40 bg-cover bg-center relative" style="background-image: url('${plant.image}');">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6"><div><h3 class="text-2xl font-bold text-white">${plant.name}</h3></div></div>
                    </div>
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0"><i data-lucide="sun" class="w-5 h-5 text-yellow-500"></i></div><div><h5 class="font-bold text-gray-800 text-sm">Light</h5><p class="text-sm text-gray-600">${plant.light_needs}</p></div></div>
                        <div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><i data-lucide="droplets" class="w-5 h-5 text-blue-500"></i></div><div><h5 class="font-bold text-gray-800 text-sm">Watering</h5><p class="text-sm text-gray-600">${plant.water_freq}</p></div></div>
                    </div>
                </div>`;
            container.innerHTML += card;
        });
    }
    let productsHTML = `<div class="mt-8"><h3 class="font-[Poppins] text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><i data-lucide="shopping-bag" class="w-5 h-5 text-green-600"></i>VidaVerde Essentials</h3><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">`;
    vidaVerdeProducts.forEach(prod => {
        productsHTML += `<a href="${prod.link}" target="_blank" class="bg-white p-4 rounded-2xl border border-green-50 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                <div class="w-12 h-12 ${prod.bg} rounded-full flex items-center justify-center mb-3"><i data-lucide="${prod.icon}" class="w-6 h-6 ${prod.color}"></i></div>
                <h4 class="font-bold text-gray-800 text-sm mb-1">${prod.name}</h4>
                <p class="text-xs text-gray-500 mb-3">${prod.desc}</p>
                <span class="mt-auto text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">Buy Now ↗</span>
            </a>`;
    });
    productsHTML += `</div></div>`;
    container.innerHTML += productsHTML;
    lucide.createIcons();
}

// 6. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    analyzeManualData();
    updateGauges();

    const inputs = ['temp-slider', 'hum-slider', 'tvoc-slider', 'co2-slider', 'pref-light', 'pref-safety'];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                updateGauges();
            });
        }
    });
});