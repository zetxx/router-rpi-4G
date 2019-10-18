function runAll() {
    var urlParams = new URLSearchParams(window.location.search);
    var port = parseInt(urlParams.get('port') || 9000);

    d3.json(['http://', window.location.hostname, ['', port].join(':'), '/stats'].join(''), {
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
            if (data.error) {
                return;
            }
            d3.select('.fl.net').attr('class', (data.result.net.bar && ['fl net on bar'].concat([data.result.net.bar]).join('')) || 'fl net off');
            d3.select('.fl.vpn').attr('class', (data.result.vpn.on && ['fl vpn'].concat([(data.result.vpn.on && 'on') || 'off']).join(' ')) || 'fl vpn off');
            d3.select('.fl.traffic-used span').html((data.result.provider.trafficUsed && [data.result.provider.trafficUsed, '%'].join('')) || 'n/a');

            var list = data.result.graphData.map(({date, ...rest}) => ({date: new Date(date), ...rest}));
            if (list && list.length) {
                var svgWidth = (parseInt(d3.select('#plate').style('width').slice(0, -2)));
                var svgHeight = (parseInt(d3.select('#plate').style('height').slice(0, -2)));
                // set the dimensions and margins of the graph
                var margin = {top: 9, right: 2, bottom: 3, left: 1};
                var width = svgWidth - margin.left - margin.right;
                var height = svgHeight - margin.top - margin.bottom;

                // set the ranges
                var x = d3.scaleTime().range([0, width]);
                var y0 = d3.scaleLinear().range([height, 0]);
                var y1 = d3.scaleLinear().range([height, 0]);
                var y2 = d3.scaleLinear().range([height, 0]);

                // define the upload area
                var uploadArea = d3.area()
                    .x((d) => x(d.date))
                    .y0(height)
                    .y1((d) => y0(d.upload));

                // define the download area
                var downloadArea = d3.area()
                    .x((d) => x(d.date))
                    .y0(height)
                    .y1((d) => y1(d.download));

                // define the ping area
                var pingLine = d3.line()
                    .x((d) => x(d.date))
                    .y((d) => y2(d.ping));

                // append the svg obgect to the body of the page
                // appends a 'group' element to 'svg'
                // moves the 'group' element to the top left margin
                var svg = d3.select('#plate')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform',
                        'translate(' + margin.left + ',' + margin.top + ')');

                // Scale the range of the data
                x.domain(d3.extent(list, (d) => d.date));
                y0.domain([0, d3.max(list, (d) => Math.max(d.upload))]);
                y1.domain([0, d3.max(list, (d) => Math.max(d.download))]);
                y2.domain([0, d3.max(list, (d) => Math.max(d.ping))]);

                // add upload area
                svg.append('path')
                    .data([list])
                    .attr('class', 'area upload')
                    .attr('d', uploadArea);

                // add download area
                svg.append('path')
                    .data([list])
                    .attr('class', 'area download')
                    .attr('d', downloadArea);

                // add ping line
                svg.append('path')
                    .data([list])
                    .attr('class', 'line ping')
                    .attr('d', pingLine);

                // Add the X Axis
                svg.append('g')
                    .attr('class', 'axis bottom')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(d3.axisBottom(x).tickSize(2));

                // Add the Y0 Axis
                svg.append('g')
                    .attr('class', 'axis upload')
                    .call(d3.axisLeft(y0).tickSize(1))
                    .append('text')
                    .attr('y', -4)
                    .attr('x', 22)
                    .html(data.result.trafficMetrics.tx + '&#8679;');

                // Add the Y1 Axis
                svg.append('g')
                    .attr('class', 'axis download')
                    .attr('transform', 'translate( ' + width + ', 0 )')
                    .call(d3.axisRight(y1).tickSize(2))
                    .append('text')
                    .attr('y', -4)
                    .attr('x', -95)
                    .html(data.result.trafficMetrics.rx + '&#8681;');

                svg.select('.axis.download')
                    .append('text')
                    .attr('class', 'ping')
                    .attr('y', -5)
                    .attr('x', -65)
                    .html('ping');
            }
            return 1;
        })
        .catch(console.error);
};
