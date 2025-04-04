console.log("hello");

const input = document.querySelector(".search input");
const btn = document.querySelector(".search button");
const weather_icon = document.querySelector(".w-icon");
const weekDays = document.querySelector(".week-days");
let weatherChart = null;
let lastSearchedCity = "";

const apiKey = "927dc538925597f1f250b3c6ff754af3";
const api = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastApi = "https://api.openweathermap.org/data/2.5/forecast?q=";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Function to handle search
function handleSearch() {
    if (input.value.trim() !== "") {
        lastSearchedCity = input.value.trim();
        getWeather(lastSearchedCity);
    }
}

// Function to auto refresh weather data
function setupAutoRefresh() {
    setInterval(() => {
        if (lastSearchedCity) {
            console.log("Auto-refreshing weather data...");
            getWeather(lastSearchedCity);
        }
    }, 3600000); // Every hour
}

// Event listener for Enter key
input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

// Event listener for search button
btn.addEventListener("click", handleSearch);

async function getWeather(city) {
    try {
        const response = await fetch(api + city + `&appid=${apiKey}`);
        
        if (response.status === 404) {
            document.querySelector(".error").style.display = "block";
            document.querySelector(".weather").style.display = "none";
            return;
        }

        const data = await response.json();
        if (!data || !data.main) {
            console.error("Invalid weather data received.");
            return;
        }

        updateCurrentWeather(data);
        await getForecast(city);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Start auto-refresh when the page loads
setupAutoRefresh();

function updateCurrentWeather(data) {
    if (!data || !data.main || !data.weather) return;

    document.querySelector(".city").innerHTML = data.name || "Unknown";
    document.querySelector(".temp").innerHTML = Math.round((data.main.temp || 273) - 273) + "°C";
    document.querySelector(".humidity").innerHTML = (data.main.humidity || 0) + "%";
    document.querySelector(".wind").innerHTML = (data.wind.speed || 0) + " km/h";

    const weatherMain = data.weather[0]?.main || "Clear";
    updateWeatherIcon(weatherMain);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}

async function getForecast(city) {
    try {
        const geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const geoData = await geoResponse.json();
        
        if (!geoData.length) {
            throw new Error('City not found');
        }

        const { lat, lon } = geoData[0];

        // Get forecast data
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        const forecastData = await forecastResponse.json();

        // Get current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        const currentData = await currentResponse.json();

        if (!forecastData.list || !currentData.main) {
            console.error("Error fetching forecast data.");
            return;
        }

        // Process forecast data
        const processedData = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Add past 3 days
        for (let i = 3; i > 0; i--) {
            const pastDate = new Date(today);
            pastDate.setDate(today.getDate() - i);
            
            // Create more realistic past weather data
            const pastTemp = currentData.main.temp + (Math.random() * 6 - 3); // Wider variation ±3°
            const weatherTypes = ['clear', 'clouds', 'rain'];
            const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            
            processedData.push({
                dt: Math.floor(pastDate.getTime() / 1000),
                main: {
                    temp: pastTemp,
                    temp_min: pastTemp - 5,
                    temp_max: pastTemp + 5
                },
                weather: [{
                    main: randomWeather.charAt(0).toUpperCase() + randomWeather.slice(1),
                    description: `${randomWeather} weather`
                }]
            });
        }

        // Add current day
        processedData.push(currentData);

        // Add future days (up to 3)
        const seenDates = new Set([today.toDateString()]);
        let futureCount = 0;

        forecastData.list.forEach(item => {
            const itemDate = new Date(item.dt * 1000);
            const dateStr = itemDate.toDateString();

            if (!seenDates.has(dateStr) && itemDate > today && futureCount < 3) {
                seenDates.add(dateStr);
                processedData.push(item);
                futureCount++;
            }
        });

        // Sort the data by date
        processedData.sort((a, b) => a.dt - b.dt);

        // Update the UI
        updateWeeklyForecast(processedData);
        updateDailyGraphForDay(currentData, true);

    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

function updateWeatherIcon(weatherMain) {
    const iconElement = document.querySelector('.weather-icon');
    if (!iconElement) return;

    iconElement.className = 'fas weather-icon ' + getWeatherIcon(weatherMain);
}

function getWeatherIcon(weatherMain) {
    switch (weatherMain.toLowerCase()) {
        case "clouds": return "fa-cloud";
        case "clear": return "fa-sun";
        case "rain": return "fa-cloud-rain";
        case "drizzle": return "fa-cloud-rain";
        case "mist": return "fa-smog";
        case "snow": return "fa-snowflake";
        case "thunderstorm": return "fa-bolt";
        default: return "fa-cloud";
    }
}

function getWeatherVariations(condition) {
    const variations = {
        clear: { maxVariation: 6, minVariation: -4, peakHour: 14 },
        clouds: { maxVariation: 4, minVariation: -3, peakHour: 13 },
        rain: { maxVariation: 2, minVariation: -2, peakHour: 12 },
        drizzle: { maxVariation: 2, minVariation: -2, peakHour: 12 },
        thunderstorm: { maxVariation: 1, minVariation: -3, peakHour: 15 },
        snow: { maxVariation: 2, minVariation: -5, peakHour: 13 },
        default: { maxVariation: 4, minVariation: -3, peakHour: 14 }
    };

    return variations[condition] || variations.default;
}

function updateWeeklyForecast(forecast) {
    weekDays.innerHTML = "";

    forecast.forEach((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const temp = Math.round(day.main.temp - 273);
        const weatherIcon = getWeatherIcon(day.weather[0].main);
        const isToday = new Date().toDateString() === date.toDateString();

        const dayElement = document.createElement('div');
        dayElement.className = `week-day${isToday ? ' today' : ''}`;
        dayElement.innerHTML = `
            <p>${dayName}</p>
            <p>${date.getDate()} ${monthName}</p>
            <i class="fas ${weatherIcon}"></i>
            <p>${temp}°C</p>
        `;

        dayElement.addEventListener('click', () => {
            document.querySelectorAll('.week-day').forEach(el => {
                el.classList.remove('active');
            });
            dayElement.classList.add('active');
            updateDailyGraphForDay(day, isToday);
        });

        weekDays.appendChild(dayElement);
    });
}

function updateDailyGraphForDay(dayData, isToday) {
    try {
        const canvas = document.getElementById('weatherChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }

        if (weatherChart) {
            weatherChart.destroy();
        }

        const hourlyData = generateHourlyData(dayData);
        const date = new Date(dayData.dt * 1000);
        const dateStr = `${date.getDate()} ${months[date.getMonth()]}`;
        
        const graphTitle = document.querySelector('.daily-graph h3');
        graphTitle.textContent = `Temperature Forecast - ${dateStr}`;

        const labels = hourlyData.map(item => {
            const date = new Date(item.dt * 1000);
            return `${date.getHours().toString().padStart(2, '0')}:00`;
        });

        const temperatures = hourlyData.map(item => Math.round(item.main.temp * 10) / 10);

        weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 15,
                        displayColors: false,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        callbacks: {
                            title: function(context) {
                                return `Time: ${context[0].label}`;
                            },
                            label: function(context) {
                                const hourData = hourlyData[context.dataIndex];
                                return [
                                    `Temperature: ${context.parsed.y}°C`,
                                    `Weather: ${hourData.weather[0].description}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 12
                            },
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error in updateDailyGraphForDay:', error);
    }
}

function generateHourlyData(dayData) {
    const hourlyData = [];
    const baseTemp = dayData.main.temp - 273; // Convert to Celsius
    const date = new Date(dayData.dt * 1000);
    date.setHours(0, 0, 0, 0);

    const weatherCondition = dayData.weather[0].main.toLowerCase();
    const { maxVariation, minVariation, peakHour } = getWeatherVariations(weatherCondition);

    // Check if it's a past day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDay = date < today;

    // Generate hourly temperatures with more realistic variations
    for (let hour = 0; hour < 24; hour++) {
        let tempVariation;
        if (isPastDay) {
            // Create more natural variations for past days
            const hourProgress = hour / 24;
            const baseVariation = Math.sin(hourProgress * Math.PI) * 5; // Natural day/night cycle
            const randomNoise = (Math.random() * 2 - 1); // Add some randomness
            tempVariation = baseVariation + randomNoise;
        } else {
            tempVariation = calculateTempVariation(hour, minVariation, maxVariation, peakHour);
        }

        const hourDate = new Date(date);
        hourDate.setHours(hour);

        hourlyData.push({
            dt: hourDate.getTime() / 1000,
            main: {
                temp: baseTemp + tempVariation
            },
            weather: [{
                main: dayData.weather[0].main,
                description: dayData.weather[0].description
            }]
        });
    }

    return hourlyData;
}

function calculateTempVariation(hour, minVariation, maxVariation, peakHour) {
    if (hour < 6) {
        return minVariation * (1 - hour/6) + (minVariation/2) * (hour/6);
    } else if (hour < peakHour) {
        const progress = (hour - 6) / (peakHour - 6);
        return minVariation/2 + (maxVariation - minVariation/2) * progress;
    } else if (hour < 19) {
        const progress = (hour - peakHour) / (19 - peakHour);
        return maxVariation - (maxVariation + minVariation/2) * progress;
    } else {
        const progress = (hour - 19) / 5;
        return (minVariation/2) - (minVariation/2) * progress;
    }
}
