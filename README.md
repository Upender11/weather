# Weather Forecast Application

A modern, responsive weather application that provides current weather data and forecasts with an interactive interface.



## Features

- **Real-time Weather Data**: Get current weather information for any city worldwide
- **7-Day Forecast**: View weather forecasts including:
  - Past 3 days historical data
  - Current day weather
  - Future 3 days forecast
- **Interactive Graph**: 
  - 24-hour temperature visualization
  - Hover effects for detailed information
  - Weather condition descriptions
- **Weather Details**:
  - Temperature in Celsius
  - Humidity percentage
  - Wind speed
  - Weather conditions with icons
- **Auto-Refresh**: Weather data automatically updates every hour
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) for temperature graphs
- [Font Awesome](https://fontawesome.com/) for weather icons
- [OpenWeatherMap API](https://openweathermap.org/api) for weather data

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/Upender11/weather.git
cd weather
```

2. Get your API key:
- Sign up at [OpenWeatherMap](https://openweathermap.org/)
- Generate an API key
- Replace the apiKey in `index.js`:
```javascript
const apiKey = "YOUR_API_KEY";
```

3. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

## Usage

1. Enter a city name in the search box
2. Press Enter or click the search button
3. View current weather and forecast data
4. Click on different days to view detailed hourly forecasts
5. Hover over the graph points to see detailed temperature and weather information

## Features in Detail

### Current Weather
- Large temperature display
- City name
- Weather condition icon
- Humidity and wind speed

### Weekly Forecast
- 7-day view with dates
- Temperature for each day
- Weather condition icons
- Interactive selection for detailed view

### Temperature Graph
- 24-hour temperature progression
- Interactive tooltips showing:
  - Exact time
  - Temperature in Celsius
  - Weather description
- Smooth transitions and hover effects

## Responsive Design

The application is fully responsive and adapts to different screen sizes:
- Desktop: Full-width display with side-by-side forecast and graph
- Mobile: Stacked layout for better readability on smaller screens

## Error Handling

- Invalid city names show an error message
- Network errors are caught and logged
- Graceful fallbacks for missing data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Graphs powered by [Chart.js](https://www.chartjs.org/)
