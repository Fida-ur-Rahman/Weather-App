 // API Configuration
        const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
        const BASE_URL = 'https://api.openweathermap.org/data/2.5';
        
        // DOM Elements
        const cityInput = document.getElementById('cityInput');
        const searchBtn = document.getElementById('searchBtn');
        const celsiusBtn = document.getElementById('celsiusBtn');
        const fahrenheitBtn = document.getElementById('fahrenheitBtn');
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');
        const weatherContent = document.getElementById('weatherContent');
        const cityName = document.getElementById('cityName');
        const currentDate = document.getElementById('currentDate');
        const currentTemp = document.getElementById('currentTemp');
        const weatherIcon = document.getElementById('weatherIcon');
        const weatherDescription = document.getElementById('weatherDescription');
        const windSpeed = document.getElementById('windSpeed');
        const humidity = document.getElementById('humidity');
        const feelsLike = document.getElementById('feelsLike');
        const pressure = document.getElementById('pressure');
        const forecastList = document.getElementById('forecastList');
        
        // State
        let isCelsius = true;
        let currentWeatherData = null;
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', () => {
            // Set current date
            updateCurrentDate();
            
            // Set default city
            fetchWeatherData('London');
            
            // Event listeners
            searchBtn.addEventListener('click', () => {
                const city = cityInput.value.trim();
                if (city) {
                    fetchWeatherData(city);
                }
            });
            
            cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const city = cityInput.value.trim();
                    if (city) {
                        fetchWeatherData(city);
                    }
                }
            });
            
            celsiusBtn.addEventListener('click', () => {
                if (!isCelsius) {
                    isCelsius = true;
                    celsiusBtn.classList.add('active');
                    fahrenheitBtn.classList.remove('active');
                    updateTemperatureUnits();
                }
            });
            
            fahrenheitBtn.addEventListener('click', () => {
                if (isCelsius) {
                    isCelsius = false;
                    fahrenheitBtn.classList.add('active');
                    celsiusBtn.classList.remove('active');
                    updateTemperatureUnits();
                }
            });
        });
        
        // Update current date
        function updateCurrentDate() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDate.textContent = now.toLocaleDateString('en-US', options);
        }
        
        // Fetch weather data from API
        async function fetchWeatherData(city) {
            // Show loading, hide content and error
            loading.style.display = 'block';
            weatherContent.style.display = 'none';
            errorMessage.style.display = 'none';
            
            try {
                // Fetch current weather
                const currentWeatherResponse = await fetch(
                    `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
                );
                
                if (!currentWeatherResponse.ok) {
                    throw new Error('City not found');
                }
                
                const currentWeather = await currentWeatherResponse.json();
                
                // Fetch forecast (using dummy data for demo since API calls are limited)
                // In a real app, you would fetch from: `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
                const forecast = generateForecastData(currentWeather);
                
                // Update UI
                updateCurrentWeather(currentWeather);
                updateForecast(forecast);
                
                // Show content, hide loading
                weatherContent.style.display = 'grid';
                loading.style.display = 'none';
                
                // Store data for unit conversion
                currentWeatherData = { current: currentWeather, forecast };
                
            } catch (error) {
                console.error('Error fetching weather data:', error);
                
                // Show error message
                document.getElementById('errorText').textContent = 
                    error.message === 'City not found' 
                    ? `City "${city}" not found. Please try another city.`
                    : 'Unable to fetch weather data. Please check your connection and try again.';
                
                errorMessage.style.display = 'block';
                loading.style.display = 'none';
            }
        }
        
        // Update current weather UI
        function updateCurrentWeather(data) {
            cityName.textContent = `${data.name}, ${data.sys.country}`;
            
            // Temperature will be handled by updateTemperatureUnits
            const temp = Math.round(data.main.temp);
            const feelsLikeTemp = Math.round(data.main.feels_like);
            
            // Set temperature data attributes for unit conversion
            currentTemp.setAttribute('data-celsius', temp);
            feelsLike.setAttribute('data-celsius', feelsLikeTemp);
            
            // Update temperature display based on current unit
            updateTemperatureDisplay();
            
            // Weather condition
            const weather = data.weather[0];
            weatherDescription.textContent = weather.description;
            
            // Weather icon
            const iconClass = getWeatherIconClass(weather.id, data.dt);
            weatherIcon.className = `fas ${iconClass}`;
            
            // Other details
            windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
            humidity.textContent = `${data.main.humidity}%`;
            pressure.textContent = `${data.main.pressure} hPa`;
        }
        
        // Update forecast UI
        function updateForecast(forecastData) {
            forecastList.innerHTML = '';
            
            forecastData.forEach(day => {
                const forecastDay = document.createElement('div');
                forecastDay.className = 'forecast-day';
                
                const dayInfo = document.createElement('div');
                dayInfo.className = 'day-info';
                
                const dayIcon = document.createElement('div');
                dayIcon.className = 'day-icon';
                dayIcon.innerHTML = `<i class="fas ${getWeatherIconClass(day.weatherId, null, true)}"></i>`;
                
                const dayText = document.createElement('div');
                dayText.className = 'day-text';
                
                const dayName = document.createElement('div');
                dayName.className = 'day-name';
                dayName.textContent = day.day;
                
                const dayCondition = document.createElement('div');
                dayCondition.className = 'day-condition';
                dayCondition.textContent = day.condition;
                
                dayText.appendChild(dayName);
                dayText.appendChild(dayCondition);
                
                dayInfo.appendChild(dayIcon);
                dayInfo.appendChild(dayText);
                
                const dayTemp = document.createElement('div');
                dayTemp.className = 'day-temp';
                dayTemp.setAttribute('data-celsius-high', day.tempHigh);
                dayTemp.setAttribute('data-celsius-low', day.tempLow);
                dayTemp.textContent = `${day.tempHigh}°C / ${day.tempLow}°C`;
                
                forecastDay.appendChild(dayInfo);
                forecastDay.appendChild(dayTemp);
                
                forecastList.appendChild(forecastDay);
            });
            
            // Update temperatures based on current unit
            updateTemperatureUnits();
        }
        
        // Generate forecast data (for demo purposes)
        function generateForecastData(currentWeather) {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const conditions = [
                { id: 800, desc: 'Sunny' },
                { id: 801, desc: 'Partly Cloudy' },
                { id: 802, desc: 'Cloudy' },
                { id: 500, desc: 'Light Rain' },
                { id: 600, desc: 'Snow' },
                { id: 701, desc: 'Mist' },
                { id: 300, desc: 'Drizzle' }
            ];
            
            const forecast = [];
            const today = new Date();
            
            // Generate 5-day forecast
            for (let i = 1; i <= 5; i++) {
                const nextDay = new Date(today);
                nextDay.setDate(today.getDate() + i);
                const dayIndex = nextDay.getDay();
                
                // Randomize conditions for demo
                const condition = conditions[Math.floor(Math.random() * conditions.length)];
                
                // Generate random temperatures based on current weather
                const baseTemp = currentWeather.main.temp;
                const tempHigh = Math.round(baseTemp + Math.random() * 5);
                const tempLow = Math.round(baseTemp - Math.random() * 5);
                
                forecast.push({
                    day: days[dayIndex],
                    condition: condition.desc,
                    weatherId: condition.id,
                    tempHigh,
                    tempLow
                });
            }
            
            return forecast;
        }
        
        // Update temperature units
        function updateTemperatureUnits() {
            updateTemperatureDisplay();
            updateForecastTemperatures();
        }
        
        // Update temperature display for current weather
        function updateTemperatureDisplay() {
            if (!currentWeatherData) return;
            
            const currentTempCelsius = parseInt(currentTemp.getAttribute('data-celsius'));
            const feelsLikeCelsius = parseInt(feelsLike.getAttribute('data-celsius'));
            
            if (isCelsius) {
                currentTemp.textContent = `${currentTempCelsius}°C`;
                feelsLike.textContent = `${feelsLikeCelsius}°C`;
            } else {
                const currentTempFahrenheit = celsiusToFahrenheit(currentTempCelsius);
                const feelsLikeFahrenheit = celsiusToFahrenheit(feelsLikeCelsius);
                currentTemp.textContent = `${currentTempFahrenheit}°F`;
                feelsLike.textContent = `${feelsLikeFahrenheit}°F`;
            }
        }
        
        // Update forecast temperatures
        function updateForecastTemperatures() {
            const forecastTemps = document.querySelectorAll('.day-temp');
            
            forecastTemps.forEach(tempEl => {
                const highCelsius = parseInt(tempEl.getAttribute('data-celsius-high'));
                const lowCelsius = parseInt(tempEl.getAttribute('data-celsius-low'));
                
                if (isCelsius) {
                    tempEl.textContent = `${highCelsius}°C / ${lowCelsius}°C`;
                } else {
                    const highFahrenheit = celsiusToFahrenheit(highCelsius);
                    const lowFahrenheit = celsiusToFahrenheit(lowCelsius);
                    tempEl.textContent = `${highFahrenheit}°F / ${lowFahrenheit}°F`;
                }
            });
        }
        
        // Convert Celsius to Fahrenheit
        function celsiusToFahrenheit(celsius) {
            return Math.round((celsius * 9/5) + 32);
        }
        
        // Get weather icon class based on weather condition code
        function getWeatherIconClass(weatherId, timestamp = null, isDaytime = true) {
            // Determine if it's day or night
            let isDay = true;
            if (timestamp) {
                const date = new Date(timestamp * 1000);
                const hours = date.getHours();
                isDay = hours > 6 && hours < 20;
            } else if (isDaytime !== null) {
                isDay = isDaytime;
            }
            
            // Clear
            if (weatherId === 800) {
                return isDay ? 'fa-sun' : 'fa-moon';
            }
            
            // Clouds
            if (weatherId >= 801 && weatherId <= 804) {
                return isDay ? 'fa-cloud-sun' : 'fa-cloud-moon';
            }
            
            // Rain
            if (weatherId >= 500 && weatherId <= 531) {
                return 'fa-cloud-rain';
            }
            
            // Snow
            if (weatherId >= 600 && weatherId <= 622) {
                return 'fa-snowflake';
            }
            
            // Thunderstorm
            if (weatherId >= 200 && weatherId <= 232) {
                return 'fa-bolt';
            }
            
            // Atmosphere (mist, fog, etc.)
            if (weatherId >= 701 && weatherId <= 781) {
                return 'fa-smog';
            }
            
            // Default
            return 'fa-cloud';
        }
        
        // For demo purposes: If no API key is provided, use mock data
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            // Override fetchWeatherData to use mock data for demo
            const originalFetchWeatherData = fetchWeatherData;
            
            fetchWeatherData = function(city) {
                loading.style.display = 'block';
                weatherContent.style.display = 'none';
                errorMessage.style.display = 'none';
                
                // Simulate API delay
                setTimeout(() => {
                    // Mock current weather data
                    const mockCurrentWeather = {
                        name: city,
                        sys: { country: 'UK' },
                        main: {
                            temp: 18,
                            feels_like: 17,
                            humidity: 65,
                            pressure: 1013
                        },
                        weather: [{ id: 800, description: 'Sunny' }],
                        wind: { speed: 3.3 }, // m/s
                        dt: Date.now() / 1000
                    };
                    
                    // Mock forecast data
                    const mockForecast = generateForecastData(mockCurrentWeather);
                    
                    // Update UI
                    updateCurrentWeather(mockCurrentWeather);
                    updateForecast(mockForecast);
                    
                    // Show content, hide loading
                    weatherContent.style.display = 'grid';
                    loading.style.display = 'none';
                    
                    // Store data for unit conversion
                    currentWeatherData = { current: mockCurrentWeather, forecast: mockForecast };
                }, 800);
            };
            
            // Add note about API key
            const searchContainer = document.querySelector('.search-container');
            const apiNote = document.createElement('div');
            apiNote.style.cssText = 'font-size: 0.85rem; color: #666; margin-top: 8px; text-align: center;';
            apiNote.innerHTML = '<i class="fas fa-info-circle"></i> Using demo data. For real weather data, add your <a href="https://openweathermap.org/api" target="_blank">OpenWeatherMap API key</a>.';
            searchContainer.parentNode.insertBefore(apiNote, searchContainer.nextSibling);
        }
