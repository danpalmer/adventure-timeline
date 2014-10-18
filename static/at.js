
var Graph2d;

var optionsg = {
		shaded: true,
		height: '99%',
		start: '2004',
		end: '2014'
};

// DOM element where the Timeline will be attached

var events = [ ];
// Create a DataSet (allows two way data-binding)

// Configuration for the Timeline
var optionstl = {
		height: '99%',
		start: '2004',
		end: '2014',
		template: formatActivity
};
var timelinetl;
var datasets;
var graphs = [ { id: 0, items: [] }, { id: 1, items: [] } ];

var countryCode = '';
var sectorCode = '';

$(document).ready(function(){

	parts = window.location.hash.split('&');
	if (parts.length == 2) {
		countryCode = parts[0].replace('#', '');
		sectorCode = parts[1];
	}

	for(i=0;i<graphs.length;++i)
	{
		var g = graphs[i].id;
		$('#dataset_'+g).change( loadDatasetFromForm.bind(g) );
	}
	$('#sectors').change(sectorChanged);
	$.ajax( 'static/data/datasets.json' ).success( loadedList ).fail( dang );
	$.ajax( 'sectors' ).success( loadedSectors ).fail( dang );
	$('#show-map-control').click( function() { $('#map').css('left','0'); } );
	initMap();
	loadTimeline();
});
function loadDatasetFromForm()
{
	loadDataset(this,$( "#dataset_"+this+" option:selected" ).val());
}

function initMap()
{
	var map = L.map('map').setView([-3.51342,29.53125], 5);
	var tileUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
	L.tileLayer(tileUrl, {
    		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    		maxZoom: 19
	}).addTo(map);
	L.geoJson(countryGeoJSON, {

		style: function (feature) {
			return { color: "green", "opacity":0, fillOpacity:0 };
		},

		onEachFeature: onEachFeature,

	}).addTo(map);
}

function setCountry( country )
{
	$('#g_1 option:selected').removeAttr( 'selected' );
	$('#g_1_'+country ).attr( "selected","selected" );
	setGraph(1, country);
	countryCode = country;
	loadTimeline();
}

function sectorChanged()
{
	sectorCode = $(this).val();
	loadTimeline();
}

function onEachFeature( feature, layer )
{
        layer.on('click', function (e) {
		setCountry( feature.id );
		$('#map').css('left','-100%');
	});
        layer.on('mouseover', function (e) {
		this.setStyle( { opacity: 1, fillOpacity: 0.5 } );
        });
        layer.on('mouseout', function (e) {
		this.setStyle( { opacity: 0, fillOpacity: 0} );
        });
}


var datasetList;
function loadedList(ajax)
{
	datasetList = ajax;
	for (var key in ajax)
	{
		var option = "<option value='"+key+"'>"+ajax[key].name+"</option>";
		for(i=0;i<graphs.length;++i)
		{
			$("#dataset_"+graphs[i].id).append(option);
		}
	}
}

function loadedSectors(results)
{
	var filters = results.sectors;
	for (var i = 0; i < filters.length; i++)
	{
		var filter = filters[i];
		var option = "<option value='"+filter[0]+"'>"+filter[1]+"</option>";
		$("#sectors").append(option);
	}
	if (sectorCode != '') {
		$('#sectors').val(sectorCode);
	}
}

var currentDataset;
function loadDataset(g,id)
{
	var url = 'static/data/'+id+'.json';
	currentDataset = datasetList[id];
	$('#dataset-controls').html( "Loading..." );
	$.ajax( url ).success( loadedDataset.bind(g) ).fail( dang );
}

function loadedDataset(ajax)
{
	var g=this;
	var list = [];
	var hash="";
	datasets = {};
	var sel = "<option>** select dataset **</option>";
	for (var i=0;i<ajax.length;++i )
	{
		datasets[ajax[i].ID] = ajax[i];
		if(ajax[i].ID==hash)
		{
			sel = ""; // don't need to make it default to an empty value
			setGraph(g, hash );
		}
		list.push( "<option id='g_"+g+"_"+ajax[i].ID+"' "+(ajax[i].ID==hash?"selected='selected'":"")+" value='"+ajax[i].ID+"'>"+ajax[i].Name+"</option>" );
	}
	$('#dataset_'+g+'-controls').html( currentDataset.relation+" <select id='select_"+g+"'>"+sel+list.join("")+"</select> in "+currentDataset.units );
	$('#select_'+g).change( function() {
		setGraph( g,$( "#select_"+g+" option:selected" ).val() );
	});
}

function dang()
{
	alert( "something didn't work. We're too lazy to write good debug messages." );
}

function loadTimeline()
{
	if (countryCode != '' && sectorCode != '') {
		$.ajax('/query?country_code=' + countryCode + '&sector=' + sectorCode).success( loadedTimeline ).fail( dang );
	}

	window.location.hash=countryCode + '&' + sectorCode;
	$('#sectors').val(sectorCode);
}

function loadedTimeline( ajax )
{
	if( !timelinetl )
	{
		var containertl = document.getElementById('vis-tl');
		timelinetl = new vis.Timeline(containertl, ajax.results, optionstl);
		timelinetl.on( 'rangechange', function(c) {
			if( Graph2d == null) { return; }
			optionsg.start = c.start;
			optionsg.end = c.end;
			Graph2d.setOptions( optionsg );
		});
	}
	else
	{
		timelinetl.setItems( ajax.results );
	}
}

var groups;
function setGraph(g, id)
{
	if( !datasets ) { return; }
	var dataset = datasets[id];
	if( !dataset ) { return; }
	var data = [];
	for (var key in dataset) {
		if ( key.match( /^\d\d\d\d/ ) && dataset[key]!==null && dataset[key]!="")
		{
			data.push( {"group":g,"x":key, "y":parseInt(dataset[key])/currentDataset.modifier } );
		}
	}
	graphs[g].items = data;

	if( Graph2d )
	{
		Graph2d.destroy();
	}
	var containerg = document.getElementById('vis-g');
 	groups = new vis.DataSet();
	for(i=0;i<graphs.length;++i)
	{
		var g1 = graphs[i].id;
		if( graphs[g1].items.length > 0 )
		{
			var group = {
        			id: g1,
        			content: "g1"+g,
        			options: {  drawPoints: false }
			};
			if( g1%2==1 )
			{
				group.options.yAxisOrientation= 'right';
			}
    			groups.add(group);
		}
	}
	var items = [];
	for(i=0;i<graphs.length;++i)
	{
		for(j=0;j<graphs[i].items.length;j++)
		{
			row = graphs[i].items[j];
			items.push( row );
		}
	}
	Graph2d = new vis.Graph2d(containerg, items, optionsg, groups);

	if( timelinetl )
	{
		var axis_width = $('#vis-g .dataaxis').width()+1;
		$('#vis-tl').css( 'margin-left', axis_width+"px" );
		$('#vis-tl').css( 'width', $('#vis-g').width()-axis_width+"px" );
		optionsg.start = timelinetl.getWindow().start;
		optionsg.end = timelinetl.getWindow().end;
	}
	Graph2d.setOptions( optionsg );
}

function d(x)
{
	alert(JSON.stringify(x));
}

function formatActivity(activity)
{
	return "<strong>" + activity.title + "</strong><br>"
	+ "<p>" + activity.description + "<br>"
	+ activity.sector.name + "</p>";
}
