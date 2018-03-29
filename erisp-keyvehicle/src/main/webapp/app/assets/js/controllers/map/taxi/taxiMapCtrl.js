app.controller('taxiMapCtrl', [
		'$scope',
		'$modal',
		'$filter',
		'$timeout',
		'$state',
		'$stateParams',
		'taxiMapService',
		'$rootScope',
		'SweetAlert',
		'$interval',
		function($scope, $modal, $filter, $timeout, $state, $stateParams, taxiMapService, $rootScope,SweetAlert, $interval) {
			
	$scope.queryConditionData = {};
	$scope.locations = [];		//存储所有车辆信息数据
	$scope.hisLocations = [];	//存储某段时间内某辆车的历史轨迹信息数组
	$scope.realLocations = [];	//存储某一车辆历史轨迹信息数组
	$scope.queryConditionData.vehicleType = "";
	$scope.vehicleModel = {};	
//	$scope.plateNumberLocations = ["B","C","D"];//车牌地址数组
	$scope.plateNumberLocations = ["G"];//车牌地址数组
	$scope.plateInfo = {};	//车牌信息集合
	$scope.disposalMethods = "处置";
    $scope.hyDepartment = "物流云平台";
    $scope.disposalProcess = {};
	var graps = []; //存储图标图层实例
	var len;//graps的长度
	var map;	//地图
	var dialog; //弹出框
	var layerOfTaxi; //新能源图层
	var layerOfOnVehicle; //定位某两车的图层
	var textGrapLayer; //定位某辆车的车牌号图层
	var gra;
	var pN;		//选中车辆的车牌号码
	var refresh = false;//实时信息是否定时刷新，默认false
	var hisRefresh = false;//车辆历史轨迹是否定时刷新，默认为false
	var fristComing = true;//是否第一次进入,默认为true
	var timeClicked = false;//包含开始结束时间的div是否被点击，默认为false
	var infoIsClicked = false;//基本信息按钮是否被点击，默认为false
	var trajectoryIsClicked = false;//行驶轨迹按钮是否被点击，默认为false
	var earlyWarningIsClicked = false;//预警处置按钮是否被点击，默认为false
	var gpsIsClicked = false;//GPS轨迹按钮是否被点击，默认为false
	var bayonetIsClicked = false;//卡口轨迹按钮是否被点击，默认为false
	var hourIsClicked = false;//1小时内按钮是否被点击，默认为false
	var dayIsClicked = false;//24小时内按钮是否被点击，默认为false
	var customizeIsClicked = false;//自定义时间按钮是否被点击，默认为false
	var singleCar; //记录上个选中车辆的实时标记，以便移除
	var haveShowLine = false; //标记是否打开了行驶轨迹
	var timeRefresh; //实时刷新车辆历史轨迹
	var realLocalRefresh; //实时刷新单个车辆位置定时器
	var warningRefresh; //预警信息定时刷新
	var showLineRefresh; //历史轨迹定时刷新
	var queryRefresh; //车辆定时刷新
	var globalPlateNumber; //记录选中辆车的车牌号
    var showLineLength = 1; //定义每次加载的历史轨迹长度
    var loadLocalTimes = 0; //加载某辆车实时位置的次数
    var checkedName;	//菜单选择框名称
    var posX; //气泡弹出div的x坐标
    var posY;//气泡弹出div的y坐标
    var vehicleBaseInfo; //车辆基本信息
    var isRegisterArea = false;//是否只显示注册地相关信息
    var onlineStateCheck = "1";//在线离线过滤
    var showZoom;//分局显示不同层级
    var showCenterPoint;//分局显示不同中心点
    var bubbleContentSize = $rootScope.bubbleContentSize;//气泡内容文字大小
    var bubbleTitleSize = $rootScope.bubbleContentSize;//气泡标题文字大小
	
	$scope.currentPage = 1;//初始化当前页
    $scope.pageSize = 10;//初始化每页大小
    $scope.queryConditionData = {
            'currentPage':  1,
            'pageSize': $scope.pageSize
    }
    
    var textgraph;//文字要素
    var textgraphs=[];//文字要素数组
    var layerOfTaxiText; //新能源图层
	var mapZoom = 16;
//	var mapZoom = 8;//内网地图缩放等级
	//标记当前图层是否在显示状态
	var layerOfTaxiFlag = false;
	var departName = $rootScope.depName;
	var ascriptionCompany="";//所属企业
	
	$scope.showall = false;//panel显示全部左侧
	$scope.showright = true;//右侧
	
	$scope.showAllTypeIco = true; //显示全部车辆类型图标注释
	$scope.showUpTypeIco = false;
	
	$scope.showTotal = true;//显示统计信息
	
	$scope.toLeftRigth = function(showFlag,position){
		if(position == "left"){
			$scope.showall = showFlag;
		}else if(position == "right"){
			$scope.showright = showFlag;
		}
	}
    
	$scope.toUpDown = function(showFlag,position){
		if(position == "down"){
			$scope.showAllTypeIco = showFlag;
		}else if(position == "up"){
			$scope.showUpTypeIco = showFlag;
		}
	}
	
	//切换车辆统计信息显示或隐藏
    $scope.showTotalLabel = function(showFlag){
    	$scope.showTotal = showFlag;
    }
	
    //翻页
    $scope.pageChanged = function () {
	   	//当前页
	   	$scope.queryConditionData.currentPage = $scope.currentPage;
	   	$scope.queryFunction();
    };
    
    $(document).ready(function(){
    	for(var i = 0;i<$scope.plateNumberLocations.length;i++){
    		$("#plateNumberLocations").append("<option value='"+$scope.plateNumberLocations[i]+"'>"+$scope.plateNumberLocations[i]+"</option>");
    	}
    })
	 
	//重置
	$scope.reset = function(){
		$("#plateNumber").empty();
		$scope.queryConditionData = {};
		};

	//查询所有车辆信息
    $scope.queryFunction = function () {
    	if(queryRefresh!=undefined){
			$interval.cancel(queryRefresh);
		}
    	$scope.queryConditionData.plateNumber = "川" + $scope.plateInfo.location + $("#plateNumber").val().toUpperCase().trim();
//    	$scope.queryConditionData.ascriptionCompany = $("#ascriptionCompany").val();
    	$scope.queryConditionData.pageSize = 10;
//    	$scope.queryConditionData.departmentName = $rootScope.chineseDepName;
    	taxiMapService.queryTaxiInfo($scope.queryConditionData,function (data) {
    	    if (data.state == 200) {
            	$scope.taxiInfoList = data.messageBody.taxiInfo;
            	$scope.totalItems = data.messageBody.page.count;
            	$scope.currentPage = data.messageBody.page.page;
            	$scope.pages = data.messageBody.page.pages;
            }
        }, function (err) {
        })
        
        ascriptionCompany = $("#ascriptionCompany").attr("hideValue");
    	$scope.query("B");
    	queryRefresh = $interval(function(){
	    	$scope.refresh();
	    },30000);
    };
    
    //获取所属企业下拉列表
    $scope.inputAscriptionCompanyName = function(){
    	$scope.queryConditionData.ascriptionCompany = $("#ascriptionCompany").val();
    	taxiMapService.queryAscriptionCompany($scope.queryConditionData,function (data) {
    	    if (data.state == 200) {
            	$scope.ascriptionCompanyList = data.messageBody.ascriptionCompanyList;
            	var list = $scope.ascriptionCompanyList;
            	var datas = [];
            	for(var i=0;i<list.length;i++){
            		var data = {};
            		data["label"] = list[i].companyName;
            		data["value"] = list[i].companyName;
            		data["id"] = list[i].id;
            		datas.push(data);
            	}
            	$('#ascriptionCompany').autocompleter('clearCache');
            	$('#ascriptionCompany').autocompleter('destroy');
            	$('#ascriptionCompany').autocompleter({
                    highlightMatches: true,
                    source: datas,
                    template: '{{ label }}',
                    hint: true,
                    empty: false,
                    limit: 5,
                    callback: function (value, index, selected) {
                        if (selected) {
                        	$('#ascriptionCompany').attr("hideValue",selected.id); 
                        }
                    }
                });
            }
        }, function (err) {
        })
	}
    
	//点击车辆信息显示其基本信息和轨迹选择方框
	$scope.checkedVehicle = function(data,e){
		hisRefresh = false;
		pN = data.plateNumber;
		globalPlateNumber = pN;
		$scope.oneInfo = data;
		$scope.showOneVehicleInfo(data.strVehicleNo);
		//选中行加色
		if(e!=undefined && e!=""){
			$(e.currentTarget).addClass("vehicleInfoTr").siblings().removeClass("vehicleInfoTr");
		}
	}
	
	//点击一辆车辆，显示其相关的界面和信息
	$scope.showOneVehicleInfo = function(plateNumber){
		if(queryRefresh!=undefined){
			$interval.cancel(queryRefresh);
		}
		if(realLocalRefresh!=undefined){
			$interval.cancel(realLocalRefresh);
		}
		$scope.hideAllGraphics();
		$scope.tabOnOneVehicle(plateNumber);
		map.setZoom(14);
	}
	
	//标记出选定的车辆
	$scope.tabOnOneVehicle = function(plateNumber) {
	    var queryConditionParams = {};
	    queryConditionParams['plateNumber'] = plateNumber;
	    var pt, pic;
	    var attr;
	    var pn = plateNumber.replace("川", "");
	    //result:车辆基本信息
	    var result = [];
	    //vehicleRealInfo:车辆实时信息
	    var vehicleRealInfo = [];
	    //vehicleDriveInfo:车辆预警信息
	    var vehicleDriveInfo = [];
	    taxiMapService.queryOneVehicleRealTimeInfoSyn(queryConditionParams)
	    .then(function(data){
	    	if (data.state == 200 && data.messageBody.oneVehicleRealTimeInfo != null) {
	    		if(layerOfOnVehicle != null & layerOfOnVehicle != undefined) {
	    			layerOfOnVehicle.suspend();
	                layerOfOnVehicle.clear();
	            }
	    		if(textGrapLayer != null & textGrapLayer != undefined) {
	    			textGrapLayer.suspend();
	    			textGrapLayer.clear();
	            }
	    		result = data.messageBody.oneVehicleRealTimeInfo;
	    		
		    	var vehicleType = "B";
		        var onState = "";
		        var isRegister = "";
		        taxiMapService.queryVehicleInfoByVehicleTypeSyn(vehicleType, departName, pn, onState, isRegister)
		        .then(function(data) {
		        	if (data.status == 0 && data.datas.length>0) {
	                    vehicleRealInfo = data.datas[0];
	                } else {
	                    vehicleRealInfo["dateTime"] = "";
	                    vehicleRealInfo["gpsState"] = "0";
	                    vehicleRealInfo["speed"] = "0";
	                    vehicleRealInfo["course"] = "0";
	                    vehicleRealInfo["maxSpeed"] = "0";
	                    vehicleRealInfo["roadName"] = "0";
	                    vehicleRealInfo["longitude"] = "";
	                    vehicleRealInfo["latitude"] = "";
	                }
		        	
		        	taxiMapService.queryDataOfDialogSyn(plateNumber, departName)
		            .then(function(data) {
		            	if (data.status == 0 && data.datas.length>0) {
	                        vehicleDriveInfo = data.datas[0];
	                    } else {
	                        vehicleDriveInfo["yearWarningTimes"] = "0";
	                        vehicleDriveInfo["warningTimes"] = "0";
	                    }
		            	
			            //添加车标
			        	if(vehicleRealInfo.longitude!="" && vehicleRealInfo.latitude!=""){
			        		layerOfTaxi.suspend();
	                        layerOfTaxiText.suspend();
	                        layerOfTaxi.clear();
	                        layerOfTaxiText.clear();
				            pt = new esri.geometry.Point(vehicleRealInfo.longitude, vehicleRealInfo.latitude);
				            var textgraph = new esri.Graphic(pt,new esri.symbol.TextSymbol(plateNumber).setOffset(20, 10));
				            if(vehicleRealInfo.gpsState==1){
				            	pic = new esri.symbol.PictureMarkerSymbol("assets/images/taxi/taxi-90.png", imageSize, imageSize);
				            }else{
				            	pic = new esri.symbol.PictureMarkerSymbol("assets/images/taxi/taxi-offline.png", imageSize, imageSize);
				            }
				            attr = {
				                "vehicleType": result.vehicleType,
				                "plateNumber": result.plateNumber
				            };
			            	map.infoWindow.resize(500, 560);
		                    //离线车辆显示最后在线时间和最后所在地
		                    //在线车辆不显示最后在线时间，显示车辆所在地
		                    var onlineTime;
		                    var addrName;
		                    var stateDivWidth;
		                    if (vehicleRealInfo.gpsState == 1) {
		                        onlineTime = "";
		                        addrName = "车辆所在地";
		                        stateDivWidth = "150";
		                    } else {
		                        onlineTime = "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>车辆最后在线时间：</font>" + $scope.convertWarningTime(vehicleRealInfo.dateTime) + "</td></tr>";
		                        addrName = "车辆最后所在地";
		                        stateDivWidth = "180";
		                    }
	
		                    var vehicleType = result.vehicleType.replace(/车/, "");
		                    var title = "<div style='line-height:2;'><font style='font-weight:bold;font-size:18px;color:#000000;z-index:-1;'>" + 
		                    	"车牌号码：<label class='pn' style='font-size:18px;'>" + plateNumber + "</label>——出租车</font></div>" + 
		                    	"<div style='height:2px;border:none;border-top:1px solid #919191;width:98%;'></div>";
		                    var content = "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:120px;z-index:-1;'>" + 
		                    	"<div class='col-md-12 font_black_famil'>" + 
		                    	"<div style='font-size: 18px;'>基本信息</div>" + 
		                    	"<div class='title_line_map' style='width:100%;'></div>" + 
		                    	"<table style='font-size:18px;width:100%;'>" +
			                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>驾驶员：</font>" + $scope.convertIntoCityCard(result.intoCityCard) + "</td>" + 
			                    "<td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>性别：</font>" + $scope.convertPlateType(result.plateType) + "</td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>电话号码：</font>" + result.competentAuthority + "</td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>行业主管部门：</font></td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>所属企业：</font>" + result.ascriptionCompany + "</td></tr>" + 
			                    "</table></div></div>" + "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:" + stateDivWidth + "px;margin-top:10px;'>" + 
			                    "<div class='col-md-12 font_black_famil'>" + 
			                    "<div style='font-size: 18px;'>状态信息</div>" + 
			                    "<div class='title_line_map' style='width:100%;'></div>" + 
			                    "<table style='font-size:18px;width:100%'>" + 
			                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>年度累计报警次数：</font>" + vehicleDriveInfo.yearWarningTimes + "次</td>" + 
			                    "<td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>在线离线状态：</font>" + $scope.convertOnlineState(vehicleRealInfo.gpsState) + "</td></tr>" + 
			                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>车辆速度：</font><font style='color: green;font-weight:bold;'>" + vehicleRealInfo.speed + "</font>km/h</td>" + 
			                    "<td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>年审状态：</font>正常</td></tr>" + 
			                    //"<tr><td><a style='color:red;font-size: 14px;' class='accidentTotal'><font style='font-weight:bold;font-size:14px;'>年度事故次数：</font>" + result.accidentTotal + "次</a></td>" + 
			                    //"<td><a style='color:red;font-size: 14px;' class='illegalTotal'><font style='font-weight:bold;font-size:14px;'>年度违法次数：</font>" + result.illegalTotal + "次</a></td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>今日最高速度：</font><font style='color: green;font-weight:bold;'>" + vehicleRealInfo.maxSpeed + "</font>km/h</td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>今日行驶预警次数：</font><font style='color: red;font-weight:bold;'>" + vehicleDriveInfo.warningTimes + "</font>次</td></tr>" + onlineTime + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>" + addrName + "：</font>" + $scope.convertRoadname(vehicleRealInfo.roadName) + "</td></tr>" + 
			                    "</table></div></div>" + 
			                    "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:80px;margin-top:10px;'>" + 
			                    "<div class='col-md-12 font_black_famil'>" + "<div style='font-size: 18px; '>操作</div>" + 
			                    "<div class='title_line_map' style='width:100%;'></div>" + 
			                    "<table style='width:100%'><tr>" + 
			                    "<td>&nbsp;&nbsp;<img id='toRealLine' hideType='one' hideValue='" + plateNumber + "' src='assets/images/real_line_button.png' style='cursor:pointer;'></td>" + 
			                    "<td>&nbsp;&nbsp;<img id='toHisLine' hideType='one' hideValue='" + plateNumber + "' src='assets/images/his_line_button.png' style='cursor:pointer;'></td></tr>" + 
			                    //"<tr><td style='height:32px;'>&nbsp;&nbsp;<img id='showPlatePic' hideValue='" + result.platePictureUrl + "' src='assets/images/show_pic_button.png' style='cursor:pointer;'></td>" + 
			                    //"<td>&nbsp;&nbsp;<img id='bayonetButton' hideValue='" + plateNumber + "' src='assets/images/rec_button.png' style='cursor:pointer;'></td></tr>"+
			                    "</table>" + 
			                    "</div></div>";
		                    var gp = new esri.Graphic(pt, pic, attr);
		                    layerOfOnVehicle = new esri.layers.GraphicsLayer();
		                    layerOfOnVehicle.add(gp);
		                    infoTemplate = new esri.InfoTemplate(title, content);
		                    layerOfOnVehicle.setInfoTemplate(infoTemplate);
		                    textGrapLayer = new esri.layers.GraphicsLayer();
		                    textGrapLayer.add(textgraph);
		                    map.addLayer(layerOfOnVehicle);
		                    map.addLayer(textGrapLayer);
		                    if (singleCar != null && singleCar != '') {
		                        map.graphics.remove(singleCar);
		                    }
		                    layerOfTaxi.resume();
	                        layerOfTaxiText.resume();
		                    //把地图中心定位到该车辆的位置
		                    map.centerAt(pt);
		                    /*if (loadLocalTimes == 0) {
		                    	if(realLocalRefresh!=undefined){
		                    		$interval.cancel(realLocalRefresh);
		                    	}else{
			                        realLocalRefresh = $interval(function() {
			                            $scope.tabOnOneVehicle(globalPlateNumber);
			                        },5000, 60);
		                    	}
		                    }*/
		                    loadLocalTimes++;
			        	}else{
			        		$("#msgDiv").show().delay(1000).hide(1000);
			        	}
		            });
		        });
	    	}
	    });
	}
	
	//单搜某辆车后定时刷新
	$scope.oneVehicleReressh = function(){
		if (globalPlateNumber != undefined) {
            realLocalRefresh = $interval(function() {
                $scope.tabOnOneVehicle(globalPlateNumber);
            },5000, 60);
        }
	}
	
	/**********************************地图图层显示start**********************************/
    $scope.showMap = function(){
    	require([  
            "esri/map", 
            "esri/layers/ArcGISTiledMapServiceLayer", 
            "esri/geometry/Extent", 
            "esri/geometry/Point", 
            "esri/geometry/Polyline", 
            "esri/SpatialReference",  
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/PictureMarkerSymbol", 
            "esri/symbols/SimpleLineSymbol", 
            "esri/layers/GraphicsLayer", 
            "esri/symbols/SimpleFillSymbol", 
            "esri/lang",
            "esri/Color", 
            "dojo/dom-style",
            "dijit/TooltipDialog", 
            "dijit/popup", 
            "esri/graphic"  
        ], function(
        		Map, 
        		ArcGISTiledMapServiceLayer, 
        		Extent, 
        		Point, 
        		Polyline, 
        		SpatialReference, 
        		SimpleMarkerSymbol,
        		PictureMarkerSymbol, 
        		SimpleLineSymbol, 
        		GraphicsLayer, 
        		SimpleFillSymbol, 
                esriLang,
                Color, 
                domStyle,
                TooltipDialog, 
                dijitPopup,
        		Graphic) {
            // BASE_SERVER配置移至app.js
            map = new Map("taxiMap", {  
//              zoom: 4,//内网地图缩放等级
            	center:showCenterPoint,
                zoom: showZoom,
                logo:false,
                nav:false,
                slider:false
            }); 
    		var layer = new ArcGISTiledMapServiceLayer(BASE_SERVER);
//    		var layer1 = new esri.layers.ArcGISDynamicMapServiceLayer("http://20.0.56.14:8399/arcgis/rest/services/cd_transperant/MapServer");
//    		layer1.setVisibleLayers([0,1,2]);//设置图层显示
//    		layer1.setOpacity(0.5);//设置图层透明度
    		
            map.addLayer(layer);
//            map.addLayer(layer1);
            
            layerOfTaxi = new GraphicsLayer();
            map.addLayer(layerOfTaxi);
            //添加点击事件
            layerOfTaxi.on("mouse-down",function(e){
     			$scope.showDialog(e);
            });
     		
            layerOfTaxiText = new GraphicsLayer();
            map.addLayer(layerOfTaxiText);
            
            layerOfTaxiText.setVisibility(false);
            map.on("zoom", function(e){
            	if(map.getZoom()>mapZoom){
            		layerOfTaxiText.setVisibility(true);
            	}else{
            		layerOfTaxiText.setVisibility(false);
            	}
            });
            
          //点击车辆图标弹出气泡
       	 $scope.showDialog = function(e){
       		 var plateNumber = e.graphic.attributes.plateNumber;
       		 var warningType = e.graphic.attributes.warningType;
       		 var warningStartTime = e.graphic.attributes.warningStartTime;
       		 var gpsState = e.graphic.attributes.gpsState;
       		 var dateTime = e.graphic.attributes.dateTime;
       		 var longitude = e.graphic.attributes.longitude;
       		 var latitude = e.graphic.attributes.latitude;
       		 var roadName = e.graphic.attributes.roadName;
       		 var speed = e.graphic.attributes.speed;
       		 var maxSpeed = e.graphic.attributes.maxSpeed;
       		 var vehicleInfo;
       		 var vehicleBaseInfo;
       		 taxiMapService.queryVehicleDriveInfo(plateNumber,function (data) {
      			if (data.state == 200) {
      				 vehicleBaseInfo = data.messageBody.taxiInfo;
      				var plate = plateNumber.replace('川','');
      			taxiMapService.queryDataOfDialog(plate,departName,function (data) {
        			if (data.status == 0) {
        				vehicleInfo = data.datas[0];
        			//离线车辆显示最后在线时间和最后所在地
        			//在线车辆不显示最后在线时间，显示车辆所在地
        			var onlineTime;
        			var addrName;
        			var stateDivWidth;
              		if(gpsState==1){
              			onlineTime = "";
              			addrName = "车辆所在地";
              			stateDivWidth = "150";
              		}else{
              			onlineTime = "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>车辆最后在线时间：</font>"+$scope.convertWarningTime(dateTime)+"</td></tr>";
              			addrName = "车辆最后所在地";
              			stateDivWidth = "180";
              		}
              		var vehicleType;
        			if(null != vehicleBaseInfo.vehicleType && undefined != vehicleBaseInfo.vehicleType){
        				vehicleType = vehicleBaseInfo.vehicleType.replace(/车/, "");
        			}
        			var title = "<div style='line-height:2;'><font style='font-weight:bold;font-size:18px;color:#000000;z-index:-1;'>" +
	          			"车牌号码：<label class='pn' font-size:18px;>"+plateNumber+"</label>——出租车</font></div>" +
	          			"<div style='height:2px;border:none;border-top:1px solid #919191;width:98%;'></div>";
     				var content = "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:120px;z-index:-1;'>"+
	     				"<div class='col-md-12 font_black_famil'>"+
	    				"<div style='font-size: 18px;'>基本信息</div>"+
	    				"<div class='title_line_map' style='width:100%;'></div>"+
	         			"<table style='font-size:18px;width:100%;'>" +
	                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>驾驶员：</font>" + $scope.convertName(vehicleBaseInfo) + "</td></tr>" + 
	                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>性别：</font>" + $scope.convertSex(vehicleBaseInfo) + "</td></tr>" + 
	                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>行业主管部门：交委</font></td></tr>" + 
	                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>所属企业：</font>" + vehicleBaseInfo.strComshort + "</td></tr>" + 
	        			"</table></div></div>"+
	        			"<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:"+stateDivWidth+"px;margin-top:10px;'>"+
   	         			"<div class='col-md-12 font_black_famil'>"+
   	    				"<div style='font-size: 18px;'>状态信息</div>"+
   	    				"<div class='title_line_map' style='width:100%;'></div>"+
   	         			"<table style='font-size:18px;width:100%'>" +
   	         		    "<tr><td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>年度累计报警次数：</font>"+vehicleInfo.yearWarningTimes+"次</td>" +
   	         		    "<td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>在线离线状态：</font>"+$scope.convertOnlineState(gpsState)+"</td></tr>" +
   	         			"<tr><td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>车辆速度：</font><font style='color: green;font-weight:bold;'>"+parseInt(speed)+"</font>km/h</td>"+
	   	         		"<td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>年审状态：</font>正常</td></tr>" +
	         			//"<tr><td><a style='color:red;font-size: 14px;' class='accidentTotal'><font style='font-weight:bold;font-size:14px;'>年度事故次数：</font>"+vehicleBaseInfo.accidentTotal+"次</a></td>" +
	        			//"<td><a style='color:red;font-size: 14px;' class='illegalTotal'><font style='font-weight:bold;font-size:14px;'>年度违法次数：</font>"+vehicleBaseInfo.illegalTotal+"次</a></td></tr>"+
   	          			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>今日最高速度：</font><font style='color: green;font-weight:bold;'>"+parseInt(maxSpeed)+"</font>km/h</td></tr>" +
   	         			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>今日行驶预警次数：</font><font style='color: red;font-weight:bold;'>"+vehicleInfo.warningTimes+"</font>次</td></tr>" +
   	         			onlineTime+
   	         			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>"+addrName+":</font>"+$scope.convertRoadname(roadName)+"</td></tr>" +
   	        			"</table></div></div>"+
   	        			"<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:80px;margin-top:10px;'>"+
	         			"<div class='col-md-12 font_black_famil'>"+
	    				"<div style='font-size: 18px; '>操作</div>"+
	    				"<div class='title_line_map' style='width:100%;'></div>"+
	        			"<table style='width:100%'><tr>"+
	        			"<td>&nbsp;&nbsp;<img id='toRealLine' hideType='all' hideValue='"+plateNumber+"' hideLongitude='"+longitude+"' hideLatitude='"+latitude+"' src='assets/images/real_line_button.png' style='cursor:pointer;'></td>" +
	        			"<td>&nbsp;&nbsp;<img id='toHisLine' hideType='all' hideValue='"+plateNumber+"' hideLongitude='"+longitude+"' hideLatitude='"+latitude+"' src='assets/images/his_line_button.png' style='cursor:pointer;'></td></tr>"+
	        			//"<tr><td style='height:32px;'>&nbsp;&nbsp;<img id='showPlatePic' hideValue='"+vehicleBaseInfo.platePictureUrl+"' src='assets/images/show_pic_button.png' style='cursor:pointer;'></td>"+
	        			//"<td>&nbsp;&nbsp;<img id='bayonetButton' hideValue='"+plateNumber+"' src='assets/images/rec_button.png' style='cursor:pointer;'></td></tr>"+
	        			"</table>"+
	        			"</div></div>";
     				infoTemplate = new esri.InfoTemplate(title,content);
     				e.graphic.setInfoTemplate(infoTemplate);
      			 }
         		 }, function (err) {
         		 });
       		 }else{
       			 alert("网络异常，请联系管理员");
       		 }
       		 }, function (err) {
       		 });
       	 }
        });   
    }
    /**********************************地图图层显示end**********************************/
    
    $loadMapByCenterGps = function(){
    	var centerGps = [104.0657754083, 30.6583098090];
    	switch ($rootScope.depName) {
		case "一分局":
			centerGps = [104.03081459999999, 30.6365486];
			break;
		default:
			break;
		}
    	return centerGps;
    }
    
    $scope.convertRoadname = function(name){
    	var roadname;
    	if(name==null || name==undefined){
    		roadname = "暂无街道数据";
    	}else{
    		roadname = name;
    	}
    	return roadname;
    }
    
    $scope.convertOnlineState = function(state){
    	var onlineState;
    	switch(state){
    		case 0:
	    		onlineState = "离线";
	    		break;
    		case 1:
    			onlineState = "在线";
    			break;
    		default :
    			onlineState = "离线";	
    			break;
    	}
    	return onlineState;
    }
    
    $("body").on("click","#toRealLine",function(){
    	//dijit.popup.close(dialog);
    	var plateNumber = $(this).attr("hideValue");
    	var typeCheckedName = [];//已选的类型
    	var rightCheckedName = [];//右侧已选在线离线及注册
    	var longitude = $(this).attr("hideLongitude");
    	var latitude = $(this).attr("hideLatitude");
    	var pageType = $(this).attr("hideType");
    	$("input[type=checkbox].navCheckbox:checked").each(function(){
    		typeCheckedName.push(this.name);
    	});
    	$("input[type=checkbox].rightCheckbox:checked").each(function(){
    		rightCheckedName.push(this.name);
    	});
    	var params={plateNumber:plateNumber, longitude:longitude, latitude:latitude,
    			type:"taxiMap", typeCheckedName:typeCheckedName, rightCheckedName:rightCheckedName,pageType:pageType};
    	$state.go('app.warningDisposal.realLineMap',{params:JSON.stringify(params)});
    });
    
    $("body").on("click","#toHisLine",function(){
    	var plateNumber = $(this).attr("hideValue");
    	var typeCheckedName = [];//已选的类型
    	var rightCheckedName = [];//右侧已选在线离线及注册
    	var longitude = $(this).attr("hideLongitude");
    	var latitude = $(this).attr("hideLatitude");
    	var pageType = $(this).attr("hideType");
    	$("input[type=checkbox].navCheckbox:checked").each(function(){
    		typeCheckedName.push(this.name);
    	});
    	$("input[type=checkbox].rightCheckbox:checked").each(function(){
    		rightCheckedName.push(this.name);
    	});
    	var params={plateNumber:plateNumber, longitude:longitude, latitude:latitude,
    			type:"taxiMap", typeCheckedName:typeCheckedName, rightCheckedName:rightCheckedName,pageType:pageType};
    	$state.go('app.warningDisposal.hisLineMap',{params:JSON.stringify(params)});
    });
    
    //关闭dialog
    $("body").on("click","#closeDialog",function(){
    	$("div.dijitPopup").attr("style","display:none");
    });
    
    //查看车辆图片
    $("body").on("click","#showPlatePic",function(){
    	var pic = $(this).attr("hideValue");
    	var vehicleInfo = {};
    	vehicleInfo['platePictureUrl']=pic;
        $scope.temp = {
            'vehicleInfo':vehicleInfo
        };
        var modalInstance = $modal.open({
            templateUrl : 'assets/views/warningDisposal/vehiclePicture.html',
            controller : 'showVehiclePictureController',
            backdrop: 'static',
            keyboard: false,
            size : 'lg',
            resolve : {
                params : function() {
                    return $scope.temp;
                }
            }
        });
        modalInstance.result.then(function(result) {
            if(result == null){
                SweetAlert.swal({
                    title: "无数据",
                    timer: 2000,
                    confirmButtonText: "确定"
                });
            }
        }, function(err) {
        });
    });
    
     //根据车辆类型搜索车辆信息
	 $scope.query = function(vehicleType){
		 $scope.vehicleModel.vehicleType = vehicleType;
		 $scope.queryConditionData.vehicleType=vehicleType;
		 var pn = "";
		 taxiMapService.queryVehicleInfoByVehicleType(vehicleType,departName,pn,onlineStateCheck,isRegisterArea,ascriptionCompany,function (data) {
			 if (data.status == 0) {
				$scope.vehicleInfoView = data;
				$scope.locations = [];//清空集合
				var result = $scope.vehicleInfoView.datas;
	            graps = [];
	            showLocation(vehicleType, result);
			}
		 }, function (err) {
		 })
	 };

	 function showLocation(type, result) {
		 layerOfTaxi.suspend();
		 layerOfTaxiText.suspend();
         layerOfTaxi.clear();
         layerOfTaxiText.clear();
         for(var i = 0;i<result.length;i++){
             var vType = $scope.convertVehicleType(result[i].vehicleType);
             var pic = $scope.showPicture(result[i].course,result[i].gpsState,"taxi");
             //创建图片样式符合
             var pt = new esri.geometry.Point(result[i].longitude,result[i].latitude);//创建一个点对象
             var attr = {"vehicleType":vType,"plateNumber":result[i].plateNumber,"warningType":result[i].warningType,
                 "warningStartTime":result[i].warningStartTime,"gpsState":result[i].gpsState,"dateTime":result[i].dateTime,
                 "longitude":result[i].longitude,"latitude":result[i].latitude,"roadName":result[i].roadName,"speed":result[i].speed,"maxSpeed":result[i].maxSpeed};
             map.infoWindow.resize(500,560);
             gra = new esri.Graphic(pt,pic,attr);//设置样式
             textgraph = new esri.Graphic(pt,new esri.symbol.TextSymbol(result[i].plateNumber).setOffset(20, 10));
             //把图层实例放入数组中以便后面有针对性的移除
             if(graps.length<=len){
                 graps.push(gra);
                 textgraphs.push(textgraph);
             }
             layerOfTaxi.add(gra);
             layerOfTaxiText.add(textgraph);
         }
         layerOfTaxi.resume();
         layerOfTaxiText.resume();
     }
	 
	 //按角度加载车辆图标
	 $scope.showPicture = function(course,gpsState,type){
		 var picUrl;
		 if(gpsState==1){
			 if((338<=course && course<360) || (0<=course && course<23)){
				 //正北
				 picUrl = type+"-0.png";
			 }else if(23<= course && course < 68){
				 //东北
				 picUrl = type+"-45.png";
			 }else if(68<= course && course < 113){
				 //正东
				 picUrl = type+"-90.png";
			 }else if(113<= course && course < 158){
				 //东南
				 picUrl = type+"-135.png";
			 }else if(158<= course && course < 203){
				//正南
				 picUrl = type+"-180.png";
			 }else if(203 <= course && course < 248){
				 //西南
				 picUrl = type+"-225.png";
			 }else if(248 <= course && course < 293){
				 //正西
				 picUrl = type+"-270.png";
			 }else if(293 <= course && course < 338){
				 //西北
				 picUrl = type+"-315.png";
			 }
		 }else{
			 picUrl = type+"-offline.png";
		 }
		 var pms = new esri.symbol.PictureMarkerSymbol("assets/images/taxi/"+picUrl,imageSize,imageSize);
		 return pms;
	 }
	 
	 //转换气泡中的最近预警时间
	 $scope.convertWarningTime = function(warningEndTime){
		 var endTime;
		 if(warningEndTime != null){
			 endTime = $filter("date")(warningEndTime, "yyyy-MM-dd HH:mm:ss");
		 }else{
			 endTime = "";
		 }
		 return endTime;
	 }
	 
	 //转换日期，格式：年月日
	 $scope.convertDate = function(beforeDate){
		 var newDate;
		 if(beforeDate != null){
			 newDate = $filter("date")(beforeDate.time, "yyyy-MM-dd");
		 }else{
			 newDate = "";
		 }
		 return newDate;
	 }
	 
	 $scope.convertWarningType = function(warningType){
		var realWarningType;
		switch(warningType)
     	{
 	    	case '1':
 	    		realWarningType = "时间区域预警";
 	    		break;
 	    	case '3':
 	    		realWarningType = "超速预警";
 	    		break;
 	    	case '4':
 	    		realWarningType = "疲劳驾驶预警";
 	    		break;
 	    	default:
 	    		realWarningType = "";
				break;
     	}
		return realWarningType;
	 }
	 
	 //车辆类型转换
	 $scope.convertPlateType = function(plateType){
		 var realPlateType;
		 switch(plateType)
		 {
		 case '01':
			 realPlateType = "大车";
			 break;
		 case '02':
			 realPlateType = "小车";
			 break;
		 default:
			 realPlateType = "";
		 	break;
		 }
		 return realPlateType;
	 }
	 
	 //设置默认车辆图片
	 $scope.convertPic = function(picUrl){
		 var url;
		 if(picUrl==null || picUrl==undefined || picUrl==""){
			 url = "plate_none.png";
		 }else{
			 url = picUrl;
		 }
		 return url;
	 }
	 
	 //统计车辆数据
	 $scope.queryEarlyWarningInfoCounts = function(){
		 $scope.queryConditionData['type'] = "B";
		 taxiMapService.queryEarlyWarningInfoCounts($scope.queryConditionData.type,departName,isRegisterArea,function (data) {
				if (data.status == 0) {
					switch ($scope.queryConditionData.type) {
					case "B":
						$scope.energyInfoCounts =data.datas[0]; 
						break;
					/*case "A2":
						$scope.coldChainInfoCounts =data.datas[0]; 
						break;
					case "A3":
						$scope.dangerousInfoCounts =data.datas[0]; 
						break;
					case "A4":
						$scope.ordinaryInfoCounts =data.datas[0]; 
						break;*/
					}
				 }
			 }, function (err) {
			 });
	 }
	 
	 $scope.returnQuery = function(){
		 //取消选择单个车辆的定时器
		 if(realLocalRefresh!=undefined){
			$interval.cancel(realLocalRefresh);
		 }
		 var rightCheck = [];
	   	 $("input[type=checkbox].rightCheckbox:checked").each(function(){
	   		 rightCheck.push(this.name);
	   	 });
	   	 if($.inArray("register", rightCheck)>=0){
	   		isRegisterArea = true;
	   	 }
	   	 //只选在线 --勿删
	   	 /*if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)<0){
	   		onlineStateCheck = "1";
	   	 //只选离线
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)>=0){
	   		onlineStateCheck = "0";
	   	 //在线离线都选
	   	 }else if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)>=0){
	   		onlineStateCheck = "";
	     //在线离线都不选
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)<0){
	   		onlineStateCheck = "-1";
	   	 }*/
	   	 layerOfTaxi.clear();
		 layerOfTaxiText.clear();
 		 $scope.query("B");
	 }
	 
	 /********监听在线离线复选框状态**********************/
     $scope.lineStateName="";
     $scope.lineStateValue=false;
     $scope.lineCheck = function($event){
    	 $scope.lineStateName = $event.target.value;
    	 $scope.lineStateValue = $event.target.checked;
    	 $scope.returnQuery();
     }
     /*$scope.$watch('lineStateName + lineStateValue',function(){
     	 if($scope.lineStateValue){
     		switch($scope.lineStateName){
     			case "online":
     				$("input[type=checkbox].navCheckbox:checked").each(function(){
     					switch(this.name){
     						case "新能源":
	     						layerOfNew.setVisibility(true);
	     						break;
     						case "冷链":
     							layerOfCold.setVisibility(true);
         						break;
     						case "危化品":
     							layerOfDangerous.setVisibility(true);
         						break;
     						case "普通":
     							layerOfOrdinary.setVisibility(true);
         						break;
     					}
     				});
     		 		break;
     			case "offline":
     				$("input[type=checkbox].navCheckbox:checked").each(function(){
     					switch(this.name){
     						case "新能源":
	     						layerOfNewOff.setVisibility(true);
	     						break;
     						case "冷链":
     							layerOfColdOff.setVisibility(true);
         						break;
     						case "危化品":
     							layerOfDangerousOff.setVisibility(true);
         						break;
     						case "普通":
     							layerOfOrdinaryOff.setVisibility(true);
         						break;
     					}
     				});
     				break;
     		}
     	}else{
     		switch($scope.lineStateName){
	 			case "online":
	 				$("input[type=checkbox].navCheckbox:checked").each(function(){
	 					switch(this.name){
	 						case "新能源":
	     						layerOfNew.setVisibility(false);
	     						break;
	 						case "冷链":
	 							layerOfCold.setVisibility(false);
	     						break;
	 						case "危化品":
	 							layerOfDangerous.setVisibility(false);
	     						break;
	 						case "普通":
	 							layerOfOrdinary.setVisibility(false);
	     						break;
	 					}
	 				});
	 		 		break;
	 			case "offline":
	 				$("input[type=checkbox].navCheckbox:checked").each(function(){
	 					switch(this.name){
	 						case "新能源":
	     						layerOfNewOff.setVisibility(false);
	     						break;
	 						case "冷链":
	 							layerOfColdOff.setVisibility(false);
	     						break;
	 						case "危化品":
	 							layerOfDangerousOff.setVisibility(false);
	     						break;
	 						case "普通":
	 							layerOfOrdinaryOff.setVisibility(false);
	     						break;
	 					}
	 				});
	 				break;
     		}
     	}
     });*/
     
     $scope.registerName="";
     $scope.registerValue=false;
     $scope.registerCheck = function($event){
    	 $scope.registerName = $event.target.value;
    	 $scope.registerValue = $event.target.checked;
     }
     /*$scope.$watch('registerName + registerValue',function(newValue,oldValue){
    	 if(newValue == oldValue){
    		 return;
    	 }
    	 if(realLocalRefresh!=undefined){
 			$interval.cancel(realLocalRefresh);
 		 }
 		 isRegisterArea = $scope.registerValue;
 		 var rightCheck = [];
	   	 $("input[type=checkbox].rightCheckbox:checked").each(function(){
	   		 rightCheck.push(this.name);
	   	 });
	   	 if($.inArray("register", rightCheck)>=0){
	   		isRegisterArea = true;
	   	 }
	   	 if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)<0){
	   		onlineStateCheck = "1";
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)>=0){
	   		onlineStateCheck = "0";
	   	 }else if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)>=0){
	   		onlineStateCheck = "";
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)<0){
	   		onlineStateCheck = "-1";
	   	 }
	   	 $scope.query("B");
     });*/
     
     //清除所有车辆图层
     $scope.hideAllGraphics = function(){
    	 layerOfTaxi.setVisibility(false);
 		 layerOfTaxiText.setVisibility(false);
     }
     
     //显示所有车辆图层
     $scope.showAllGraphics = function(){
    	 layerOfTaxi.setVisibility(true);
     }
     
     function showAlert(){
    	 swal({
             title: "车牌号码不能为空！",
             type: "error",
             timer: 2000,
             confirmButtonText: "确定"
         });
     	}
    
 	//设置div可拖动
    /*accident = document.getElementById("accident");
    illegal = document.getElementById("illegal");
    bayonet = document.getElementById("bayonet");
    bayonetAddressDiv = document.getElementById("bayonetAddressDiv");
    document.onmouseup = function(){
        document.onmousemove = null;//鼠标举起，停止
    }
    $scope.mouseEvent = function(id){
    	id.onmousedown=function(e){
            posX = event.x - id.offsetLeft;//获得横坐标x
            posY = event.y - id.offsetTop;//获得纵坐标y
            document.onmousemove = eventMousemove;//调用函数，只要一直按着按钮就能一直调用
        }
        function eventMousemove(ev){
            if(ev==null) ev = window.event;//IE
            id.style.left = (ev.clientX - posX) + "px";
            id.style.top = (ev.clientY - posY) + "px";
        }
    }
    $scope.mouseEvent(accident);
    $scope.mouseEvent(illegal);
    $scope.mouseEvent(bayonet);
    $scope.mouseEvent(bayonetAddressDiv);*/
 	
 	//气泡中事故次数点击事件
 	$("body").on("click","a.accidentTotal",function(){
 		$scope.queryConditionData.plateNumber = $("label.pn").text();
 		$scope.queryConditionData.requestType = "accident";
 		taxiMapService.searchAccidentInfoNoPage($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.accidentInfoList =data.messageBody.accidentInfoList; 
				 if($scope.accidentInfoList.length > 0){
					 $("#illegal").attr("style","display:none");
					 $("#accident").attr("style","display:inline");
				 }
			 }
		 });
 	});
 	
 	//气泡中违法次数点击事件
 	$("body").on("click","a.illegalTotal",function(){
 		$scope.queryConditionData.plateNumber = $("label.pn").text();
 		$scope.queryConditionData.requestType = "illegal";
 		taxiMapService.searchIllegalInfoNoPage($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.illegalInfoList =data.messageBody.illegalInfoList; 
				 if($scope.illegalInfoList.length > 0){
					 $("#accident").attr("style","display:none");
					 $("#illegal").attr("style","display:inline");
				 }
			 }
		 });
 	});
 	
 	//气泡中当日卡口过车查询点击事件
 	$("body").on("click","#bayonetButton",function(){
 		$scope.queryConditionData.plateNumber = $(this).attr("hideValue");
 		$scope.queryConditionData.timePrevious = "1440";//24小时内
	    $scope.queryAllRecPlateInfo();
 	});
 	
 	//点击卡口信息显示位置和图片
	$scope.bayonetOnClick = function(data){
		$scope.bayonetInfo  = data;
		$("#bayonetAddressDiv").attr("style","display:inline");
	}
    
 	$("#closeAccident").click(function(){
    	$("#accident").attr("style","display:none");
    	$scope.accidentInfoList = {};
    });
 	
 	$("#closeIllegal").click(function(){
    	$("#illegal").attr("style","display:none");
    	$scope.illegalInfoList = {};
    });
 	
 	$("#closeBayonet").click(function(){
 		$("#bayonet").attr("style","display:none");
 		$scope.bayonetData = {};
 	});
 	
 	$("#closeBayonetAddressDiv").click(function(){
 		$("#bayonetAddressDiv").attr("style","display:none");
 	});
    
    //搜索车牌号码图标的点击事件
    $("#plateNumberSelect").click(function(){
    	$scope.queryConditionData.currentPage = 1;
        if(layerOfOnVehicle!=null & layerOfOnVehicle!=undefined){
        	layerOfOnVehicle.clear();
        }
        if(textGrapLayer != null & textGrapLayer != undefined) {
        	textGrapLayer.clear();
        }
    	hisRefresh = false;
    	if($scope.plateInfo.location == null){
    		$scope.plateInfo.location = "A";
    	}
    	$scope.queryConditionData.onLineState = "";
    	$scope.queryConditionData.plateType = "";
    	$scope.queryConditionData.competentAuthority = "";
    	$scope.queryConditionData.ascriptionCompany = "";
    	$scope.queryFunction();
    	
		$("#vehicleInfoDiv").attr("style","display:inline");
		
		//点击查询图标后把水滴标记去掉
		if(singleCar != null && singleCar != ''){
    		map.graphics.remove(singleCar);
    	}
		//重新定位地图中心坐标及缩放大小
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
		
		if(globalPlateNumber!=null && globalPlateNumber!=""){
		    //立即取消实时位置刷新
		   	$interval.cancel(realLocalRefresh);
		   	globalPlateNumber = "";
		   	loadLocalTimes = 0;
		}
    });
    
    //定时刷新车辆位置--5秒
    queryRefresh = $interval(function(){
    	 var rightCheck = [];
	   	 $("input[type=checkbox].rightCheckbox:checked").each(function(){
	   		 rightCheck.push(this.name);
	   	 });
	   	 if($.inArray("register", rightCheck)>=0){
	   		isRegisterArea = true;
	   	 }
	   	 /*if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)<0){
	   		onlineStateCheck = "1";
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)>=0){
	   		onlineStateCheck = "0";
	   	 }else if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)>=0){
	   		onlineStateCheck = "";
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)<0){
	   		onlineStateCheck = "-1";
	   	 }*/
	   	$scope.query("B");
		$scope.queryEarlyWarningInfoCounts();
    },30000);
    
    $scope.checkedbox = function(){
	    var hisOrRelParams;
		if($stateParams.params!="" && $stateParams.params!=undefined && null != $stateParams.params){
			hisOrRelParams=JSON.parse($stateParams.params); //历史/实时轨迹返回的参数
			if(hisOrRelParams.pageType=="all"){
				var typeCheckedNames = hisOrRelParams.typeCheckedName;
				var rightCheckedNames = hisOrRelParams.rightCheckedName;
				if(typeCheckedNames.length>0){
					$rootScope.checkedState = true;
					for(var i=0;i<typeCheckedNames.length;i++){
						$("[name="+typeCheckedNames[i]+"]:checkbox").prop("checked", true);
						$rootScope.checkedName = typeCheckedNames[i];
					}
					$("#rightDiv").attr("style","display:inline;width:10%;position: absolute;z-index:4;top:0px;right:0px;");
				}
				if(rightCheckedNames.length>0){
					if($.inArray("online", rightCheckedNames)>=0 || $.inArray("offline", rightCheckedNames)>=0){
						$scope.lineStateValue = true;
					}
					$("input[type=checkbox].rightCheckbox").each(function(){
						if($.inArray(this.name, rightCheckedNames)>=0){
							$("[name="+this.name+"]:checkbox").prop("checked", true);
							if(this.name!="register"){
								$scope.lineStateName = this.name;
							}
						}else{
							$("[name="+this.name+"]:checkbox").prop("checked", false);
						}
					});
					
					$scope.returnQuery();
				}
			    var pt = new esri.geometry.Point(hisOrRelParams.longitude,hisOrRelParams.latitude);
				map.centerAt(pt);
			}else{
				$scope.showall = false;
				$("#plateNumber").val(hisOrRelParams.plateNumber.replace("川A",""));
				$("#plateNumberSelect").click();
				var data = [];
				var e = "";
				data["plateNumber"] = hisOrRelParams.plateNumber;
				$scope.checkedVehicle(data,e);
			}
		}
    }
    
    //确保关闭页面或浏览器后销毁定时器
    $scope.$on('$destroy',function(){  
    	$interval.cancel(realLocalRefresh); 
    	$interval.cancel(queryRefresh);
        loadLocalTimes = 0;
        globalPlateNumber = null;
        $interval.cancel(warningRefresh);
        $rootScope.checkedName="";
        $rootScope.checkedState=false;
        dijit.popup.close(dialog);
        $("body").off("click");
        map.destroy();
    })
    
    $scope.convertVehicleType = function(type){
    	if(type!=undefined && type!=""){
    		return "B";
    	}else{
    		return "";
    	}
    }
    
    $scope.convertSexChinese = function(type){
    	if(type == 2){
    		return "女";
    	}else{
    		return "男";
    	}
    }
    
    $scope.convertVehicleTypeToA = function(type){
    	if(type!=undefined && type!=""){
    		return "B";
    	}else{
    		return "";
    	}
    }
    
    $scope.convertName = function(vehicleBaseInfo){
    	var strName = "";//驾驶员名字
		if(null != vehicleBaseInfo && undefined != vehicleBaseInfo){
			for(var i = 0;i < vehicleBaseInfo.taxiInfoList.length;i++){
				if("" != vehicleBaseInfo.taxiInfoList[i].strName && undefined != vehicleBaseInfo.taxiInfoList[i].strName){
					if(strName == ""){
						strName = vehicleBaseInfo.taxiInfoList[i].strName;
					}else{
						strName = strName + "," + vehicleBaseInfo.taxiInfoList[i].strName;
					}
				}    						
			}
		}
		return strName;
    }
    
    $scope.convertSex = function(vehicleBaseInfo){
    	var strSex = "";//驾驶员性别
    	if(null != vehicleBaseInfo && undefined != vehicleBaseInfo){
    		for(var i = 0;i < vehicleBaseInfo.taxiInfoList.length;i++){
    			if("" != vehicleBaseInfo.taxiInfoList[i].strSex && undefined != vehicleBaseInfo.taxiInfoList[i].strSex){
    				if(strSex == ""){
    					strSex = $scope.convertSexChinese(vehicleBaseInfo.taxiInfoList[i].strSex);
    				}else{
    					strSex = strSex + "," + $scope.convertSexChinese(vehicleBaseInfo.taxiInfoList[i].strSex);
    				}
    			}    						
    		}
    	}
    	return strSex;
    }
    
  //入城证转换
	 $scope.convertIntoCityCard = function(intoCityCard){
		 var realIntoCityCard;
		 switch(intoCityCard)
		 {
		 case 'A':
			 realIntoCityCard = "A";
			 break;
		 case 'M':
			 realIntoCityCard = "A1";
			 break;
		 case 'N':
			 realIntoCityCard = "A2";
			 break;
		 case 'E':
			 realIntoCityCard = "A3";
			 break;
		 case 'B':
			 realIntoCityCard = "B";
			 break;
		 case 'P':
			 realIntoCityCard = "B1";
			 break;
		 case 'Q':
			 realIntoCityCard = "B2";
			 break;
		 case 'C':
			 realIntoCityCard = "C";
			 break;
		 case 'R':
			 realIntoCityCard = "C1";
			 break;
		 case 'S':
			 realIntoCityCard = "C2";
			 break;
		 case 'T':
			 realIntoCityCard = "C3";
			 break;
		 case 'U':
			 realIntoCityCard = "D";
			 break;
		 case 'D':
			 realIntoCityCard = "D1";
			 break;
		 case 'F':
			 realIntoCityCard = "D2";
			 break;
		 case 'V':
			 realIntoCityCard = "E";
			 break;
		 case 'G':
			 realIntoCityCard = "F";
			 break;
		 case 'H':
			 realIntoCityCard = "G1";
			 break;
		 case 'I':
			 realIntoCityCard = "G2";
			 break;
		 case 'J':
			 realIntoCityCard = "G3";
			 break;
		 case 'K':
			 realIntoCityCard = "G4";
			 break;
		 case 'L':
			 realIntoCityCard = "H";
			 break;
		 case 'W1':
			 realIntoCityCard = "交通车";
			 break;
		 case 'Z':
			 realIntoCityCard = "快递";
			 break;
		 case 'X':
			 realIntoCityCard = "三绿";
			 break;
		 case 'W':
			 realIntoCityCard = "校车";
			 break;
		 case 'Y':
			 realIntoCityCard = "园林";
			 break;
		 case 'X1':
			 realIntoCityCard = "早餐";
			 break;
		 default:
			 realIntoCityCard = "H";
		 break;
		 }
		 return realIntoCityCard;
	 }
	 
	 $scope.initZoomAndCenter = function(){
		 switch ($rootScope.depName) {
		case "01":
			showCenterPoint = [104.010229,30.623509];
			showZoom = 14;
//			showZoom = 5;
			break;
		case "02":
			showCenterPoint = [104.052628,30.728445];
			showZoom = 5;
			break;
		case "03":
			showCenterPoint = [104.117757,30.603133];
			showZoom = 5;
			break;
		case "04":
			showCenterPoint = [104.981480,30.679894];
			showZoom = 5;
			break;
		case "05":
			showCenterPoint = [104.144179,30.695388];
			showZoom = 5;
			break;
		case "06":
			showCenterPoint = [104.017999,30.635954];
			showZoom = 5;
			break;
		default:
			showCenterPoint = [104.0657754083, 30.6583098090];
			showZoom = 14;
//			showZoom = 4;
			break;
		}
	 }
    
	//初始化查询条件
	$scope.initZoomAndCenter();
    $scope.showMap();
    $scope.query("B");
    $scope.checkedbox();
    $scope.oneVehicleReressh();
} ]);

//预警类型格式化
app.filter('reverse', function() { //可以注入依赖
    return function(text) {
    	switch(text)
    	{
	    	case '1':
	    		return "时间区域预警";
	    		break;
	    	case '3':
	    		return "超速预警";
	    		break;
	    	case '4':
	    		return "疲劳驾驶预警";
	    		break;
    	}
    }
});

//状态格式转化
app.filter('chineseState', function() { 
    return function(text) {
		switch(text)
		{
			case "0":
				return "离线";
				break;
			case "1":
				return "在线";
				break;
			default : 
				return "离线";
			break;
		}
    }
});

//车牌类别转化
app.filter('chineseType', function() { 
	return function(text) {
		switch(text)
		{
		case '01':
			return "大车";
			break;
		case '02':
			return "小车";
			break;
		default : 
			return "";
		}
	}
});
	



 
  

