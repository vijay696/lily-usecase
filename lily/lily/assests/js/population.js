// @author--Vijay G R
// Global variable to store total population
let data;
let selectedYear;
let totalPopulation;

const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Load the CSV data
d3.csv("/assests/pdf/population2.csv").then(function (dataset) {
    // Convert population values to numbers while reading the data
    data = dataset.map(d => ({
        year: +d.year,
        country: d.country,
        population: +d.population,
        density: +d.density,
        population_growth: +d.population_growth
    }));
    console.log(data);
    initialize();
});

// Initialize the chart
function initialize() {
    // year dropdown options
    const yearSelect = document.getElementById("year-select");
    const years = Array.from(new Set(data.map(d => +d.year))); // Get unique years
    years.sort((a, b) => a - b);
    years.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);
    });

    // Set default year
    selectedYear = years[0];
    yearSelect.value = selectedYear;

    // Create the scatterplot
    createScatterplot();

    // Listen for year change
    yearSelect.addEventListener("change", handleYearChange);
    
    // Calculate and display total population for the default year
    calculateTotalPopulation(selectedYear);
}


// Create the scatterplot
function createScatterplot() {
    // Filter data for the selected year
    const filteredData = data.filter(d => +d.year === selectedYear);

    // Create SVG container
    const svg = d3.select("#chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;");

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => +d.density)])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => +d.population_growth)])
        .range([height - margin.bottom, margin.top]);

    const bubbleScale = d3.scaleSqrt() // sqrt scale for bubble sizes
        .domain([0, d3.max(filteredData, d => +d.population)])
        .range([2, 20]); 

    // Create circles for bubbles with different colors based on country
    svg.selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(+d.density))
        .attr("cy", d => yScale(+d.population_growth))
        .attr("r", d => bubbleScale(+d.population)) //  bubbleScale for sizes
        .attr("fill", d => colorScale(d.country)) // Assign colors based on country
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
}//working getting data created


// to Handle year change
function handleYearChange(event) {
    selectedYear = +event.target.value;
    d3.select("svg").remove(); // Remove old chart
    createScatterplot(); // Create new chart
    
    // Recalculate and display the total population for the selected year
    calculateTotalPopulation(selectedYear);
}

// Handle mouseover event
function handleMouseOver(event, d) {
    const detailsDiv = document.getElementById("details");
    detailsDiv.innerHTML = `Country: ${d.country}<br>Population: ${d.population}<br>Density: ${d.density}`;
    
}

// Handle mouseout event
function handleMouseOut() {
    const detailsDiv = document.getElementById("details");
    detailsDiv.innerHTML = "";
}


// Function to calculate total population for a given year in millions
function calculateTotalPopulation(year) {
    totalPopulation = data
        .filter(d => d.year === year)
        .reduce((sum, d) => sum + d.population, 0);

    // Convert total population to millions
    const totalPopulationInMillions = totalPopulation / 1000000; // 1 million = 1,000,000

    // Display the total population in millions in a div 
    const totalPopulationDiv = document.getElementById("total-population");
    totalPopulationDiv.textContent = `World Population  (${year}): 
    
    ${totalPopulationInMillions.toFixed(2)} million(${totalPopulation} in numbers)`;

    console.log(totalPopulationInMillions);
}
