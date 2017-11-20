// ===================================================================
var center_lon = 136.881505; // 中心の経度
var center_lat = 35.171130;  // 中心の緯度

var initZoom = 8;   // ズームの初期値
var MinZoom = 6;   // ズームの最小値（最も広い範囲）
var MaxZoom = 17;  // ズームの最大値（最も狭い範囲）
// *******************************************************************
function init_map() {
    // 表示用の view 変数の定義。
    var view = new ol.View({
        projection: "EPSG:3857",
        maxZoom: MaxZoom,
        minZoom: MinZoom
    })

    // layer（地理院地図の色別標高図）用の変数
    var lay = new ol.layer.Tile({
        source: new ol.source.XYZ({
            attributions: [new ol.Attribution({
                html: "<a href='http://maps.gsi.go.jp/development/ichiran.html' target='_blank'>国土地理院</a>"
            })],
            url: "http://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png",
            projection: "EPSG:3857"
        })
    })

    // 地図変数 (map 変数) の定義。地理院地図を表示するように指定している。
    var map = new ol.Map({
        target: document.getElementById('map'),
        layers: [lay],
        view: view,
        renderer: ['canvas', 'dom'],
        controls: ol.control.defaults().extend([new ol.control.ScaleLine()]),
        interactions: ol.interaction.defaults()
    });

    // zoom slider の追加
    map.addControl(new ol.control.ZoomSlider());

    // 中心の指定。view に対して指定。transform を忘れないこと。
    view.setCenter(ol.proj.transform([center_lon, center_lat], "EPSG:4326", "EPSG:3857"));

    // zoom の指定。view に対して指定する。
    view.setZoom(initZoom);

    // 各ベクター等のスタイル
    var features = new ol.Collection();
    var featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector({ features: features }),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff3333',
                width: 3
            }),
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#ff3333'
                })
            })
        })
    });
    featureOverlay.setMap(map);

    var modify = new ol.interaction.Modify({
        features: features,
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function (event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });
    map.addInteraction(modify);

    var draw; // global so we can remove it later
    var typeSelect = document.getElementById('type');

    function addInteraction() {
        draw = new ol.interaction.Draw({
            features: features,
            type: /** @type {ol.geom.GeometryType} */ (typeSelect.value)
        });
        map.addInteraction(draw);
    }


    /**
     * Handle change event.
     */
    typeSelect.onchange = function () {
        map.removeInteraction(draw);
        addInteraction();
    };

    addInteraction();

}