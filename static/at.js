
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
		template: formatActivity,
		selectable: false,
};
var timelinetl;
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
	$.ajax( 'static/data/datasets.json' ).success( loadedList ).fail( dang.bind(this, "loading datasets failed") );
	$.ajax( 'static/data/sectors.json' ).success( loadedSectors ).fail( dang.bind(this, "loading sectors failed") );
	$('#show-map-control').click( showMap ); 
	$('#controls-hide').click( hideControls );
	$('#controls-show').click( showControls );
	$('#about-hide').click( hideAbout );
	$('#about-show').click( showAbout );
	initMap();
	loadTimeline();
	if( !countryCode )
	{
		showMap();
	}
});
function hideAbout()
{
	$('#about').fadeOut();
}
function showAbout()
{
	$('#about').css( { 
		left: ($(window).width()-$('#about').width())/2-10+"px",
		top: ($(window).height()-$('#about').height())/2-10+"px"
	} );
	$('#about').fadeIn();
}
function hideControls()
{
	$('#controls-box').animate( { top: -$('#controls-box').height()-10+"px" } );
}
function showControls()
{
	$('#controls-box').animate( { top: "0px" } );
}
function showMap() 
{ 
	$('#map').fadeIn();
	$('#map').css("left","0");
	var mm = $('#map-message');
	var border_w = 10;
	mm.css( 'top',($(window).height()/3)+"px" );
	mm.css( 'left',( ($(window).width()-mm.width())/2 -border_w)+"px" );
	mm.show();
	setInterval( function() {
		mm.fadeOut();
	}, 3000 );
} 
function hideMap() 
{ 
	$('#map').fadeOut();
} 
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
			return { color: "orange", "opacity":0, fillOpacity:0 };
		},

		onEachFeature: onEachFeature,

	}).addTo(map);
}

function setCountry( country )
{
	for( var g=0;g<graphs.length;++g )
	{
		$("#g_"+g+" option:selected").removeAttr( "selected" );
		$("#g_"+g+"_"+country ).attr( "selected","selected" );
		setGraph(g, country );
	}
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
		hideMap();
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
		for(i=0;i<graphs.length;++i)
		{
			var option = "<option id='ds_"+i+"_"+key+"' value='"+key+"'>"+ajax[key].name+"</option>";
			$("#dataset_"+graphs[i].id).append(option);
		}
	}
	$("#ds_0_population" ).attr( "selected","selected" );
	loadDataset(0,'population');
	$("#ds_1_life_expectancy" ).attr( "selected","selected" );
	loadDataset(1,'life_expectancy');
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

function loadDataset(g,id)
{
	var url = 'static/data/'+id+'.json';
	graphs[g].dataset = datasetList[id];
	$('#dataset-controls').html( "Loading..." );
	$.ajax( url ).success( loadedDataset.bind(g) ).fail( dang.bind(this, "loadDataset failed") );
}

function loadedDataset(ajax)
{
	var g=this;
	var list = [];
	graphs[g].datasets = {};
	var sel = "<option>** select dataset **</option>";
	for (var i=0;i<ajax.length;++i )
	{
		graphs[g].datasets[ajax[i].ID] = ajax[i];
		if(ajax[i].ID==countryCode)
		{
			sel = ""; // don't need to make it default to an empty value
			setGraph(g, countryCode );
		}
		list.push( "<option id='g_"+g+"_"+ajax[i].ID+"' "+(ajax[i].ID==countryCode?"selected='selected'":"")+" value='"+ajax[i].ID+"'>"+ajax[i].Name+"</option>" );
	}
	$('#dataset_'+g+'-controls').html( graphs[g].dataset.relation+" <select id='select_"+g+"'>"+sel+list.join("")+"</select> in "+graphs[g].dataset.units );
	$('#select_'+g).change( function() {
		setGraph( g,$( "#select_"+g+" option:selected" ).val() );
	});
}

