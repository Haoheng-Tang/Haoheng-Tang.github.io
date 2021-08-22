/* =====================
  Global Variables
===================== */
var parcelURL;
var nearbyURL;

var parceldata;  // for holding data
var censusData;
var nearby_data;

var marker;
var parcel_geo;
var parcel_layer;
var nearby_marker_lst=[];
var addr;
var nearby_addr;

var zoning;
var category;
var vio_code;
var year_built;
var total_area;
var story;
var room;
var frontage;
var request;
var nearby;
var risk;

var redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
 // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [15, 28],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
 // shadowSize: [15, 28]
});

/* =====================
  Functions
===================== */
var newapi = function(input){
  var address = `https://www.fireapi.me/parcel_info?addr=${input}`
   console.log(address)
  // return(encodeURI(address))
  return(address)
}

var updateapi = function(api){
  $('#apilink').html(`<button type="button" class="btn btn-lg btn-danger" data-toggle="popover" 
  title="IP Address" data-bs-content="<a href='${api}' target='_blank'> ${api} </a>">API</button>`)
}

var removeMarkers = function(lst) {
  lst.forEach((item) =>{
      map.removeLayer(item);
      })
};

var removeGeometry = function() {
  if (marker != undefined) {
    map.removeLayer(marker);
    removeMarkers(nearby_marker_lst);
  };
  if(parcel_geo != undefined) {
    map.removeLayer(parcel_layer);
  }
};

var plotMarkers = function(lst) {
  lst.forEach((item) =>{
      item.addTo(map);
  })
};

function updateChart(barchart, newdata){
  barchart.data.datasets[0].data[0] = newdata
  barchart.update()
}

function updateChart2(radarchart, below, unsafe, com, hotel, CMX2, vioct){
  radarchart.data.datasets[0].data[0] = below
  radarchart.data.datasets[0].data[1] = unsafe
  radarchart.data.datasets[0].data[2] = com
  radarchart.data.datasets[0].data[3] = hotel
  radarchart.data.datasets[0].data[4] = CMX2
  radarchart.data.datasets[0].data[5] = vioct/10
  radarchart.update()
}

function setMarkers(dataArr){
  // console.log(dataArr)
  removeGeometry();
  // removeMarkers(nearby_marker_lst);
  nearby_marker_lst=[];
  parcel_geo = dataArr.parcel_geometry[0].geometry;
  var lat = parseFloat(dataArr.parcel_df[0].Parcel_centroid_lat);
  var lng = parseFloat(dataArr.parcel_df[0].Parcel_centroid_lng);
  addr = dataArr.parcel_df[0].Input.replaceAll('%20', ' ')
  marker = L.marker([lat, lng],{icon: redIcon}).bindPopup(addr);

  dataArr.nearby_parcel_df.forEach((item) =>{
    var myMarker = L.marker([item.LAT, item.LNG],{icon: blueIcon}).bindPopup(item.ADDR_SOURCE).on('click', onClick);
    nearby_marker_lst.push(myMarker);
    })
}

//Cards: 311 Request
var new311 = function(entry){
  if(entry.length>1){
    console.log(entry[0].length)
    if(entry[0].length>24){
      return(`1. ${entry[0]}<br/>...`)
    }else if(entry[1].length>24){
      return(`1. ${entry[1]}<br/>...`)
    }else if(entry.length==2){
      return(`1. ${entry[0]}<br/>2. ${entry[1]}<br/>&nbsp`)
    }else{
      return (`1. ${entry[0]}<br/>2. ${entry[1]}<br/>...`)
    }
  }else if(entry.length==1 && entry[0]!=undefined){
    console.log(1)
   return(`${entry[0]}<br/>&nbsp<br/>&nbsp`)
   }else{
    console.log(2)
    return(`none<br/>&nbsp`)}
   }

var update311 =function(req){
  let count311= req.length
  var names311=[]
  for(let i=0;i<count311;i++){
    name311 = req[i].service_name
    names311.push(name311)
  }
  $('#311count').html(count311)
  $('#311name').html(new311(names311))
  console.log(new311(names311))
}

//Cards: Nearby Parcel
var newparcel = function(entry){
  if(entry.length>1){
   return (`1. ${entry[0]}<br/>2. ${entry[1]}<br/>...`)
  }else if(entry.length==1){
   return(`${entry[0]}<br/>&nbsp<br/>&nbsp`)
   }else{
    return(`none`)}
   }

var updateparcel= function(dataArr){
  var countparcel= dataArr.length
  var namesparcel=[]
  for(let i=0;i<countparcel;i++){
    nameparcel = dataArr[i].ADDR_SOURCE
    namesparcel.push(nameparcel)
  }
  $('#parcelcount').html(countparcel)
  $('#parcelname').html(newparcel(namesparcel))
}

//census data
function updateCensus(census){
  $('#pop').html(parceldata.census_df[0].population);
  $('#black').html(parceldata.census_df[0].black_population);
  $('#white').html(parceldata.census_df[0].white_population);
  $('#income').html(parceldata.census_df[0].median_income);
}


