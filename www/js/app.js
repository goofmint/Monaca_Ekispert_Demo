// This is a JavaScript file
let domain = 'api.ekispert.jp';
let format = 'json';
let apiKey = 'YOUR_API_KEY';

// Page init event
document.addEventListener('init', function(event) {
  var page = event.target;
  
  // 最初の都道府県一覧です
  if (page.matches('#list-page')) {
    // 都道府県をタップすると、その都道府県にある鉄道会社をリストアップします
    $(page).find('#prefecture ons-list-item').on('click', function(e) {
      
      // 都道府県コードを使います
      let prefecture_id = $(e.target).parents('ons-list-item').data('prefecture-id');
      
      // URLは次のようになります
      let url = `https://${domain}/v1/${format}/operationLine?prefectureCode=${prefecture_id}&key=${apiKey}`;
      
      // Ajaxで取得します
      $.ajax({
        url: url,
        dataType: 'json'
      })
      .then(function(results) {
        
        // データを取得したら鉄道会社一覧を表示します
        $('#navigator')[0].pushPage('trains.html', {
          data: {
            prefecture_id: prefecture_id,
            corporations: results.ResultSet.Corporation
          }
        });
      })
      
    });
    
  } else if (page.matches('#train-page')) {
    // 鉄道会社一覧の画面です
    let prefecture_id = page.data.prefecture_id;
    
    // 画面を作ります
    let html = [];
    $(page.data.corporations).each(function(index, train) {
      html.push(`<ons-list-item data-name="${train.Name}" modifier="chevron" tappable>${train.Name}</ons-list-item>`);
    });
    $('#trains').html(html.join(''));
    
    // 鉄道会社をタップしたら駅名一覧を取得します
    $(page).find('#trains ons-list-item').on('click', function(e) {
      // 鉄道会社名を使います
      let name = $(e.target).parents('ons-list-item').data('name');
      
      // URLは次のようになります
      let url = `https://${domain}/v1/${format}/station?prefectureCode=${prefecture_id}&key=${apiKey}&gcs=wgs84&corporationBind=${name}`;
      
      // Ajaxで取得します
      $.ajax({
        url: url,
        dataType: 'json'
      })
      .then(function(results) {
        // データを取得したら地図画面を表示します
        $('#navigator')[0].pushPage('map.html', {
          data: {
            stations: results.ResultSet.Point
          }
        });
      })
    });
  
  }else if (page.matches('#map-page')) {
    // 地図画面です
    let mapDiv = $(page).find("#map")[0];
    
    // 地図の初期表示として最初の駅の位置情報を使います
    let firstStation = page.data.stations[0];
    let map = new google.maps.Map(mapDiv, {
      zoom: 16,
      center: new google.maps.LatLng(
        firstStation.GeoPoint.lati_d,
        firstStation.GeoPoint.longi_d
      )
    });
    
    // 駅の位置をマーカーに落とします
    var bounds = new google.maps.LatLngBounds();
    $(page.data.stations).each(function(index, station) {
      let marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(station.GeoPoint.lati_d, station.GeoPoint.longi_d)
      });
      bounds.extend (marker.position);
    });
    
    // マーカー全体が表示されるように表示位置を調整します
    map.fitBounds (bounds);
  }
});
