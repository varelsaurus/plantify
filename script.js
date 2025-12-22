// ==========================================
// 🌿 PLANTIFY INTELLIGENCE ENGINE (script.js)
// ==========================================

const GROQ_API_KEY = ""; 
let mySavedPlants = []; 

// Database Tanaman
const plantDatabase = [
    {
        id: 'snake_plant',
        name: 'Snake Plant',
        scientific: 'Dracaena trifasciata',
        tags: ['removes_co2', 'low_light', 'cam_photosynthesis', 'bedroom_friendly', 'removes_tvoc'],
        toxicity: true,
        light_needs: 'Low to High',
        maintenance: 'Very Easy',
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
        toxicity: false,
        light_needs: 'Bright Indirect',
        maintenance: 'High',
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
        toxicity: true, 
        light_needs: 'Low to Medium',
        maintenance: 'Medium',
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
        toxicity: false,
        light_needs: 'Bright, Indirect',
        maintenance: 'Medium',
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
        toxicity: true,
        light_needs: 'Medium to Bright',
        maintenance: 'Easy',
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
        toxicity: true,
        light_needs: 'Medium',
        maintenance: 'Medium',
        price: 'S$ 12.00',
        efficiency: 'Mold Fighter',
        image: 'assets/english_ivy.jpg',
        shop_link: 'https://tokopedia.com/search?q=english+ivy'
    }
];

// ==========================================
// 🧭 NAVIGATION & UI LOGIC
// ==========================================

function switchPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + pageId).classList.add('active');
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById('page-' + pageId);
    if(targetPage) {
        targetPage.style.opacity = '0';
        targetPage.style.transform = 'translateY(10px)';
        setTimeout(() => {
            targetPage.classList.add('active');
            targetPage.style.opacity = '1';
            targetPage.style.transform = 'translateY(0)';
        }, 50);
    }
    document.getElementById('page-title').innerText = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    if(pageId === 'myplants') renderMyPlantsPage();
    if(pageId === 'careguide') renderCareGuidePage();
}

function toggleSavePlant(plantId) {
    const index = mySavedPlants.indexOf(plantId);
    if (index > -1) mySavedPlants.splice(index, 1);
    else mySavedPlants.push(plantId);
    
    // Update button di dashboard
    const btn = document.getElementById(`btn-save-${plantId}`);
    if(btn) updateSaveButton(btn, mySavedPlants.includes(plantId));
    
    // Refresh page jika sedang aktif
    if(document.getElementById('page-myplants').classList.contains('active')) renderMyPlantsPage();
    if(document.getElementById('page-careguide').classList.contains('active')) renderCareGuidePage();
}

function updateSaveButton(btn, isSaved) {
    if(isSaved) {
        btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 inline"></i> Added`;
        btn.className = "w-full py-2 rounded-lg font-bold text-sm transition-colors bg-green-100 text-green-700";
    } else {
        btn.innerHTML = `<i data-lucide="plus" class="w-4 h-4 inline"></i> Add to My Plants`;
        btn.className = "w-full py-2 rounded-lg font-bold text-sm transition-colors bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white";
    }
    lucide.createIcons();
}

// ==========================================
// 📊 GAUGE & SLIDER LOGIC (CORE UPDATE)
// ==========================================

