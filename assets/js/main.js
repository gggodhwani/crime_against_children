var googleLayer = new L.Google('ROADMAP');
var map = new L.Map('map', {center: new L.LatLng(22, 78), zoom: 5});
map.addLayer(googleLayer);

var progress = document.getElementById('progress');
var progressBar = document.getElementById('progress-bar');
function updateProgressBar(processed, total, elapsed, layersArray)
{
	if (elapsed > 5) 
	{
		progress.style.display = 'block';
		loaded_value = Math.round(processed/total*500)
			progressBar.style.width = loaded_value + '%';
	}
	if (processed === total) 
	{
		// all markers processed - hide the progress bar:
		progress.style.display = 'none';
	}
}
var markers = null;
var marker_list = [];
var is_states_populated = false;
var cities;
$.getJSON("assets/data/geodata.json", function(json){
	cities = json;
});
populate_map_for_year();
function populate_map_for_year()
{
	var year = $("#year-list option:selected").text();
	var crime_type_index = parseInt($("#crime-type-list option:selected").val());
	if(markers != null)
	{
		map.removeLayer(markers);
	}
	markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar, maxClusterRadius: 60});
	$.getJSON("assets/data/yearwise_crime_data/" + year +".json", function(crimes){
		for(state in crimes.data[year])
	{
		marker_list = [];
		$("#select-panel-title").text("Displaying Data for the year " + year);
		if(!is_states_populated)
	{    
		$("#states-list").append('<option value="' + state.toLowerCase().replace(/ /g, "_") +'">' + state + '</option>');
	}
	for(crime_index in crimes.data[year][state])
	{
		crime = crimes.data[year][state][crime_index];
		var city = crime[0];
		if(state == "DELHI" || state == "SIKKIM")	
	{
		city = state + " " + city; 
	}
	if(cities[city] != null)
	{
		for(var i=1; i <= parseInt(crime[crime_type_index]); i++)
	{
		var marker = L.marker(new L.LatLng(cities[city][0], cities[city][1]), { title: city });
		marker.bindPopup(city);
		marker_list.push(marker);
	}
	}
	}       
	markers.addLayers(marker_list);
	}
	map.addLayer(markers);
	if(!is_states_populated)
	{    
		$('#select-panel').show();
		$('select').selectpicker();
		is_states_populated = true;
	}
	});
}    	
$("#year-list").change(function()
		{
			populate_map_for_year();
		});
var selected_state_layer = null;
$("#crime-type-list").change(function()
		{
			populate_map_for_year();
		});
$("#states-list").change(function()
		{
			if(selected_state_layer != null)
{
	map.removeLayer(selected_state_layer);
}
state_name = $("#states-list option:selected").val();
if(state_name == "default")
{

}
$.getJSON("assets/data/state_boundaries/" + state_name + ".json", function(json){
	polygon_features = {weight: 1, fillOpacity: 0.15}; 
	if(json["type"] = "MultiPolygon")
{
	selected_state_layer = L.multiPolygon(json["coordinates"], polygon_features); 
}
else
{
	selected_state_layer = L.polygon(json["coordinates"], polygon_features);
}	
map.addLayer(selected_state_layer);
area = parseFloat(json["area_sqkm"]);
zoom_level = 7;
if(area < 1000)
{
	zoom_level = 12;
}         
else if(area < 5000)
{
	zoom_level = 10;
}
else if(area < 10000)
{
	zoom_level = 9;
}
else if(area < 20000)
{
	zoom_level = 8;
}
map.setView(new L.LatLng(json["center"][0], json["center"][1]), zoom_level);
});
});
$('#menu-tab a').click(function (e) {
	if(!$( this ).attr( 'href' ).match(/^#/)) return;
	e.preventDefault()
	$(this).tab('show')
})

