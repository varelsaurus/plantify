// ==========================================
// 🌿 PLANTIFY INTELLIGENCE ENGINE (script.js)
// ==========================================

const GROQ_API_KEY = "";
let mySavedPlants = [];

// ==========================================
// 🌍 DATA MODE & LOCATION VARIABLES
// ==========================================
let currentDataMode = 'sensor'; // 'sensor' or 'location'
let currentPlaceType = 'home'; // 'home', 'office', 'school', 'healthcare', 'other'
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

        // Reset to slider values and refresh recommendations
        updateGauges();
        analyzeManualData(); // Re-analyze with sensor data (including TVOC)
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

        // Step 3: Estimate CO2 based on location type (NO TVOC - not available from API)
        // Urban areas typically have higher CO2
        const isUrban = population && population > 100000;
        const estimatedCO2 = isUrban ? Math.round(450 + Math.random() * 200) : Math.round(400 + Math.random() * 100);

        // Store location data (NO TVOC in location mode!)
        locationData = {
            name: name,
            country: country,
            temp: temp,
            humidity: humidity,
            co2: estimatedCO2,
            isUrban: isUrban
        };

        // Update UI
        locationName.textContent = `${name}, ${country}`;
        locationDetails.textContent = `${temp}°C • ${humidity}% humidity • ${isUrban ? 'Urban' : 'Rural'} area`;
        document.getElementById('location-source').textContent = isUrban ? 'Urban' : 'Rural';

        // Update gauges with location data (without TVOC)
        updateGaugesWithLocationData();

        // Run LOCATION-BASED analysis (WITHOUT TVOC)
        analyzeLocationData();

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