function updateGauges() {
    // 1. Ambil Nilai dari 4 Slider
    // PERBAIKAN: Mengambil ID yang benar dari HTML kamu
    const temp = parseInt(document.getElementById('temp-slider').value);
    const hum = parseInt(document.getElementById('hum-slider').value);
    const tvoc = parseInt(document.getElementById('tvoc-slider').value);
    const co2 = parseInt(document.getElementById('co2-slider').value);

    // 2. Update Text Angka di Samping Slider
    document.getElementById('val-temp').innerText = temp + "°C";
    document.getElementById('val-hum').innerText = hum + "%";
    document.getElementById('val-tvoc').innerText = tvoc + " ppb";
    document.getElementById('val-co2').innerText = co2 + " ppm";

    // 3. Update Text Angka di Bawah Gauge (Jarum)
    // Query selector ini mencari div .gauge-value di dalam ID parent (misal #g-temp)
    document.querySelector('#g-temp .gauge-value').innerText = temp;
    document.querySelector('#g-hum .gauge-value').innerText = hum;
    document.querySelector('#g-tvoc .gauge-value').innerText = tvoc;
    document.querySelector('#g-co2 .gauge-value').innerText = co2;

    // 4. Definisi Warna
    const cGreen = "#22c55e"; // safe
    const cYellow = "#eab308"; // warning
    const cRed = "#ef4444";    // danger

    // 5. Update Jarum (Rotation) & Warna
    updateSingleGauge('temp', temp, 18, 28, ['Cool', 'Good', 'Hot'], [cYellow, cGreen, cRed]); 
    updateSingleGauge('hum', hum, 30, 60, ['Dry', 'Ideal', 'Damp'], [cRed, cGreen, cRed]); 
    updateSingleGauge('tvoc', tvoc, 200, 600, ['Safe', 'Mod', 'High'], [cGreen, cYellow, cRed]);
    updateSingleGauge('co2', co2, 800, 1500, ['Fresh', 'Stuffy', 'Poor'], [cGreen, cYellow, cRed]);
    
    // 6. Update Score Utama (Kartu Gelap)
    updateAQI(temp, hum, tvoc, co2);
}

function updateAQI(t, h, tvoc, co2) {
    // Hitung rata-rata penalti (Simplifikasi)
    // Semakin tinggi TVOC/CO2, score makin turun
    let penalty = ((tvoc/1000)*30) + ((co2/2000)*30);
    // Suhu/Hum ekstrem juga kurangi score
    if(t > 30 || t < 18) penalty += 10;
    if(h < 30 || h > 70) penalty += 10;

    let score = Math.round(100 - penalty);
    if (score < 0) score = 0;

    const scoreElement = document.getElementById('aqi-score');
    const statusElement = document.getElementById('aqi-status');
    const barElement = document.getElementById('aqi-bar');
    const msgElement = document.getElementById('aqi-msg');

    if(scoreElement) scoreElement.innerText = score;
    if(barElement) barElement.style.width = score + "%";

    let statusText = "Excellent", colorClass = "text-green-400", message = "Air is clean.";
    
    if (score < 50) { 
        statusText = "Poor"; 
        colorClass = "text-red-500"; 
        if(barElement) barElement.className = "h-full bg-red-500 rounded-full transition-all duration-500";
        message = "Attention! High pollution detected."; 
    }
    else if (score < 80) { 
        statusText = "Moderate"; 
        colorClass = "text-yellow-400"; 
        if(barElement) barElement.className = "h-full bg-yellow-400 rounded-full transition-all duration-500";
        message = "Air quality is okay, but could be better."; 
    } else {
        if(barElement) barElement.className = "h-full bg-green-500 rounded-full transition-all duration-500";
    }

    if(statusElement) { statusElement.innerText = statusText; statusElement.className = `font-medium mb-2 ${colorClass}`; }
    if(msgElement) msgElement.innerText = message;
}

function updateSingleGauge(id, val, limit1, limit2, texts, colors) {
    const needle = document.querySelector(`#g-${id} .gauge-needle`);
    const arc = document.querySelector(`#g-${id} .gauge-arc`);
    const statusText = document.querySelector(`#g-${id} ~ .status-text`);

    let deg = -90, color = colors[0], status = texts[0];

    // Logika Derajat Putaran Jarum (-90 kiri, 0 tegak, 90 kanan)
    if (val <= limit1) {
        color = colors[0]; status = texts[0]; 
        deg = -90 + (val / limit1) * 60; // Naik pelan di zona aman
    } else if (val > limit1 && val <= limit2) {
        color = colors[1]; status = texts[1]; 
        deg = -30 + ((val - limit1) / (limit2 - limit1)) * 60;
    } else {
        color = colors[2]; status = texts[2]; 
        deg = 30 + ((val - limit2) / limit2) * 60;
        if(deg > 90) deg = 90;
    }

    // Exception: Humidity (Kurva Terbalik: Rendah = Bahaya, Tengah = Bagus, Tinggi = Bahaya)
    if(id === 'hum') { 
        if(val < 30) { color = colors[0]; status = texts[0]; deg = -90 + (val/30)*60; }
        else if(val <= 60) { color = colors[1]; status = texts[1]; deg = 0; }
        else { color = colors[2]; status = texts[2]; deg = 45; }
    }

    if(needle) needle.style.transform = `rotate(${deg}deg)`;
    
    if(arc) {
        // Gradient background statis
        if(id === 'hum') 
            arc.style.background = `conic-gradient(${colors[0]} 0deg 60deg, ${colors[1]} 60deg 120deg, ${colors[2]} 120deg 180deg, transparent 180deg)`;
        else
            arc.style.background = `conic-gradient(${colors[0]} 0deg 60deg, ${colors[1]} 60deg 120deg, ${colors[2]} 120deg 180deg, transparent 180deg)`;
    }

    if(statusText) {
        statusText.innerText = status;
        statusText.style.color = color;
    }
}