function dang(msg)
{
	//alert( "DEFINITELY NOT AN ERROR.. but..." + msg );
}

function loadTimeline()
{
	if (countryCode != '' && sectorCode != '') {
		var url = '/query?country_code=' + countryCode + '&sector=' + sectorCode;
//url='static/data/example-iati.json';
		$.ajax(url).success( loadedTimeline ).fail( dang );
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
			updateMargins();
		});
		updateMargins();
	}
	else
	{
		timelinetl.setItems( ajax.results );
	}

	$('.item').mouseenter(function() {
		$(this).find('.details').popover('show');
	}).mouseleave(function() {
		$(this).find('.details').popover('hide');
	});
}

var groups;
function setGraph(g, id)
{ 
	if( !graphs[g].datasets ) { return; }
	var dataset = graphs[g].datasets[id];
	if( !dataset ) { return; }
	var data = [];

	for (var key in dataset) {
		if ( key.match( /^\d\d\d\d/ ) && dataset[key]!==null && dataset[key]!="")
		{
			data.push( {"group":g,"x":key, "y":parseInt(dataset[key])/graphs[g].dataset.modifier } );
		}
	}
	graphs[g].items = data;

	if( Graph2d )
	{
		Graph2d.destroy();
	}
	var containerg = document.getElementById('vis-g');
 	groups = new vis.DataSet();
	optionsg.legend = { enabled: true};
        optionsg.legend= {};
	for(i=0;i<graphs.length;++i)
	{
		var g1 = graphs[i].id;
		if( graphs[g1].items.length > 0 )
		{
			var group = {
        			id: g1,
        			content: graphs[g1].dataset.name+" ("+graphs[g1].dataset.units+")",
        			options: { drawPoints: {} }
			};
			if( g1%2==1 )
			{
				group.options.yAxisOrientation= 'right';
				optionsg.legend.right = { position: "bottom-right" };
				group.options.drawPoints.style = "square";
			}
			else
			{
				optionsg.legend.left = { position: "bottom-left" };
				group.options.drawPoints.style = "circle";
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
	updateMargins();
}

function updateMargins()
{
	if( !timelinetl || !Graph2d ) { return; }
	
	var axis_width_left = $('#vis-g .left ').width();
	var axis_width_right = $('#vis-g .right ').width();
	if( axis_width_left === null ) 
	{	
		axis_width_left = 0;
	}
	else
	{	
		axis_width_left += 1; // add border
	}
	if( axis_width_right === null ) 
	{	
		axis_width_right = 0;
	}
	else
	{	
		axis_width_right += 1; // add border
	}
	
	$('#vis-tl').css( 'margin-left', axis_width_left+"px" );
	$('#vis-tl').css( 'margin-right', axis_width_right+"px" );
	$('#vis-tl').css( 'width', $('#vis-g').width()-axis_width_left-axis_width_right+"px" );
	optionsg.start = timelinetl.getWindow().start;
	optionsg.end = timelinetl.getWindow().end;
	Graph2d.setOptions( optionsg );
}

function d(x)
{
	alert(JSON.stringify(x));
}

function formatActivity(activity)
{
	if( !activity.sector ) { activity.sector = {}; }
	if( !activity.sector.name ) { activity.sector.name="*NO-SECTOR*"; }
	if( !activity.description ) { activity.description="*NO-DESCRIPTION*"; }
	if( !activity.title ) { activity.title="*NO-TITLE*"; }
	content = '<strong '
	+      'type="button" '
	+      'class="details" '
	+      'data-container="body" '
	+      'data-title="' + activity.sector.name + '" '
	+      'data-toggle="popover" '
	+      'data-placement="top" '
	+      'data-content="' + activity.description + '"'
	+'>' + activity.title + '</strong>';

	// if (activity.uri) {
	// 	content += '<a class="btn btn-default btn-xs btn-link" href="' + activity.uri + '">Project Site</a>';
	// }

	return content;
}
