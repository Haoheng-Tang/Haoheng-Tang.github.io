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
var cat;
var opa;

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

var blackIcon = new L.Icon({
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

function updateChart2(radarchart, below, unsafe, com, hotel, CMX2, sealed){
  radarchart.data.datasets[0].data[0] = below
  radarchart.data.datasets[0].data[1] = unsafe
  //radarchart.data.datasets[0].data[2] = com
  radarchart.data.datasets[0].data[2] = 0
  //radarchart.data.datasets[0].data[3] = hotel
  radarchart.data.datasets[0].data[3] = 0
  radarchart.data.datasets[0].data[4] = CMX2
  radarchart.data.datasets[0].data[5] = sealed
  radarchart.update()
}

function setMarkers(dataArr){
  removeGeometry();
  // removeMarkers(nearby_marker_lst);
  nearby_marker_lst=[];
  parcel_geo = dataArr.parcel_geometry[0].geometry;
  var lat = parseFloat(dataArr.parcel_df[0].Parcel_centroid_lat);
  var lng = parseFloat(dataArr.parcel_df[0].Parcel_centroid_lng);
  addr = dataArr.parcel_geometry[0].ADDR_SOURCE;
  //cat = dataArr.properties_df[0].category
  cat = dataArr.properties_df[0].zoning;
  $('#displayname').val(addr)
  marker = L.marker([lat, lng],{icon: redIcon}).bindPopup(`${addr}<br/>Click on nearby markers to request data`).on({
    mouseover: function() {
            this.openPopup()
    },
    mouseout: function() { 
            this.closePopup()
    }
  });

  $('.legend-labels').html(`<li ><span style='background:orange; opacity: 0.6;'></span>${cat}</li>`)

  opa = dataArr.parcel_df[0].Opa_account_num
  var key
  for(let i=0;i<dataArr.nearby_parcel_df.length;i++){
    if(dataArr.nearby_parcel_df[i].opa_account_num == opa){
    key=i;
    }
  }
  dataArr.nearby_parcel_df.splice(key,1)

  dataArr.nearby_parcel_df.forEach((item) =>{
    var myMarker = L.marker([item.LAT, item.LNG],{icon: blackIcon}).bindPopup(item.ADDR_SOURCE).on('click', onClick);
    myMarker.on({
      mouseover: function() {
              this.openPopup()
      },
      mouseout: function() { 
              this.closePopup()
      }
  })
    nearby_marker_lst.push(myMarker);
    })
}

//Cards: 311 Request
var new311 = function(entry){
  if(entry.length>1){
    //console.log(entry[0].length)
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
    if(entry[0].length>24){
      return(`${entry[0]}<br/>&nbsp`)
    }else{
      return(`${entry[0]}<br/>&nbsp<br/>&nbsp`)
    }
   }else{
    return(`No 311 request within 100m in the past month<br/>&nbsp`)}
   }


var update311 =function(req){
  //311 count
  if(req.length==1 && req[0].service_name==undefined){
    count311= 0
  }else{
    count311= req.length
  }
  //311 names
  var names311=[]
  for(let i=0;i<count311;i++){
    name311 = req[i].service_name
    names311.push(name311)
  }
  $('#311count').html(count311)
  $('#311name').html(new311(names311))
  console.log(new311(names311))
}

//Cards: violation code
var newvio = function(entry){
  if(entry.length>1){
    //console.log(entry[0].length)
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
    if(entry[0].length>24){
      return(`${entry[0]}<br/>&nbsp`)
    }else{
      return(`${entry[0]}<br/>&nbsp<br/>&nbsp`)
    }
   }else{
    return(`No parcel within 50m<br/>&nbsp<br/>&nbsp`)}
   }

var updatevio =function(req){
  //vio count
  if(req.length==1 && req[0].vio_code=="NO CODE VIOLATION"){
    viocount= 0
  }else{
    viocount= req[0].viol_count
    //vio names
    var vionames=[]
    for(let i=0;i<viocount;i++){
      vioname = req[i].violationcodetitle
      vionames.push(vioname)
    }
    $('#viocount').html(viocount)
    $('#vioname').html(newvio(vionames))
    console.log(newvio(vionames))
  }
}

//Cards: Nearby Parcel
var newparcel = function(entry){
  if(entry.length>1){
   return (`1. ${entry[0]}<br/>2. ${entry[1]}<br/>...`)
  }else if(entry.length==1){
   return(`${entry[0]}<br/>&nbsp<br/>&nbsp`)
   }else{
    return(`No parcel within 50m`)}
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
  $('#censusnum').html(parceldata.census_df[0].census_tract);
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
  }else{
    //$(".above").html("Unpredictable");
    //$(".average").html(" ");
    if (parceldata.census_df[0].population>3000){
      $(".above").html("Above");
      $(".average").html("Average");
    }
    else{
      $(".above").html("Below");
      $(".average").html("Average");
    }

  }
}

function getInfo(dataArr){
  zoning = dataArr.properties_df[0].zoning;
  //console.log(zoning)
  category = dataArr.properties_df[0].category;
  vio_code = dataArr.properties_df[0].vio_title;
  CMX2= dataArr.properties_df[0].isCMX2;
  below = dataArr.properties_df[0].isbelow;
  com= dataArr.properties_df[0].iscom;
  hotel= dataArr.properties_df[0].ishotel;
  if(dataArr.violation_df.length==1 && dataArr.violation_df[0].vio_title=="NO CODE VIOLATION"){
    unsafe= 0
  }
  else{
    unsafe= dataArr.violation_df[0].isunsafe;
  }
  sealed= dataArr.properties_df[0].issealed;
  vioct = dataArr.violation_df[0].viol_count;
  year_built = dataArr.properties_df[0].year_built;
  total_area = dataArr.properties_df[0].total_area;
  story = dataArr.properties_df[0].number_stories;
  room = dataArr.properties_df[0].number_of_rooms;
  frontage = dataArr.properties_df[0].frontage;
  request = dataArr.request311_100m;
  viodf = dataArr.violation_df;
  nearby = dataArr.nearby_parcel_df;
  risk = dataArr.prediction[0].Relative_risk;
  censusData = parceldata.census_df[0];
}

/*click nearby marker function*/ 
function onClick(e) {
  $('#loader').show()
  $('#btnGroupAddon').off('click', Search);
  $('#btnGroupAddon').attr("disabled", true);
  $('#btnGroupDrop1').attr("disabled", true);

  var popup = this.getPopup();
  nearby_addr = popup.getContent();
  nearbyURL = newapi(nearby_addr)

  $.ajax({
    url: nearbyURL ,
    dataType: 'json',
    headers:{'Access-Control-Allow-Origin':'*'}
  }).done(function(nearbyRes){

    $('#btnGroupAddon').on('click', Search);
    $('#btnGroupAddon').attr("disabled", false);
    $('#btnGroupDrop1').attr("disabled", false);

    nearby_data = nearbyRes
    $('#loader').hide()
    console.log(nearby_data)
  
    setMarkers(nearby_data);
    plotElements();
    getInfo(nearby_data);
    updateChart(area_Chart, total_area);
    updateChart(frontage_Chart, frontage);
    updateChart(room_Chart, room);
    updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
    update311(request);
    updatevio(viodf);
    updateparcel(nearby);
    updateCensus(censusData);
  });
}

function Search() {
  $('#loader').show()
  $('#btnGroupAddon').off('click', Search);
  $('#btnGroupAddon').attr("disabled", true);
  $('#btnGroupDrop1').attr("disabled", true);

  var inputAddr = $('.form-control').val();
  if(inputAddr===""){
    inputAddr = "1200 W VENANGO ST"
  }
  parcelURL = newapi(inputAddr);
  //console.log(parcelURL)

  $.ajax({
    url:parcelURL,
    dataType: 'json',
    headers:{'Access-Control-Allow-Origin':'*'}
  }).done(function(parcelRes){
    $('#btnGroupAddon').on('click', Search);
    $('#btnGroupAddon').attr("disabled", false);
    $('#btnGroupDrop1').attr("disabled", false);

    parceldata= parcelRes
    $('#loader').hide()
    $('.my-legend').show();
    console.log(parceldata)

    if(parceldata.parcel_df[0].Opa_account_num=="NONE FOUND"){
      alert("Please enter an address in Philadelphia in a right format. You may click on the dropdown button to select one or try one of the following: 1200 W VENANGO ST, 1422 MOORE ST, 3812 N PERCY ST, 4054 1/2 LANCASTER AVE, 4048 LANCASTER AVE, 4058 1/2 LANCASTER AVE, 1140 W VENANGO ST, 1677 W WYOMING AVE, 1911 S GALLOWAY ST, 10904 CAREY TER, 3134 MECHANICSVILLE RD, 12466 KNIGHTS RD, 9629 WISSINOMING ST, 3118 MAUREEN DR, 3626 BISCAYNE PL")
    }
    else{
      setMarkers(parceldata);
      plotElements();

      getInfo(parceldata);

      updateChart(area_Chart, total_area);
      updateChart(frontage_Chart, frontage);
      updateChart(room_Chart, room);
      update311(request);
      updatevio(viodf);
      updateparcel(nearby);
      updaterisk(risk);
      updateCensus(censusData);
      updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
 
}


/* =====================
  Parse and store data for later use
===================== */
// var censusURL = "https://raw.githubusercontent.com/zenithchen/CPLN692Final/main/Data/Census_Tracts_2010.geojson"

$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#displayname').keydown(function(event){ 
    var keyCode = (event.keyCode ? event.keyCode : event.which);   
    if (keyCode == 13) {
        $('#btnGroupAddon').trigger('click');
    }
});

  $('#btnGroupAddon').click(Search);

})

