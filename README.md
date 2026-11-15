# cosmic-byte
Project repository for Team Cosmic Byte participating in the NASA International Space Apps Challenge. 
# GEO DETECTIVE

GEO DETECTIVE is a web application for exploring and analyzing environmental data using NASA Earth science datasets. It allows users to examine historical environmental trends, compare different environmental variables, and investigate relationships between environmental measurements.

The goal of this project is to make environmental data easier to explore and understand by providing an interactive platform for data retrieval, statistical analysis, and visualization.

## Features

### Trend Analysis

Users can select a location, an environmental variable, and a study period to examine how that variable has changed over time. The application retrieves the relevant NASA measurements and presents the results through charts and statistical summaries.

### Relationship Analysis

Users can investigate the relationship between two environmental variables. The application calculates their Pearson correlation coefficient and presents the strength and direction of the statistical relationship.

### Related Variable Discovery

Users can explore other environmental measurements that may be related to a selected variable. The application compares the selected variable with other available measurements and ranks the results according to the absolute strength of their detrended Pearson correlations.

Users can select any discovered variable to examine its relationship with the original variable in more detail.

### Environmental Explanation

This feature helps users investigate environmental patterns by examining relationships between relevant measurements. It presents statistical results and related variables to provide a broader understanding of the selected environmental factor.

## Data Source

GEO DETECTIVE uses environmental measurements provided through NASA Earth science data services.

Examples of environmental measurements include:

| Variable | Description |
|---|---|
| T2M | Temperature at 2 meters |
| T2M_MAX | Maximum temperature at 2 meters |
| T2M_MIN | Minimum temperature at 2 meters |
| PRECTOTCORR | Corrected precipitation |
| RH2M | Relative humidity at 2 meters |
| T2MDEW | Dew point temperature |
| ALLSKY_SFC_SW_DWN | All-sky surface shortwave downward irradiance |
| WS10M | Wind speed at 10 meters |
| QV2M | Specific humidity at 2 meters |
| TS | Earth skin temperature |

These are examples of the environmental measurements used for exploring different aspects of Earth's climate and environmental systems.

NASA resources:

- [NASA Earthdata](https://www.earthdata.nasa.gov/)
- [NASA POWER](https://power.larc.nasa.gov/)
- [NASA Giovanni](https://giovanni.gsfc.nasa.gov/giovanni/)

## How the Application Works

The user begins by selecting an investigation type and providing the required information, such as a location, environmental variable, and study period.

The application retrieves the corresponding NASA measurements through its API routes. The data is then processed and used for the selected analysis.

Depending on the investigation type, the application performs trend analysis, calculates statistical correlations, or compares multiple environmental variables. The results are presented through charts, numerical summaries, and related-variable comparisons.

The related-variable discovery feature allows users to continue exploring the results by selecting additional variables and examining their statistical relationships.

## Statistical Methods

The application uses statistical methods to analyze environmental measurements, including:

- Historical trend analysis
- Pearson correlation coefficient
- Detrended Pearson correlation
- Comparison of environmental variables over time

Correlation results describe statistical associations between variables. They should not be interpreted as proof that one environmental factor causes changes in another.

## Technologies Used

- Next.js
- React
- JavaScript
- CSS
- NASA environmental data services
- Next.js API routes

## Installation and Setup

### Requirements

- Node.js
- npm
- NASA Earthdata credentials, if required by the configured data service

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project directory

```bash
cd YOUR_PROJECT_FOLDER
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the root directory and add the credentials required by your NASA data integration.

For example:

```env
NASA_EARTHDATA_USERNAME=your_username
NASA_EARTHDATA_PASSWORD=your_password
```

Use the exact environment variable names expected by your application. Do not upload this file or expose credentials in the repository.

### 5. Start the development server

```bash
npm run dev
```

Open the following address in your browser:

http://localhost:3000

## Project Structure

The main parts of the application are organized as follows:

```text
project/
├── app/
│   ├── page.js
│   ├── investigate/
│   │   └── page.js
│   └── api/
│       └── nasa/
│           ├── analyze/
│           └── scenario/
├── public/
├── package.json
└── README.md
```

This is a simplified overview of the project structure.

## Limitations and Considerations

The analysis depends on the availability and coverage of the underlying NASA datasets. Results may vary depending on the selected location, environmental variable, and study period.

Correlation does not establish causation. Environmental systems are complex, and the relationships identified by the application represent statistical associations rather than definitive explanations of cause and effect.

## Project Purpose

GEO DETECTIVE aims to make environmental data exploration more accessible. By combining NASA Earth science data with statistical analysis and interactive visualization, the platform helps users investigate environmental changes, identify patterns, and explore relationships between different factors influencing Earth's systems.
