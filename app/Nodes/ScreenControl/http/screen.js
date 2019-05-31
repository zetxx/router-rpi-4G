function runAll() {
    d3.json(['http://', window.location.hostname, ':9005', '/JSONRPC/stats'].join(''), {
        crossOrigin: 'anonymous',
        method: 'POST',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            meta: {},
            method: 'stats',
            params: {}
        })
    })
        .then((data) => {
            var list = data.traffic.map(({date, ...rest}) => ({date: new Date(date), ...rest}));
            var svgWidth = (parseInt(d3.select('#plate').style('width').slice(0, -2)));
            var svgHeight = (parseInt(d3.select('#plate').style('height').slice(0, -2)));
            // set the dimensions and margins of the graph
            var margin = {top: 3, right: 19, bottom: 18, left: 19};
            var width = svgWidth - margin.left - margin.right;
            var height = svgHeight - margin.top - margin.bottom;

            // set the ranges
            var x = d3.scaleTime().range([0, width]);
            var y0 = d3.scaleLinear().range([height, 0]);
            var y1 = d3.scaleLinear().range([height, 0]);

            // define the upload area
            var uploadArea = d3.area()
                .x(function(d) { return x(d.date); })
                .y0(height)
                .y1(function(d) { return y0(d.upload); });

            // define the upload area
            var downloadArea = d3.area()
                .x(function(d) { return x(d.date); })
                .y0(height)
                .y1(function(d) { return y1(d.download); });

            // // define the upload line
            // var uploadValue = d3.line()
            //     .x(function(d) { return x(d.date); })
            //     .y(function(d) { return y0(d.upload); });

            // // define the download line
            // var downloadValue = d3.line()
            //     .x(function(d) { return x(d.date); })
            //     .y(function(d) { return y1(d.download); });

            // append the svg obgect to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            var svg = d3.select('#plate')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform',
                    'translate(' + margin.left + ',' + margin.top + ')');

            // format the data
            list.map(function(d) {
                d.date = d.date;
                d.upload = +d.upload;
                d.download = +d.download;
            });

            // Scale the range of the data
            x.domain(d3.extent(data.traffic, function(d) {
                return d.date;
            }));
            y0.domain([0, d3.max(data.traffic, function(d) {
                return Math.max(d.upload);
            })]);
            y1.domain([0, d3.max(data.traffic, function(d) {
                return Math.max(d.download);
            })]);

            // add upload area
            svg.append('path')
                .data([data.traffic])
                .attr('class', 'area upload')
                .attr('d', uploadArea);

            // add download area
            svg.append('path')
                .data([data.traffic])
                .attr('class', 'area download')
                .attr('d', downloadArea);

            // // Add the download path.
            // svg.append('path')
            //     .data([data.traffic])
            //     .attr('class', 'line upload')
            //     .attr('d', uploadValue);

            // // Add the upload path.
            // svg.append('path')
            //     .data([data.traffic])
            //     .attr('class', 'line download')
            //     .attr('d', downloadValue);

            // Add the X Axis
            svg.append('g')
                .attr('class', 'axis bottom')
                .attr('transform', 'translate(0,' + height + ')')
                .call(d3.axisBottom(x));

            // Add the Y0 Axis
            svg.append('g')
                .attr('class', 'axis upload')
                .call(d3.axisLeft(y0))
                .append('text')
                .attr('y', 86)
                .attr('x', -4)
                .html('M&#8679;');

            // Add the Y1 Axis
            svg.append('g')
                .attr('class', 'axis download')
                .attr('transform', 'translate( ' + width + ', 0 )')
                .call(d3.axisRight(y1))
                .append('text')
                .attr('y', 86)
                .attr('x', 4)
                .html('M&#8681;');
            return 1;
        })
        .catch((e) => {
            console.log(e);
        });
};