//dropdown click addr1
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr1').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr1').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
        //$('#inputaddr').text(inputAddr)
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
   
  });

})

//dropdown click addr2
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr2').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr2').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr3
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr3').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr3').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr4
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr4').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr4').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr5
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr5').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr5').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
  });

})

//dropdown click addr6
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr6').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr6').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr7
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr7').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr7').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr8
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr8').click(function() {
    $('#loader').show()
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr8').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
  });

})

//dropdown click addr9
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr9').click(function() {
    $('#loader').show();
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr9').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})


//dropdown click addr10
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr10').click(function() {
    $('#loader').show();
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr10').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr11
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr11').click(function() {
    $('#loader').show();
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr11').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr12
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr12').click(function() {
    $('#loader').show();
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr12').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr13
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr13').click(function() {
    $('#loader').show();
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr13').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr14
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr14').click(function() {
    $('#loader').show();
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr14').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });


      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})

//dropdown click addr15
$(document).ready(function() {
  $('#loader').hide();
  $('.my-legend').hide();

  $('#addr15').click(function() {
    $('#loader').show();
    $('#btnGroupAddon').off('click', Search);
    $('#btnGroupAddon').attr("disabled", true);
    $('#btnGroupDrop1').attr("disabled", true);

    var inputAddr = $('#addr15').text()
    console.log(inputAddr)

    parcelURL = newapi(inputAddr);
    console.log(parcelURL)

    $.ajax({
      url:parcelURL,
      dataType: 'json',
      headers:{'Access-Control-Allow-Origin':'*'}
    }).done(function(parcelRes){
      $('#btnGroupAddon').on('click', Search);
      $('#btnGroupAddon').attr("disabled", false);
      $('#btnGroupDrop1').attr("disabled", false);
      $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))','background-color': 'rgba(200,200,200,0)'});
      $('#btnGroupDrop1').hover(function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(234,234,234), rgb(241,241,241))'})
          },
        function(){
        $('#btnGroupDrop1').css( {'color': 'black','background-image': 'linear-gradient(to top, rgb(235,235,235), rgb(248,248,248))'})
          });

          
      parceldata= parcelRes
      $('#loader').hide()
      $('.my-legend').show();
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
        updatevio(viodf);
        updateparcel(nearby);
        updaterisk(risk);
        updateCensus(censusData);
        updateChart2(radar_Chart, below, unsafe, com, hotel, CMX2, sealed);
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
   
  });

})