var data = JSON.parse('[{"date":"1-May-12","close":"10","open":"90"},{"date":"30-Apr-12","close":"90","open":"10"},{"date":"27-Apr-12","close":"10.00","open":"90.78"}]');

function runAll() {
    var svgWidth = (parseInt(d3.select('svg').style('width').slice(0, -2)));
    var svgHeight = (parseInt(d3.select('svg').style('height').slice(0, -2)));
    // set the dimensions and margins of the graph
    var margin = {top: 2, right: 18, bottom: 18, left: 18};
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse('%d-%b-%y');

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y0 = d3.scaleLinear().range([height, 0]);
    var y1 = d3.scaleLinear().range([height, 0]);

    // define the close area
    var closeArea = d3.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y0(d.close); });

    // define the close area
    var openArea = d3.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y1(d.open); });

    // define the close line
    var closeValue = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y0(d.close); });

    // define the open line
    var openValue = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y1(d.open); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

    // format the data
    data.map(function(d) {
        d.date = parseTime(d.date);
        d.close = +d.close;
        d.open = +d.open;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y0.domain([0, d3.max(data, function(d) {return Math.max(d.close);})]);
    y1.domain([0, d3.max(data, function(d) {return Math.max(d.open); })]);

    // add close area
    svg.append('path')
        .data([data])
        .attr('class', 'area close')
        .attr('d', closeArea);

    // add open area
    svg.append('path')
        .data([data])
        .attr('class', 'area open')
        .attr('d', openArea);

    // Add the open path.
    svg.append('path')
        .data([data])
        .attr('class', 'line close')
        .attr('d', closeValue);

    // Add the close path.
    svg.append('path')
        .data([data])
        .attr('class', 'line open')
        .attr('d', openValue);

    // Add the X Axis
    svg.append('g')
        .attr('class', 'axis bottom')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    // Add the Y0 Axis
    svg.append('g')
        .attr('class', 'axis close')
        .call(d3.axisLeft(y0));

    // Add the Y1 Axis
    svg.append('g')
        .attr('class', 'axis open')
        .attr('transform', 'translate( ' + width + ', 0 )')
        .call(d3.axisRight(y1));
};
