// Datenstruktur für alle Orte mit Koordinaten für Open-Meteo Wetterdaten
const surfSpots = [
    {
        id: "biarritz",
        beach: "La Grande Plage",
        location: "Biarritz",
        country: "France",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1", 
        lat: 43.4833, lon: -1.5583
    },
    {
        id: "anglet",
        beach: "Chambre D’Amour",
        location: "Anglet",
        country: "France",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1",
        lat: 43.5000, lon: -1.5333
    },
    {
        id: "matadouro",
        beach: "Praia do Matadouro",
        location: "Ericeira",
        country: "Portugal",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1",
        lat: 38.9740, lon: -9.4190
    },
    {
        id: "pescadores",
        beach: "Praia dos Pescadores",
        location: "Ericeira",
        country: "Portugal",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1",
        lat: 38.9634, lon: -9.4172
    },
    {
        id: "ribeira",
        beach: "Ribeira d’Ilhas",
        location: "Ericeira",
        country: "Portugal",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1",
        lat: 38.9880, lon: -9.4192
    },
    {
        id: "weligama",
        beach: "Weligama Bay",
        location: "Weligama",
        country: "Sri Lanka",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1",
        lat: 5.9722, lon: 80.4269
    },
    {
        id: "hb-pier",
        beach: "Pier",
        location: "Huntington Beach",
        country: "USA",
        embedUrl: "https://www.youtube.com/embed/mhQjsLBfOoY?autoplay=1&mute=1",
        lat: 33.6595, lon: -118.0038
    },
    {
        id: "dana-point",
        beach: "Doheny State Beach",
        location: "Dana Point",
        country: "USA",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1",
        lat: 33.4614, lon: -117.6875
    },
    {
        id: "cocoa-beach",
        beach: "Cocoa Beach",
        location: "Orlando",
        country: "USA",
        embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC...&autoplay=1&mute=1",
        lat: 28.3200, lon: -80.6076
    }
];

document.addEventListener("DOMContentLoaded", () => {
    buildGrid();
});

// 1. Grid generieren (Startseite)
function buildGrid() {
    const gridContainer = document.getElementById("webcam-grid");
    gridContainer.innerHTML = "";

    surfSpots.forEach(spot => {
        const card = document.createElement("div");
        card.className = "webcam-card";
        card.onclick = () => openDetailView(spot);

        card.innerHTML = `
            <div class="card-video-container">
                <iframe src="${spot.embedUrl}" frameborder="0" allow="autoplay"></iframe>
            </div>
            <div class="card-info-bar">
                ${spot.beach} | ${spot.location}, ${spot.country}
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

// 2. Detailansicht öffnen
async function openDetailView(spot) {
    document.getElementById("overview-section").classList.add("hidden");
    document.getElementById("detail-section").classList.remove("hidden");

    // Header anpassen (Ort, Land unter Logo)
    const subHeader = document.getElementById("sub-header-info");
    const locCountryText = document.getElementById("detail-location-country");
    locCountryText.textContent = `${spot.location}, ${spot.country}`;
    subHeader.classList.remove("hidden");

    // Video-Stream setzen
    document.getElementById("detail-iframe").src = spot.embedUrl;

    // Platzhalter während des Ladens
    document.getElementById("val-air").textContent = "-- °C";
    document.getElementById("val-water").textContent = "-- °C";
    document.getElementById("val-wave").textContent = "-- m";

    // Wetter- und Meerdaten über freie API abrufen
    fetchWeatherData(spot.lat, spot.lon);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. Zurück zur Übersicht
function showOverview() {
    document.getElementById("detail-section").classList.add("hidden");
    document.getElementById("overview-section").classList.remove("hidden");
    document.getElementById("sub-header-info").classList.add("hidden");

    // Iframe zurücksetzen
    document.getElementById("detail-iframe").src = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. Echte Live-Wetter- und Meeresdaten abfragen (Open-Meteo API)
async function fetchWeatherData(lat, lon) {
    try {
        // Wetter-API (Lufttemperatur)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherData = await weatherRes.json();
        
        if (weatherData.current_weather) {
            document.getElementById("val-air").textContent = `${Math.round(weatherData.current_weather.temperature)}°C`;
        }

        // Marine-API (Wellenhöhe & Wassertemperatur)
        const marineRes = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,ocean_temperature&forecast_days=1`);
        const marineData = await marineRes.json();

        if (marineData.hourly) {
            const currentHour = new Date().getHours();
            
            // Wellenhöhe
            if (marineData.hourly.wave_height) {
                const waveHeight = marineData.hourly.wave_height[currentHour] || marineData.hourly.wave_height[0];
                document.getElementById("val-wave").textContent = `${waveHeight} m`;
            }
            
            // Wassertemperatur
            if (marineData.hourly.ocean_temperature) {
                const waterTemp = marineData.hourly.ocean_temperature[currentHour] || marineData.hourly.ocean_temperature[0];
                document.getElementById("val-water").textContent = `${Math.round(waterTemp)}°C`;
            }
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Wetterdaten:", error);
    }
}
