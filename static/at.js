
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
});

function loadedList(ajax)
{
	for (var key in ajax) 
	{
		var option = "<option value='"+key+"'>"+ajax[key]+"</option>";
		$("#dataset").append(option);
	}
}

function loadDataset(id)
{
	url = 'static/data/'+id+'.json';
	$('#dataset-controls').html( "Loading..." );
	$.ajax( url ).success( loadedDataset ).fail( dang );
}

function loadedDataset(ajax) 
{
	var list = [];
	datasets = {};
	for (var i=0;i<ajax.length;++i )
	{
		datasets[ajax[i].ID] = ajax[i];
		list.push( "<option value='"+ajax[i].ID+"'>"+ajax[i].Name+"</option>" );
	}
	$('#dataset-controls').html( "<select><option>** select dataset **</option>"+list.join("")+"</select>" );
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
	var dataset = datasets[id];
	var data = [];
	for (var key in dataset) {
		if ( key.match( /^\d\d\d\d/ ) && dataset[key]!==null && dataset[key]!="")
		{
			data.push( {"x":key, "y":parseInt(dataset[key]) } );
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

