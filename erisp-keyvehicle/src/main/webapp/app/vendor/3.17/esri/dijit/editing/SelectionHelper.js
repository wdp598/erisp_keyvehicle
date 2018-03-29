// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.17/esri/copyright.txt for details.
//>>built
define("esri/dijit/editing/SelectionHelper","dojo/_base/declare dojo/_base/lang dojo/_base/connect dojo/_base/array dojo/has dojo/DeferredList ../../geometry/Extent ../../geometry/Point ../../geometry/ScreenPoint ../../layers/FeatureLayer ../../tasks/query ../../kernel".split(" "),function(l,h,m,f,q,r,s,t,n,k,p,u){l=l(null,{declaredClass:"esri.dijit.editing.SelectionHelper",constructor:function(a){this._settings=a||{};this._sConnects=[];this._mapServiceCount=0;this._map=this._settings.map;this._tolerance=
this._settings.singleSelectionTolerance;this._initMapServiceInfos(this._settings.layers)},destroy:function(){for(var a in this._sConnects)this._sConnects.hasOwnProperty(a)&&m.disconnect(this._sConnects[a])},selectFeatures:function(a,b,c,d){c===k.SELECTION_NEW&&(this._resetMapServiceInfos(),this.getSelection(a));var e=[];f.forEach(a,function(a){if(!0===a.visible&&!0===a._isMapAtVisibleScale()){var d=c;a._isSelOnly&&d===k.SELECTION_NEW&&(d=k.SELECTION_ADD);e.push(a.selectFeatures(b,d))}});(new r(e)).addCallback(h.hitch(this,
function(b){var e=[];f.forEach(b,function(b,c){f.forEach(b[1],function(b){(b=a[c]._mode._getFeature(b.attributes[a[c].objectIdField])||null)&&e.push(b)},this)},this);this._mapServiceCount?((b=c===k.SELECTION_SUBTRACT)?(this._resetMapServiceInfos(),this._createLayerDefs(this._getLayerInfosFromSelection(a))):this._createLayerDefs(this._getLayerInfosFromFeatures(e)),this._updateLayerDefs(this._mapServiceInfos,!1,!(e&&e.length||b),h.hitch(this,d,e))):d(e)}))},selectFeaturesByGeometry:function(a,b,c,d){var e=
b;-1!==b.declaredClass.indexOf("Extent")&&b.xmax===b.xmin&&b.ymax===b.ymin&&(e=new t(b.xmax,b.ymax,b.spatialReference));e=-1!==e.declaredClass.indexOf("Point")?this._extentFromPoint(e):e;b=new p;b.geometry=e;this.selectFeatures(a,b,c,d)},clearSelection:function(a){f.forEach(this._nonSelOnlyLayers,function(a){a.clearSelection&&a.clearSelection()});if(this._mapServiceCount){this._resetMapServiceInfos();var b=this._getLayerInfosFromSelection(this._settings.layers);f.some(b,function(a){return a.oids&&
a.oids.length})&&(this._createLayerDefs(b),this._updateLayerDefs(this._mapServiceInfos,!0,a||!1))}},findMapService:function(a){var b=this._map,c=b.layerIds;a=a&&a._url&&a._url.path?a._url.path.toLowerCase():"";var d,e,g;for(e in c)if(c.hasOwnProperty(e)&&(d=b.getLayer(c[e]),g=d._url?d._url.path?d._url.path.toLowerCase().replace("mapserver","featureserver"):d._url.toLowerCase().replace("mapserver","featureserver"):"",a.substr(0,g.length)===g&&"esri.layers.ArcGISDynamicMapServiceLayer"===d.declaredClass))return d},
getSelection:function(a){var b=[];f.forEach(a,function(a){a._isSelOnly&&b.push(this._createLayerInfo(a))},this);f.forEach(b,function(a){var b=this._createMapServiceInfo(this.findMapService(a.layer));b&&(b.layerInfos[a.layer.layerId]=a)},this)},_initMapServiceInfos:function(a){this._nonSelOnlyLayers=[];this._mapServiceInfos=[];f.forEach(a,function(a){var c=this.findMapService(a);c?(this._mapServiceCount++,this._createMapServiceInfo(c),c&&c.setDisableClientCaching(!0)):this._nonSelOnlyLayers.push(a)},
this)},_createMapServiceInfo:function(a){if(!a)return null;var b=this._mapServiceInfos,c=b[a.id];c||(c=b[a.id]={mapService:a,layerInfos:[],layerDefs:h.mixin([],a.layerDefinitions||[]),origLayerDefs:h.mixin([],a.layerDefinitions||[])});return c},_resetMapServiceInfo:function(a){f.forEach(a.layerInfos,this._resetLayerInfo);a.layerDefs=h.mixin([],a.origLayerDefs||[])},_resetMapServiceInfos:function(){var a=this._mapServiceInfos,b;for(b in a)a.hasOwnProperty(b)&&this._resetMapServiceInfo(a[b])},_createLayerInfo:function(a,
b){var c=a.objectIdField,d=b?[]:a.getSelectedFeatures();return{layer:a,selectedFeatures:d||[],oids:f.map(d,function(a){return a.attributes[c]})}},_resetLayerInfo:function(a){a&&(a.selectedFeatures=[],a.oids=[])},_updateLayerDefs:function(a,b,c,d){for(var e in a)if(a.hasOwnProperty(e)){var g=a[e],f=g.mapService,k=g.layerDefs=b?h.mixin([],g.origLayerDefs||[]):g.layerDefs;k?(c?d&&d():this._sConnects[f.id]=m.connect(f,"onUpdateEnd",h.hitch(this,"_onMapServiceUpdate",g,b,d)),f.setLayerDefinitions(k,c||
!1)):d&&d()}},_onMapServiceUpdate:function(a,b,c){m.disconnect(this._sConnects[a.mapService.id]);f.forEach(a.layerInfos,function(a){if(b)a&&a.layer.clearSelection();else{var c=new p;c.objectIds=a?a.oids:[];c.objectIds.length&&a.layer.selectFeatures(c,k.SELECTION_SUBTRACT)}},this);b&&this._resetMapServiceInfo(a);c&&c()},_createLayerDefs:function(a){f.forEach(a,function(a){var c=a.layer,d=this._createMapServiceInfo(this.findMapService(a.layer));if(d){var d=d.layerDefs,e=c.layerId,g='("'+c.objectIdField+
'" NOT IN (',h=a.oids;h&&h.length&&(f.forEach(a.oids,function(a,b){h=!0;b&&(g+=",");g+="'"+a+"'"}),g+="))",d[e]=d.length&&d[e]&&d[e].length?d[e]+(" AND"+g):g)}},this)},_getLayerInfosFromFeatures:function(a){var b=[];f.forEach(a,function(a){var c=a.getLayer();c&&c._isSelOnly&&(b[c.id]||(b[c.id]=this._createLayerInfo(c,!0)),b[c.id].selectedFeatures.push(a),b[c.id].oids.push(a.attributes[c.objectIdField]))},this);a=[];for(var c in b)b.hasOwnProperty(c)&&a.push(b[c]);return a},_getLayerInfosFromSelection:function(a){var b=
[];f.forEach(a,function(a){a._isSelOnly&&b.push(this._createLayerInfo(a,!1))},this);return b},_extentFromPoint:function(a){var b=this._tolerance,c=this._map,d=c.toScreen(a);a=new n(d.x-b,d.y+b);b=new n(d.x+b,d.y-b);a=c.toMap(a);b=c.toMap(b);return new s(a.x,a.y,b.x,b.y,c.spatialReference)}});q("extend-esri")&&h.setObject("dijit.editing.SelectionHelper",l,u);return l});