// Update gauges with location-based data (WITHOUT TVOC)
function updateGaugesWithLocationData() {
    const { temp, humidity, co2 } = locationData;

    // Update slider values (for consistency)
    document.getElementById('temp-slider').value = temp;
    document.getElementById('hum-slider').value = humidity;
    document.getElementById('co2-slider').value = co2;
    // TVOC slider NOT updated - not available in location mode

    // Update display values
    document.getElementById('val-temp').innerText = temp + "°C";
    document.getElementById('val-hum').innerText = humidity + "%";
    document.getElementById('val-co2').innerText = co2 + " ppm";
    document.getElementById('val-tvoc').innerText = "N/A"; // Not available in location mode

    // Update gauges (location mode - without TVOC)
    updateGaugesLocationMode();
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

// ==========================================
// 🌿 PLANT DATABASE - Loaded from data.js
// ==========================================
// plantDatabase is defined in data.js (load it before this script)

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

    // Format page titles properly
    const pageTitles = {
        'dashboard': 'Dashboard',
        'myplants': 'My Plants',
        'careguide': 'Care Guide',
        'reminders': 'Reminders'
    };
    document.getElementById('page-title').innerText = pageTitles[pageId] || pageId;

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
// 🧠 ANALYSIS LOGIC (SAFETY CHECK + OTHER SURVIVORS)
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

        // 1. Detect problems (with disclaimers beside each)
        let problems = [];
        if (co2 > 1000) problems.push({ type: 'removes_co2', label: '🔬 High CO₂ Solution', disclaimer: 'Plants supplement ventilation — open windows & reduce occupancy too.' });
        if (tvoc > 300) problems.push({ type: 'removes_tvoc', label: '🧪 Toxin Filter', disclaimer: 'Remove pollution sources first. Plants are supplementary to air purifiers.' });
        if (temp > 28) problems.push({ type: 'removes_heat', label: '❄️ Cooling Plants', disclaimer: 'Plants provide minor cooling. AC or fans are the primary solution.' });
        if (hum < 40) problems.push({ type: 'humidifier', label: '💧 Humidifiers', disclaimer: 'For very dry air, a mechanical humidifier is more effective than plants alone.' });

        // 2. Get ALL surviving plants (regardless of problem matching)
        let allSurvivors = plantDatabase.filter(p => {
            if (safety === 'Yes' && p.toxicity === true) return false;
            if (light === 'Low' && p.light_needs && !p.light_needs.includes('Low')) return false;
            if (!p.safety_limits) return true;
            if (temp > p.safety_limits.max_temp) return false;
            if (hum < p.safety_limits.min_hum) return false;
            return true;
        });

        container.innerHTML = '';

        // 3. Show environment summary
        const envClass = problems.length > 0 ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100';
        const envIcon = problems.length > 0 ? 'alert-triangle' : 'check-circle';
        const envColor = problems.length > 0 ? 'text-amber-600' : 'text-green-600';
        container.innerHTML += `
            <div class="col-span-full mb-2">
                <div class="${envClass} border rounded-xl p-3 flex items-center gap-3">
                    <i data-lucide="${envIcon}" class="w-5 h-5 ${envColor} shrink-0"></i>
                    <div>
                        <p class="text-xs font-bold text-gray-700">${temp}°C · ${hum}% Humidity · TVOC ${tvoc}ppb · CO₂ ${co2}ppm</p>
                        <p class="text-[10px] text-gray-500">${allSurvivors.length} of ${plantDatabase.length} plants can survive · ${problems.length > 0 ? problems.length + ' issue(s) detected' : 'Conditions are ideal'}</p>
                    </div>
                </div>
            </div>`;

        let recommendedIds = new Set();
        let anyResult = false;

        // 4. Show problem-specific recommendations (if any problems detected)
        if (problems.length > 0) {
            problems.forEach(problem => {
                let candidates = allSurvivors.filter(p => p.tags.includes(problem.type));

                if (candidates.length > 0) {
                    anyResult = true;
                    container.innerHTML += `
                        <div class="col-span-full mt-4 mb-2">
                            <h4 class="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                ${problem.label}
                            </h4>
                            <p class="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3 inline"></i> ${problem.disclaimer}</p>
                        </div>`;

                    candidates.forEach(plant => {
                        recommendedIds.add(plant.id);
                        container.innerHTML += renderPlantCard(plant);
                    });
                }
            });

            // 5. Show OTHER surviving plants that weren't recommended for specific problems
            let otherSurvivors = allSurvivors.filter(p => !recommendedIds.has(p.id));
            if (otherSurvivors.length > 0) {
                anyResult = true;
                container.innerHTML += `
                    <div class="col-span-full mt-6 mb-2">
                        <h4 class="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
                            🌿 Other Surviving Plants
                        </h4>
                        <p class="text-[10px] text-gray-400 mt-1">These plants can still thrive in your current conditions</p>
                    </div>`;
                otherSurvivors.forEach(plant => {
                    container.innerHTML += renderPlantCard(plant);
                });
            }
        } else {
            // No problems — Air quality is excellent
            anyResult = true;
            container.innerHTML += `
                <div class="col-span-full mt-4 mb-2">
                    <div class="bg-green-100 p-4 rounded-2xl border border-green-200 text-center">
                        <h4 class="font-bold text-green-800 text-lg mb-1">🌟 Air Quality is Excellent!</h4>
                        <p class="text-sm text-green-700">Your environment has low TVOC, low CO₂, comfortable temperature, and good humidity. You don't <i>need</i> air-purifying plants right now.</p>
                        <p class="text-xs text-green-600 mt-2">Plants below are for <strong>aesthetic enhancement</strong> only — they can all survive in your current conditions.</p>
                    </div>
                </div>`;
            if (allSurvivors.length > 0) {
                container.innerHTML += `
                    <div class="col-span-full mt-4 mb-2">
                        <h4 class="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span class="w-2 h-2 bg-pink-400 rounded-full"></span>
                             Aesthetic Enhancers
                        </h4>
                    </div>`;
                allSurvivors.forEach(plant => {
                    container.innerHTML += renderPlantCard(plant);
                });
            }
        }

        // Warning if NO plants survive
        if (!anyResult) {
            container.innerHTML += `
                <div class="col-span-full text-center p-6 bg-red-50 rounded-xl border border-red-100">
                    <p class="text-red-500 font-bold mb-1">Conditions too harsh for plants! ⚠️</p>
                    <p class="text-xs text-red-400">
                        Current: <b>${temp}°C</b> / <b>${hum}% Humidity</b>.<br>
                        Most plants will die in these conditions.<br>
                        👉 Try <strong>Snake Plant</strong> or <strong>Jade Plant</strong> (Survivors), or adjust your AC/Humidifier first.
                    </p>
                </div>`;
        }

        lucide.createIcons();
    }, 600);
}

// ==========================================
// 🌍 LOCATION-BASED ANALYSIS (TANPA TVOC!)
// Model ke-2: Rekomendasi berdasarkan Weather API
// ==========================================

