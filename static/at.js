
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
		end: '2014'
};
var timelinetl;
var datasets;

$(document).ready(function(){
	$('#dataset').change( function() {
		loadDataset($( "#dataset option:selected" ).val());
	});
	$.ajax( 'static/data/datasets.json' ).success( loadedList ).fail( dang );
	//loadDataset('aidflows');
	loadTimeline('static/data/example-iati.json');
	$('#show-map-control').click( function() { $('#map').css('left','0'); } );
	initMap();
});

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
	window.location.hash=country;

	$('#g_1 option:selected').removeAttr( 'selected' );
	$('#g_1_'+country ).attr( "selected","selected" );
	setGraph( country );
}
	

function onEachFeature( feature, layer )
{
	//layer.bindPopup("ID: "+feature.id+"<br />Name: "+feature.properties.name);
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
		$("#dataset").append(option);
	}
}

var currentDataset;
function loadDataset(id)
{
	url = 'static/data/'+id+'.json';
	currentDataset = datasetList[id];
	$('#dataset-controls').html( "Loading..." );
	$.ajax( url ).success( loadedDataset ).fail( dang );
}

function loadedDataset(ajax) 
{
	var g = 1;
	var list = [];
	var hash="";
	datasets = {};
	if( window.location.hash )
	{
		hash = window.location.hash.replace(/^#/,'');
	}
	var sel = "<option>** select dataset **</option>";
	for (var i=0;i<ajax.length;++i )
	{
		datasets[ajax[i].ID] = ajax[i];
		if(ajax[i].ID==hash)
		{
			sel = ""; // don't need to make it default to an empty value
			setGraph( hash );
		}
		list.push( "<option id='g_1_"+ajax[i].ID+"' "+(ajax[i].ID==hash?"selected='selected'":"")+" value='"+ajax[i].ID+"'>"+ajax[i].Name+"</option>" );
	}
	$('#dataset-controls').html( currentDataset.relation+" <select id='g_1'>"+sel+list.join("")+"</select> in "+currentDataset.units );
	$('#dataset-controls select').change( function() {
		setGraph( $( "#dataset-controls option:selected" ).val() );
	});
}	

function dang()
{
	alert( "something didn't work. We're too lazy to write good debug messages." );
}

function loadTimeline(url)
{
	$.ajax( url ).success( loadedTimeline ).fail( dang );
}

function loadedTimeline( ajax )
{
	if( !timelinetl ) 
	{ 
		var containertl = document.getElementById('vis-tl');
		timelinetl = new vis.Timeline(containertl, ajax, optionstl); 
	}
	else
	{
		timelinetl.setItems( ajax );
	}
	timelinetl.on( 'rangechange', function(c) {
		if( Graph2d == null) { return; }
		optionsg.start = c.start;
		optionsg.end = c.end;
		Graph2d.setOptions( optionsg );
	});
}


function setGraph( id)
{ 
	if( !datasets ) { return; }
	var dataset = datasets[id];
	if( !dataset ) { return; }
	var data = [];
	for (var key in dataset) {
		if ( key.match( /^\d\d\d\d/ ) && dataset[key]!==null && dataset[key]!="")
		{
			data.push( {"x":key, "y":parseInt(dataset[key])/currentDataset.modifier } );
		}
	}
	if( !Graph2d ) 
	{ 
		var containerg = document.getElementById('vis-g');
		Graph2d = new vis.Graph2d(containerg, data, optionsg); 
	}
	Graph2d.setItems( data );
	var axis_width = $('#vis-g .dataaxis').width()+1;
	$('#vis-tl').css( 'margin-left', axis_width+"px" );
	$('#vis-tl').css( 'width', $('#vis-g').width()-axis_width+"px" );
	optionsg.start = timelinetl.getWindow().start;
	optionsg.end = timelinetl.getWindow().end;
	Graph2d.setOptions( optionsg );
}


function d(x) 
{ 
	alert(JSON.stringify(x)); 
}

