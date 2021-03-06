app.controller('trailCtrl', ['$scope','$filter','$timeout','$state',
		'mapService','$rootScope','SweetAlert','$interval',function($scope, $filter, $timeout, $state, mapService, $rootScope,SweetAlert, $interval) {
	
	var map;	//地图
	var gra;
	var pN;		//选中车辆的车牌号码
	$scope.plateNumberLocations = ["B","C","D"];//车牌地址数组
	var hisRefresh = false;//车辆历史轨迹是否定时刷新，默认为false
	var gpsIsClicked = false;//GPS轨迹按钮是否被点击，默认为false
	var bayonetIsClicked = false;//卡口轨迹按钮是否被点击，默认为false
	var hourIsClicked = false;//1小时内按钮是否被点击，默认为false
	var dayIsClicked = false;//24小时内按钮是否被点击，默认为false
	var customizeIsClicked = false;//自定义时间按钮是否被点击，默认为false
	var haveShowLine = false; //标记是否打开了行驶轨迹
	$scope.plateInfo={};
	var timeRefresh; //实时刷新车辆历史轨迹
	$scope.queryConditionData = {};
	$scope.hisLocations = [];	//存储某段时间内某辆车的历史轨迹信息数组
	var showLineLength = 2; //定义每次加载的历史轨迹长度
	//	var realLocalRefresh; //实时刷新单个车辆位置定时器
	
	
	//初始化车牌前缀
	 $(document).ready(function(){
	    	for(var i = 0;i<$scope.plateNumberLocations.length;i++){
	    		$("#plateNumberLocations").append("<option value='"+$scope.plateNumberLocations[i]+"'>"+$scope.plateNumberLocations[i]+"</option>");
	    	}
	    })
	    
	  //点击卡口信息显示位置和图片
		$scope.bayonetOnClick = function(data){
			$scope.bayonetInfo  = data;
			$("#bayonetAddressDiv").attr("style","display:inline");
		}
	    
	 //搜索车牌号码图标的点击事件
    /*$("#plateNumberSelect").click(function(){
    	hisRefresh = false;
    	if($scope.plateInfo.location == null){
    		$scope.plateInfo.location = "A";
    	}
    	$scope.queryConditionData.onLineState = "";
    	$scope.queryConditionData.plateType = "";
    	$scope.queryConditionData.competentAuthority = "";
    	$scope.queryConditionData.ascriptionCompany = "";
    	$scope.queryVehicleByPlateNumber();
		$scope.clearHisLine();
    });*/
	 
	//清除行驶轨迹还原地图
	  $scope.clearHisLine = function(){
	    	if(haveShowLine){
				var graphicses = map.graphics.graphics;
				for(var i=0;i<graphicses.length;i++){
					if(graphicses[i].geometry.type=="polyline"){
						map.graphics.remove(graphicses[i]);
					}
				}
				clearTimeout(timeRefresh);
				haveShowLine = false;
				$("#startTime").val("");
				$("#endTime").val("");
				$scope.queryConditionData.startTime = null;
		        $scope.queryConditionData.endTime = null;
			}
	    }
	 
	//点击选择时间段
	$scope.timePreviousClick = function($event){
		var obj = $event.target;
		if($(obj).attr("id")!="customize"){
			$scope.queryConditionData.timePrevious = $(obj).find('.hiddenSpan').text();
	        $scope.queryConditionData.startTime = null;
	        $scope.queryConditionData.endTime = null;
//	        $scope.queryServiceLocation();//调用查询
	        }else{
	        	$scope.queryConditionData.timePrevious = null;
	        }
		
		}
	
	//加载时间控件
	$timeout(function(){
		$(".form_datetime").datetimepicker({
			lang:'ch',
			timepicker:true,
			formatDate:'Y-m-d H:i'
		});
	},500);
	
	//按钮被点击和没有被点击所执行的方法
    $scope.isClicked = function(isClicked,id,bac){
    	if(!isClicked){
        	$scope.changeColor(id,bac);
        	$("#startTime").attr("disabled",true);
    		$("#endTime").attr("disabled",true);
    		$("#hisButton").attr("disabled",true);
    		$("#hisButton").css("background","#cccccc");
    		$("#customize").css("background","#f2f2f2");
        }else{
        	$scope.restoreColor(id,bac);
        	if(isClicked == customizeIsClicked){
        		$("#startTime").attr("disabled",false);
        		$("#endTime").attr("disabled",false);
        		$("#hisButton").attr("disabled",false);
        		$("#hisButton").css("background","#0099ff");
        		$("#customize").css("background","#cccccc");
        	}
        }
    };
    
    //鼠标经过事件
    $scope.buttonClicked = function(){
    	$scope.isClicked(gpsIsClicked,'gps','#ffffff');
    	$scope.isClicked(bayonetIsClicked,'bayonet','#ffffff');
    	$scope.isClicked(hourIsClicked,'hour','#f2f2f2');
    	$scope.isClicked(dayIsClicked,'day','#f2f2f2');
    	$scope.isClicked(customizeIsClicked,'customize','#f2f2f2');
    };
    
    //鼠标经过按钮时背景颜色和字体颜色的改变
    $scope.changeColor = function(id,bac){
    	document.getElementById(id).onmouseover = function(){this.style.background = '#aac1cb';this.style.color = bac;}
    	document.getElementById(id).onmouseout = function(){this.style.background = bac;this.style.color = '#979797';}
    };
    //当按钮已经被点击，鼠标经过按钮时背景颜色和字体颜色的不发生改变
    $scope.restoreColor = function(id,bac){
    	document.getElementById(id).onmouseover = function(){this.style.background = bac;this.style.color = '#979797';}
    };
    
    //一小时内的点击事件
	$("#hour").click(function(){
//		$scope.clearHisLine();
//		map.setZoom(14);
		hisRefresh = false;
		hourIsClicked = true;
		dayIsClicked = false;
		customizeIsClicked = false;
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
		$scope.buttonClicked();
		//默认查询gps
		if(bayonetIsClicked == true && gpsIsClicked == false){
//			map.graphics.clear();//清除地图上现有的点
//	    	map.removeLayer(graphicsLayer);//清除地图上的线
			$scope.queryAllRecPlateInfo();
		}else if(gpsIsClicked == true && bayonetIsClicked == false){
			$scope.queryServiceLocation();
//			$scope.queryHistTra();
		}
		
	});
	//24小时内的点击事件
	$("#day").click(function(){
//		$scope.clearHisLine();
//		map.setZoom(14);
		hisRefresh = false;
		dayIsClicked = true;
		hourIsClicked = false;
		customizeIsClicked = false;
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
		$scope.buttonClicked();
		//默认查询gps
		if(bayonetIsClicked == true && gpsIsClicked == false){
//			map.graphics.clear();//清除地图上现有的点
//	    	map.removeLayer(graphicsLayer);//清除地图上的线
			$scope.queryAllRecPlateInfo();
		}else if(gpsIsClicked == true && bayonetIsClicked == false){
			$scope.queryServiceLocation();
//			$scope.queryHistTra();
		}
	});
	//选择时间确定按钮的点击事件
	$("#hisButton").click(function(){
//		$scope.clearHisLine();
//		map.setZoom(14);
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
		//默认查询gps
		if(bayonetIsClicked == true && gpsIsClicked == false){
//			map.graphics.clear();//清除地图上现有的点
//	    	map.removeLayer(graphicsLayer);//清除地图上的线
			$scope.queryAllRecPlateInfo();
		}else if(gpsIsClicked == true && bayonetIsClicked == false){
			$scope.queryServiceLocation();
//			$scope.queryHistTra();
		}
	});
	
	//开始时间的点击事件
	$("#startTime").click(function(){
		hisRefresh = false;
		$scope.queryConditionData.timePrevious = null;
	});
	//结束时间的点击事件
	$("#endTime").click(function(){
		hisRefresh = false;
		$scope.queryConditionData.timePrevious = null;
	});
	
	//点击查询车辆历史轨迹
    $scope.queryHistTra = function(){
    	if(!hisRefresh){
    		hisRefresh = true;
//    		$interval.cancel(realLocalRefresh);
    		loadLocalTimes = 0;
        	timeRefresh = setTimeout(function(){showLine(map);}, 1000, 1);
    	}
//    	setTimeout(function(){showLine(map)}, refreshMap);
//    	timeRefresh = setTimeout(function(){showLine(map)}, 5000);
//    	timeRefresh = setTimeout(function(){showLine(map);}, 1000, 1);
    }
//    $("#hisButton").click(function()); 
    
  //GPS轨迹按钮的点击事件
    $("#gps").click(function(){
    	gpsIsClicked = true;
    	bayonetIsClicked = false;
    	$("#bayonetDiv").attr("style","display:none");
    	$scope.buttonClicked();
    });
    //卡口轨迹按钮的点击事件
    $("#bayonet").click(function(){
    	$scope.clearHisLine();
    	bayonetIsClicked = true;
    	gpsIsClicked = false;
    	$("#bayonetDiv").attr("style","display:inline");
    	$scope.buttonClicked();
    });
    
  //自定义按钮的点击事件
    $("#customize").click(function(){
		hisRefresh = false;
		customizeIsClicked = true;
		hourIsClicked = false;
		dayIsClicked = false;
		$scope.buttonClicked();
	});
    
  //取消卡口图片的点击事件
    $("#imgCancleBayonet").click(function(){
    	$("#bayonetAddressDiv").attr("style","display:none");
    });
    
    //加点
    /*function showLocation(x, y, pic,type,plateNumber,ascriptionCompany,speed) {  
    	//创建图片样式符合
    	var pt = new esri.geometry.Point(x,y);//创建一个点对象
    	var attr = {"vehicleType":type,"plateNumber":plateNumber,"ascriptionCompany":ascriptionCompany,"speed":speed};
    	var infoTemplate = new esri.InfoTemplate("车牌号码：${plateNumber}","车辆类型：${vehicleType}," +
    			"所属企业：${ascriptionCompany}," +
    			"速度：${speed}km/h");
    	gra = new esri.Graphic(pt,pic,attr,infoTemplate);//设置样式
    	//把图层实例放入数组中以便后面有针对性的移除
    	if(graps.length<=len){
    		graps.push(gra);
    	}
    	map.graphics.add(gra);//添加到图层中    
    };*/
    
 	//历史轨迹
 	function showLine(map){
 		 haveShowLine = true; //标记行驶轨迹已打开
 		 var hisLocations = $scope.hisLocations;	//包含车辆经纬度的字符串
         var paths = [];
         if(hisLocations.length > 0){
         	for(var i = 0;i<showLineLength;i++){
//         		console.log(hisLocations[i]);
	           	var local = hisLocations[i].split("-");
	           	var his = [];
	           	his[0] = local[1]*1;
	           	his[1] = local[0]*1;
	           	paths.push(his);
       		}
         	showLineLength = showLineLength+2;
         	if(showLineLength>hisLocations.length-2 & showLineLength<hisLocations.length){
         		showLineLength = hisLocations.length;
         	}
         }
		  	//在地图上连线
		    polylineJson={"paths": [paths],"spatialReference":{"wkid":4326}}; 
		    var graphicsLayer = new esri.layers.GraphicsLayer();//添加线的图层，方便清除上一个图层所画的线
	    	map.graphics.clear();//清除地图上现有的点
	    	map.removeLayer(graphicsLayer);//清除地图上的线
		    var polyline=new esri.geometry.Polyline(polylineJson);
		    var sys=new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new esri.Color([0,0,255]),3);
		    var graphic2=new esri.Graphic(polyline,sys);
		   	map.graphics.add(graphic2); 
		   	if(hisLocations.length > 0 ){
		   		//前面+n，这里就要-(n-1)
		   		var local = hisLocations[showLineLength-3].split("-");
		   		console.log($scope.queryConditionData.vehicleType);
		   		if(local[2] == "新能源"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/new-energy-vehicle.png",21,21);
		   		}else if(local[2] == "危化品"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/dangerous-goods-vehicle.png",21,21);
		   		}else if(local[2] == "冷链"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/cold-chain-vehicle.png",21,21);
		   		}else if(local[2] == "普通"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/ordinary-vehicle.png",21,21);
		   		}
		   		showLocation(local[1]*1,local[0]*1,local[2]*1,local[3]*1,pic);
		   		
		   		var centerPoint = new esri.geometry.Point(local[1]*1,local[0]*1);
//		   		map.centerAndZoom(centerPoint,14);
		   		map.centerAt(centerPoint);
		   	}
		   	
		   	//在地图上添加点
		   	function showLocation(x, y, type, plateNumber, pic) {  
		   		var pt = new esri.geometry.Point(x,y);//创建一个点对象
		   		var attr = {"vehicleType":type,"plateNumber":plateNumber};
		   		var infoTemplate = new esri.InfoTemplate("车牌号码：${plateNumber}","车辆类型：${vehicleType}");
		   		var gp = new esri.Graphic(pt,pic,attr);//设置样式
		   		map.graphics.add(gp);//添加到图层中        
		   	};
		   	if(hisRefresh){
		   		//js控制ID为hisButton的按钮的点击
		   		$("#hisButton").trigger("click"); 

		   		if(showLineLength<=hisLocations.length){
		   			showLineRefresh = $interval(function(){
		   				showLine(map);
		   			},1000,1);
		   		}else{
		   			showLineLength = 2;
		   		}
		   	}
		   	
 	};
 	
 	//根据车牌号码查询车辆卡口信息
	 $scope.queryAllRecPlateInfo = function(){
		 $scope.queryConditionData.plateNumber = "川" + $scope.plateInfo.location + $("#plateNumber").val();
		 mapService.queryAllRecPlateInfo($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.bayonetData = data.messageBody.recPlateInfoList;
				 console.log( $scope.bayonetData);
			 }
		 }, function (err) {
		 })
	 }
	
	//查询某段时间内某辆车的历史轨迹信息
	$scope.queryServiceLocation = function() {
		if($scope.plateInfo.location == null){
    		$scope.plateInfo.location = "A";
    	}
		$scope.queryConditionData.plateNumber = "川" + $scope.plateInfo.location + $("#plateNumber").val();
		console.log($scope.queryConditionData.plateNumber);
		$scope.queryConditionData.startTime = $("#startTime").val();
        $scope.queryConditionData.endTime = $("#endTime").val();
        $scope.hisLocations = [];
	    mapService.queryLocations($scope.queryConditionData,function (data) {
	    //清空存储某段时间内某辆车的历史轨迹信息数组
	    if (data.state == 200) {
	    	$scope.movePaths = eval(data.messageBody.movePaths);
	    	console.log($scope.movePaths);
	        var result = $scope.movePaths;
	        for(var i=0;i<result.length;i++){
	        	var location = "";
//	        	console.log(result[0].vehicleType);
	            location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType+"-"+result[i].plateNumber;
	            $scope.hisLocations.push(location);
	            }
	        $scope.queryHistTra();
	        }
	    }, function (err) {
	    })
	    }
	
	/**********************************地图图层显示start**********************************/
    $scope.showMap = function(){
    	require([  
            "esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "esri/geometry/Extent", "esri/geometry/Point", "esri/geometry/Polyline", "esri/SpatialReference",  
            "esri/symbols/SimpleMarkerSymbol","esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/layers/GraphicsLayer", "esri/graphic"  
        ], function(Map, ArcGISTiledMapServiceLayer, Extent, Point, Polyline, SpatialReference, SimpleMarkerSymbol,PictureMarkerSymbol, SimpleLineSymbol, GraphicsLayer, Graphic) {  
//    		var BASE_SERVER = 'http://20.0.56.14:8399/arcgis/rest/services/201406chengdu/cd_base_0716/MapServer'
   		var BASE_SERVER = 'http://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer';
            map = new Map("trail", {  
                center: [104.0657754083, 30.6583098090],  
                zoom: 10,
                logo:false,
                nav:false,
                slider:false
            }); 
    		var layer = new ArcGISTiledMapServiceLayer(BASE_SERVER);
            
            map.addLayer(layer);
        });   
    }
    /**********************************地图图层显示end**********************************/
		
    //显示地图
    $scope.showMap();
//    $scope.queryServiceLocation();
} ]);


	



 
  