function analyzeLocationData() {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 animate-pulse">
            <i data-lucide="map-pin" class="w-8 h-8 animate-bounce mb-3 text-indigo-600"></i>
            <p>Analyzing location data (no TVOC sensor)...</p>
        </div>
    `;
    lucide.createIcons();

    setTimeout(() => {
        const { temp, humidity, co2 } = locationData;
        const light = document.getElementById('pref-light').value;
        const safety = document.getElementById('pref-safety').value;

        // MODEL 2: Detect problems (NO TVOC) — with disclaimers
        let problems = [];
        if (co2 > 1000) problems.push({ type: 'removes_co2', label: '🔬 High CO₂ Solution', disclaimer: 'Plants supplement ventilation — open windows & reduce occupancy too.' });
        if (temp > 28) problems.push({ type: 'removes_heat', label: '❄️ Cooling Plants', disclaimer: 'Plants provide minor cooling. AC or fans are the primary solution.' });
        if (humidity < 40) problems.push({ type: 'humidifier', label: '💧 Humidifiers', disclaimer: 'For very dry air, a mechanical humidifier is more effective than plants alone.' });

        // Get ALL surviving plants
        let allSurvivors = plantDatabase.filter(p => {
            if (safety === 'Yes' && p.toxicity === true) return false;
            if (light === 'Low' && p.light_needs && !p.light_needs.includes('Low')) return false;
            if (!p.safety_limits) return true;
            if (temp > p.safety_limits.max_temp) return false;
            if (humidity < p.safety_limits.min_hum) return false;
            return true;
        });

        container.innerHTML = '';

        // Location mode badge + environment summary
        container.innerHTML += `
            <div class="col-span-full mb-2">
                <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                    <i data-lucide="map-pin" class="w-5 h-5 text-indigo-600 shrink-0"></i>
                    <div>
                        <p class="text-xs font-bold text-indigo-700">Location-Based: ${temp}°C · ${humidity}% Humidity · CO₂ ${co2}ppm</p>
                        <p class="text-[10px] text-indigo-500">${allSurvivors.length} of ${plantDatabase.length} plants can survive · TVOC not measured · ${problems.length > 0 ? problems.length + ' issue(s)' : 'Conditions ideal'}</p>
                    </div>
                </div>
            </div>`;

        let recommendedIds = new Set();
        let anyResult = false;

        if (problems.length > 0) {
            problems.forEach(problem => {
                let candidates = allSurvivors.filter(p => p.tags.includes(problem.type));

                if (candidates.length > 0) {
                    anyResult = true;
                    container.innerHTML += `
                        <div class="col-span-full mt-4 mb-2">
                            <h4 class="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                ${problem.label}
                            </h4>
                            <p class="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><i data-lucide="info" class="w-3 h-3 inline"></i> ${problem.disclaimer}</p>
                        </div>`;

                    candidates.forEach(plant => {
                        recommendedIds.add(plant.id);
                        container.innerHTML += renderPlantCard(plant);
                    });
                }
            });

            // Other surviving plants
            let otherSurvivors = allSurvivors.filter(p => !recommendedIds.has(p.id));
            if (otherSurvivors.length > 0) {
                anyResult = true;
                container.innerHTML += `
                    <div class="col-span-full mt-6 mb-2">
                        <h4 class="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
                            🌿 Other Surviving Plants
                        </h4>
                        <p class="text-[10px] text-gray-400 mt-1">These plants can still thrive in your current conditions</p>
                    </div>`;
                otherSurvivors.forEach(plant => {
                    container.innerHTML += renderPlantCard(plant);
                });
            }
        } else {
            // No problems — Location conditions are ideal
            anyResult = true;
            container.innerHTML += `
                <div class="col-span-full mt-4 mb-2">
                    <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center">
                        <h4 class="font-bold text-indigo-800 text-lg mb-1">🌤️ Conditions Look Great!</h4>
                        <p class="text-sm text-indigo-700">Based on your location weather, you don't specifically need problem-solving plants. Plants below are for <strong>aesthetic enhancement</strong>.</p>
                    </div>
                </div>`;
            if (allSurvivors.length > 0) {
                container.innerHTML += `
                    <div class="col-span-full mt-4 mb-2">
                        <h4 class="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <span class="w-2 h-2 bg-pink-400 rounded-full"></span>
                             Aesthetic Enhancers
                        </h4>
                    </div>`;
                allSurvivors.forEach(plant => {
                    container.innerHTML += renderPlantCard(plant);
                });
            }
        }

        if (!anyResult) {
            container.innerHTML += `
                <div class="col-span-full text-center p-6 bg-red-50 rounded-xl border border-red-100">
                    <p class="text-red-500 font-bold mb-1">Conditions too harsh for plants! ⚠️</p>
                    <p class="text-xs text-red-400">
                        Current: <b>${temp}°C</b> / <b>${humidity}% Humidity</b>.<br>
                        Most plants will struggle in these conditions.<br>
                        👉 Try <strong>Snake Plant</strong> or <strong>Jade Plant</strong> (Survivors).
                    </p>
                </div>`;
        }

        updateAQILocationMode(temp, humidity, co2);
        lucide.createIcons();
    }, 600);
}

// Update gauges for LOCATION MODE (tanpa TVOC)
function updateGaugesLocationMode() {
    const { temp, humidity, co2 } = locationData;

    const cGreen = "#22c55e", cYellow = "#eab308", cRed = "#ef4444", cGray = "#9ca3af";

    updateSingleGauge('temp', temp, 18, 28, ['Cool', 'Good', 'Hot'], [cYellow, cGreen, cRed]);
    updateSingleGauge('hum', humidity, 30, 60, ['Dry', 'Ideal', 'Damp'], [cRed, cGreen, cRed]);
    updateSingleGauge('co2', co2, 800, 1500, ['Fresh', 'Stuffy', 'Poor'], [cGreen, cYellow, cRed]);

    // TVOC gauge - show as disabled/N/A
    const tvocNeedle = document.querySelector('#g-tvoc .gauge-needle');
    const tvocArc = document.querySelector('#g-tvoc .gauge-arc');
    const tvocValue = document.querySelector('#g-tvoc .gauge-value');
    const tvocStatus = document.querySelector('#g-tvoc ~ .status-text');

    if (tvocNeedle) tvocNeedle.style.transform = 'rotate(0deg)';
    if (tvocArc) tvocArc.style.background = `conic-gradient(${cGray} 0deg 180deg, transparent 180deg)`;
    if (tvocValue) tvocValue.innerText = 'N/A';
    if (tvocStatus) { tvocStatus.innerText = 'No Sensor'; tvocStatus.style.color = cGray; }

    updateAQILocationMode(temp, humidity, co2);
}

// AQI calculation for LOCATION MODE (tanpa TVOC)
function updateAQILocationMode(t, h, co2) {
    // Hanya hitung dari CO2, temp, humidity - TANPA TVOC
    let penalty = ((co2 / 2000) * 50); // CO2 lebih berpengaruh karena TVOC tidak ada
    if (t > 30 || t < 18) penalty += 15;
    if (h < 30 || h > 70) penalty += 15;

    let score = Math.round(100 - penalty);
    if (score < 0) score = 0;

    const scoreElement = document.getElementById('aqi-score');
    const statusElement = document.getElementById('aqi-status');
    const barElement = document.getElementById('aqi-bar');
    const msgElement = document.getElementById('aqi-msg');

    if (scoreElement) scoreElement.innerText = score;
    if (barElement) barElement.style.width = score + "%";

    let statusText = "Excellent", colorClass = "text-green-400", message = "Air quality looks good based on weather data.";
    if (score < 50) {
        statusText = "Poor"; colorClass = "text-red-500";
        if (barElement) barElement.className = "h-full bg-red-500 rounded-full transition-all duration-500";
        message = "Conditions may be challenging for plants.";
    } else if (score < 80) {
        statusText = "Moderate"; colorClass = "text-yellow-400";
        if (barElement) barElement.className = "h-full bg-yellow-400 rounded-full transition-all duration-500";
        message = "Air quality is okay (TVOC not measured).";
    } else {
        if (barElement) barElement.className = "h-full bg-green-500 rounded-full transition-all duration-500";
    }

    if (statusElement) { statusElement.innerText = statusText; statusElement.className = `font-medium mb-2 ${colorClass}`; }
    if (msgElement) msgElement.innerText = message + " (Location Mode)";
}

function renderPlantCard(plant) {
    const isSaved = mySavedPlants.includes(plant.id);
    const btnClass = isSaved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white';

    return `
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col h-full">
        <div class="block">
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
            ${plant.shop_link ? `<a href="${plant.shop_link}" target="_blank" class="block w-full text-center py-2 mb-2 rounded-lg font-bold text-xs transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white">Buy from Noah Garden Centre ↗</a>` : ''}
        </div>
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

async function toggleSavePlant(plantId) {
    // Check if user is logged in (firebase.js sets window.currentUser)
    if (window.currentUser) {
        const index = mySavedPlants.indexOf(plantId);
        if (index > -1) {
            await removePlantFromFirestore(plantId);
        } else {
            await savePlantToFirestore(plantId);
        }
    } else {
        // Guest mode (Session only)
        const index = mySavedPlants.indexOf(plantId);
        if (index > -1) mySavedPlants.splice(index, 1);
        else mySavedPlants.push(plantId);
    }

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

// vidaVerdeProducts is defined in data.js (load it before this script)

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
                    ${plant.shop_link ? `<a href="${plant.shop_link}" target="_blank" class="text-xs text-green-600 font-bold hover:underline">Buy from Noah Garden Centre ↗</a>` : ''}
                    <p class="text-[10px] text-gray-400 mt-1">${plant.maintenance} Maintenance</p>
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
                    <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0"><i data-lucide="sun" class="w-5 h-5 text-yellow-500"></i></div><div><h5 class="font-bold text-gray-800 text-sm">Light</h5><p class="text-sm text-gray-600">${plant.light_needs}</p></div></div>
                        <div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><i data-lucide="droplets" class="w-5 h-5 text-blue-500"></i></div><div><h5 class="font-bold text-gray-800 text-sm">Watering</h5><p class="text-sm text-gray-600">${plant.water_freq}</p></div></div>
                        <div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0"><i data-lucide="settings" class="w-5 h-5 text-green-500"></i></div><div><h5 class="font-bold text-gray-800 text-sm">Maintenance</h5><p class="text-sm text-gray-600">${plant.maintenance}</p></div></div>
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
let _analyzeTimer = null;
document.addEventListener('DOMContentLoaded', () => {
    analyzeManualData();
    updateGauges();

    const inputs = ['temp-slider', 'hum-slider', 'tvoc-slider', 'co2-slider', 'pref-light', 'pref-safety'];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                updateGauges();
                // Re-analyze recommendations when any input changes
                clearTimeout(_analyzeTimer);
                _analyzeTimer = setTimeout(() => {
                    if (currentDataMode === 'sensor') {
                        analyzeManualData();
                    }
                }, 300);
            });
        }
    });
});