// ==========================================
// 🧠 ANALYSIS LOGIC
// ==========================================

function analyzeManualData() {
    // Tampilkan Loading
    const container = document.getElementById('recommendation-container');
    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 animate-pulse">
            <i data-lucide="loader-2" class="w-8 h-8 animate-spin mb-3 text-green-600"></i>
            <p>Analyzing plant matches...</p>
        </div>
    `;
    lucide.createIcons();

    // Delay 500ms biar kelihatan loadingnya
    setTimeout(() => {
        const temp = parseInt(document.getElementById('temp-slider').value);
        const hum = parseInt(document.getElementById('hum-slider').value);
        const tvoc = parseInt(document.getElementById('tvoc-slider').value);
        const co2 = parseInt(document.getElementById('co2-slider').value);
        const light = document.getElementById('pref-light').value;
        const safety = document.getElementById('pref-safety').value;

        let filtered = plantDatabase.filter(plant => {
            if (safety === 'Yes' && plant.toxicity === true) return false;
            
            let score = 0;
            if (temp > 28 && (plant.tags.includes('removes_heat') || plant.tags.includes('cooling'))) score += 2;
            if (hum < 40 && plant.tags.includes('humidifier')) score += 3;
            if (hum > 70 && plant.tags.includes('removes_mold')) score += 3;
            if (tvoc > 300 && (plant.tags.includes('removes_tvoc'))) score += 3;
            if (co2 > 1000 && (plant.tags.includes('removes_co2') || plant.tags.includes('cam_photosynthesis'))) score += 3;
            if (light === 'Low' && plant.light_needs.includes('Low')) score += 1;
            if (light === 'Bright' && plant.light_needs.includes('Bright')) score += 1;

            plant.tempScore = score;
            return score > 0;
        });

        filtered.sort((a, b) => b.tempScore - a.tempScore);
        renderPlants(filtered.slice(0, 4)); 
    }, 500);
}

function renderPlants(plants) {
    const container = document.getElementById('recommendation-container');
    container.innerHTML = ''; 

    if(plants.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">No specific match. Try adjusting sliders or preferences.</p>`;
        return;
    }

    plants.forEach(plant => {
        const isSaved = mySavedPlants.includes(plant.id);
        const btnClass = isSaved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-600 hover:text-white';
        const btnText = isSaved ? '<i data-lucide="check" class="w-4 h-4 inline"></i> Added' : '<i data-lucide="plus" class="w-4 h-4 inline"></i> Add to My Plants';

        const card = `
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col h-full">
                <a href="${plant.shop_link}" target="_blank" class="block">
                    <div class="relative overflow-hidden rounded-xl mb-4">
                        <img src="${plant.image}" alt="${plant.name}" class="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                            <p class="text-white text-xs font-medium flex items-center gap-1">
                                <i data-lucide="zap" class="w-3 h-3 text-yellow-400"></i> ${plant.efficiency}
                            </p>
                        </div>
                    </div>
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-bold text-gray-800 text-lg">${plant.name}</h4>
                            <p class="text-xs text-gray-500 italic">${plant.scientific}</p>
                        </div>
                        <span class="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">${plant.price}</span>
                    </div>
                </a>
                <div class="mt-auto pt-3 border-t border-gray-50">
                    <button id="btn-save-${plant.id}" onclick="toggleSavePlant('${plant.id}')" class="w-full py-2 rounded-lg font-bold text-sm transition-colors ${btnClass}">${btnText}</button>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
    lucide.createIcons();
}

// 📌 SMART CHAT LOGIC
function askAIAboutCurrentStats() {
    const temp = document.getElementById('temp-slider').value;
    const hum = document.getElementById('hum-slider').value;
    const tvoc = document.getElementById('tvoc-slider').value;
    const co2 = document.getElementById('co2-slider').value;

    if (!isChatOpen) toggleChat();

    const prompt = `My room stats: Temp ${temp}°C, Humidity ${hum}%, TVOC ${tvoc}ppb, CO2 ${co2}ppm. What plants do you recommend and why?`;
    
    const chatInput = document.getElementById('chat-input');
    chatInput.value = prompt;
    document.getElementById('chat-send-btn').click();
}

// ... (renderMyPlantsPage & renderCareGuidePage) ...
// (Bagian ini tidak berubah, gunakan yang sudah ada)
const vidaVerdeProducts = [
    { name: "Nature's Defender", desc: "Pest Control Spray", icon: "shield-check", color: "text-red-500", bg: "bg-red-50", link: "https://shopee.sg/Nature's-Defender-Garden-Pest-Control-Spray-all-natural-poison-free-for-plant-pests-and-insects-Vidaverde-300ml-i.481505002.10946631746" },
    { name: "Tweetmint Cleaner", desc: "Enzyme Cleaner", icon: "sparkles", color: "text-teal-500", bg: "bg-teal-50", link: "https://shopee.sg/Tweetmint-Enzyme-Cleaner-safe-non-toxic-all-in-one-cleaner-hypoallergenic-biodegradable-Vidaverde-i.481505002.13507041095" },
    { name: "Ocean Solution", desc: "Plant Mineraliser", icon: "droplet", color: "text-blue-500", bg: "bg-blue-50", link: "https://www.vidaverde-ipl.sg/mineraliser" },
    { name: "SERAMIX Potting Mix", desc: "Premium Soil", icon: "layers", color: "text-amber-600", bg: "bg-amber-50", link: "https://shopee.sg/SERAMIX-Premium-Semi-Hydro-Potting-Mix-For-Houseplants-Edibles-Can-Soil-Amendment-Vidaverde-International-i.481505002.20347239405" }
];

function renderMyPlantsPage() {
    const container = document.getElementById('myplants-container');
    container.innerHTML = '';
    if(mySavedPlants.length === 0) {
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
        if(!plant) return;
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
    container.innerHTML = '';
    if(mySavedPlants.length === 0) {
        container.innerHTML += `<div class="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-dashed border-gray-300 mb-8"><i data-lucide="book" class="w-10 h-10 text-gray-300 mb-4"></i><p class="text-gray-400 font-medium">Add plants to see guides.</p></div>`;
    } else {
        mySavedPlants.forEach(id => {
            const plant = plantDatabase.find(p => p.id === id);
            if(!plant) return;
            const card = `<div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8">
                    <div class="h-40 bg-cover bg-center relative" style="background-image: url('${plant.image}');">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6"><div><h3 class="text-2xl font-bold text-white">${plant.name}</h3></div></div>
                    </div>
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0"><i data-lucide="sun" class="w-5 h-5 text-yellow-500"></i></div><div><h5 class="font-bold text-gray-800 text-sm">Light</h5><p class="text-sm text-gray-600">${plant.light_needs}</p></div></div>
                        <div class="flex gap-4"><div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><i data-lucide="droplets" class="w-5 h-5 text-blue-500"></i></div><div><h5 class="font-bold text-gray-800 text-sm">Watering</h5><p class="text-sm text-gray-600">${plant.maintenance}</p></div></div>
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

    // PERBAIKAN UTAMA: List ID harus sesuai dengan HTML
    const inputs = ['temp-slider', 'hum-slider', 'tvoc-slider', 'co2-slider', 'pref-light', 'pref-safety'];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('input', () => {
                // Saat slider gerak, update Text & Jarum saja. Tanaman tidak berubah.
                updateGauges(); 
            });
        }
    });
});