function plotElements(){
  var markerBounds = L.latLngBounds([marker.getLatLng()]);
  map.fitBounds(markerBounds);

  parcel_layer = L.geoJson(parcel_geo,{
    style: {color: "orange", weight: 3}
  }).addTo(map);

  //add markers
  plotMarkers(nearby_marker_lst);
  marker.addTo(map).openPopup();
}

var updaterisk= function(risk){
  if (parceldata.prediction[0].Relative_risk === 'Above average'){
    $(".above").html("Above");
    $(".average").html("Average");
  }else if(parceldata.prediction[0].Relative_risk === 'Below average'){
    $(".above").html("Below");
    $(".average").html("Average");
  }
}

function getInfo(dataArr){
  zoning = dataArr.properties_df[0].zoning;
  console.log(zoning)
  category = dataArr.properties_df[0].category;
  vio_code = dataArr.properties_df[0].vio_title;
  CMX2= dataArr.properties_df[0].isCMX2;
  below = dataArr.properties_df[0].isbelow;
  com= dataArr.properties_df[0].iscom;
  hotel= dataArr.properties_df[0].ishotel;
  unsafe= dataArr.violation_df[0].isunsafe;
  vioct = dataArr.violation_df[0].viol_count;
  year_built = dataArr.properties_df[0].year_built;
  total_area = dataArr.properties_df[0].total_area;
  story = dataArr.properties_df[0].number_stories;
  room = dataArr.properties_df[0].number_of_rooms;
  frontage = dataArr.properties_df[0].frontage;
  request = dataArr.request311_100m
  nearby = dataArr.nearby_parcel_df
  risk = dataArr.prediction[0].Relative_risk
  censusData = parceldata.census_df[0]
}

/*click nearby marker function*/ 
function onClick(e) {
  $('#loader').show()
  var popup = this.getPopup();
  nearby_addr = popup.getContent();
  nearbyURL = newapi(nearby_addr)

  $.ajax({
    async: false,
    url: nearbyURL ,
    dataType: 'json',
    headers:{'Access-Control-Allow-Origin':'*'}
  }).done(function(nearbyRes){
    nearby_data = nearbyRes
  });

  $('#loader').hide()
  console.log(nearby_data)

  setMarkers(nearby_data);
  plotElements();
  getInfo(nearby_data);
  updateChart(area_Chart, total_area);
  updateChart(frontage_Chart, frontage);
  updateChart(room_Chart, room);
  updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
  update311(request);
  updateparcel(nearby);
  updateCensus(censusData);
}



/* =====================
  Parse and store data for later use
===================== */
// var censusURL = "https://raw.githubusercontent.com/zenithchen/CPLN692Final/main/Data/Census_Tracts_2010.geojson"

$(document).ready(function() {
  $('#loader').hide();

  $('#btnGroupAddon').click(function() {
    $('#loader').show()
    var inputAddr = $('.form-control').val();
    if(inputAddr===""){
      inputAddr = "1200 W VENANGO ST"
    }
    parcelURL = newapi(inputAddr);
    //console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr1
$(document).ready(function() {
  $('#loader').hide();

  $('#addr1').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr1').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr2
$(document).ready(function() {
  $('#loader').hide();

  $('#addr2').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr2').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr3
$(document).ready(function() {
  $('#loader').hide();

  $('#addr3').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr3').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr4
$(document).ready(function() {
  $('#loader').hide();

  $('#addr4').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr4').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr5
$(document).ready(function() {
  $('#loader').hide();

  $('#addr5').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr5').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr6
$(document).ready(function() {
  $('#loader').hide();

  $('#addr6').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr6').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr7
$(document).ready(function() {
  $('#loader').hide();

  $('#addr7').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr7').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr8
$(document).ready(function() {
  $('#loader').hide();

  $('#addr8').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr8').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr9
$(document).ready(function() {
  $('#loader').hide();

  $('#addr9').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr9').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr10
$(document).ready(function() {
  $('#loader').hide();

  $('#addr10').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr10').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr11
$(document).ready(function() {
  $('#loader').hide();

  $('#addr11').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr11').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr12
$(document).ready(function() {
  $('#loader').hide();

  $('#addr12').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr12').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr13
$(document).ready(function() {
  $('#loader').hide();

  $('#addr13').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr13').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})

//dropdown click addr14
$(document).ready(function() {
  $('#loader').hide();

  $('#addr14').click(function() {
    $('#loader').show()
    var inputAddr = $('#addr14').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      async: false,
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      parceldata= parcelRes
    });

    $('#loader').hide()
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter a valid address!")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, vioct);
      //api popover
      var api = newapi(inputAddr);
      updateapi(api)
      $(function () {
        $('[data-toggle="popover"]').popover({
           trigger: 'click',
           sanitize : false,
           html:true
          })
      })   

    }
   
  });

})