// ==========================================
// 7. PLACE TYPE & QUESTIONNAIRE HANDLER
// ==========================================

function handlePlaceChange(place) {
    currentPlaceType = place;
    console.log(`Place type changed to: ${place}`);

    const badge = document.getElementById('recommendation-badge');

    if (place !== 'home') {
        if (badge) badge.innerText = `Optimized for ${place.charAt(0).toUpperCase() + place.slice(1)}`;

        // Show Questionnaire Modal for non-home selections
        showQuestionnaireModal(place);

        // Re-analyze with new place type context
        if (currentDataMode === 'sensor') analyzeManualData();
        else analyzeLocationData();
    } else {
        if (badge) badge.innerText = 'Auto-Match';
        if (currentDataMode === 'sensor') analyzeManualData();
        else analyzeLocationData();
    }
}

function showQuestionnaireModal(place) {
    const modal = document.getElementById('questionnaire-modal');
    const title = document.getElementById('quest-title');
    if (modal) {
        modal.classList.remove('hidden');
        const placeLabels = {
            'office': 'Office / Workspace',
            'school': 'School / Education Centre',
            'healthcare': 'Healthcare Facility',
            'other': 'Space'
        };
        if (title) title.innerText = `Tell us about your ${placeLabels[place] || place}`;
        lucide.createIcons();
    }
}

function closeQuestionnaireModal() {
    const modal = document.getElementById('questionnaire-modal');
    if (modal) modal.classList.add('hidden');
}

function handleQuestionnaireSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log("Questionnaire submitted:", data);

    // Close modal and provide feedback
    closeQuestionnaireModal();

    // Re-run analysis
    if (currentDataMode === 'sensor') analyzeManualData();
    else analyzeLocationData();
}