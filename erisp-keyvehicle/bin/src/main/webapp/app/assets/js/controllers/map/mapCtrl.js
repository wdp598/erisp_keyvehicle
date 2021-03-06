app.controller('demoMapCtrl', [
		'$scope',
		'$filter',
		'$timeout',
		'$state',
		'mapService',
		'$rootScope',
		'SweetAlert',
		'$interval',
		function($scope, $filter, $timeout, $state, mapService, $rootScope,SweetAlert, $interval) {
			
	$scope.queryConditionData = {};
	$scope.locations = [];		//存储所有车辆信息数据
	$scope.hisLocations = [];	//存储某段时间内某辆车的历史轨迹信息数组
	$scope.realLocations = [];	//存储某一车辆历史轨迹信息数组
	$scope.queryConditionData.vehicleType = "";
	$scope.vehicleModel = {};	
	$scope.plateNumberLocations = ["B","C","D"];//车牌地址数组
//	$scope.vehicleTypes = ["物流车","123"];//车辆总类型数组
//	$scope.logisticsCars = ["新能源","冷链","危化品","普通"];//物流车车辆类型数组
//	$scope.testCars = ["1","2","3","4"];//测试车辆类型数组
	$scope.plateInfo = {};	//车牌信息集合
	$scope.disposalMethods = "处置下发";
    $scope.hyDepartment = "物流云平台";
    $scope.disposalProcess = {};
	var graps = []; //存储图标图层实例
	var len;//graps的长度
	
	var map;	//地图
	var layerOfNew; //新能源图层
	var layerOfDangerous; //危化品图层
	var layerOfCold; //冷链车图层
	var layerOfOrdinary; //普通车图层
	var layerOfOnVehicle; //定位某两车的图层
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
	var driveInfoRefresh; //行驶信息刷新
	var totalCountsRefresh; //车辆总数统计刷新
	var globalPlateNumber; //记录选中辆车的车牌号
    var showLineLength = 2; //定义每次加载的历史轨迹长度
    var loadLocalTimes = 0; //加载某辆车实时位置的次数
	
	$scope.currentPage = 1;//初始化当前页
    $scope.pageSize = 10;//初始化每页大小
    $scope.queryConditionData = {
            'currentPage':  1,
            'pageSize': $scope.pageSize
    }
    
  //监听复选框选中状态
    $scope.$watch('checkedName + checkedState',function(){
//    	alert($rootScope.checkedName+"////"+$rootScope.checkedState);
//    	console.log("name:"+$rootScope.checkedName+"--state:"+$rootScope.checkedState);
    	if($rootScope.checkedState){
    		if(layerOfOnVehicle!=null & layerOfOnVehicle!=undefined){
            	map.removeLayer(layerOfOnVehicle);
            }
//    		console.log("name:"+$rootScope.checkedName);
    		switch ($rootScope.checkedName) {
			case "新能源":
				$scope.queryConditionData.newChecked = "新能源";
				layerOfNew.setVisibility(true);
				$scope.queryConditionData.vehicleType = "新能源";
//				filterVechleByTypes("新能源");
				break;
			case "冷链":
				$scope.queryConditionData.dangerousChecked = "冷链车";
				layerOfCold.setVisibility(true);
				$scope.queryConditionData.vehicleType = "冷链车";
//				filterVechleByTypes("冷链车");
				break;
			case "危化品":
				$scope.queryConditionData.coldChecked = "危化品";
				layerOfDangerous.setVisibility(true);
				$scope.queryConditionData.vehicleType = "危化品";
//				filterVechleByTypes("危化品");
				break;
			case "普通":
				$scope.queryConditionData.ordinaryChecked = "普通车";
				layerOfOrdinary.setVisibility(true);
				$scope.queryConditionData.vehicleType = "普通车";
//				filterVechleByTypes("普通车");
				break;
			default:
				break;
			}
    		$("#rightDiv").attr("style","display:inline");
    	}else{
    		switch ($rootScope.checkedName) {
			case "新能源":
				$scope.queryConditionData.newChecked = null;
				layerOfNew.setVisibility(false);
//				filterVechleByTypes("新能源");
				break;
			case "冷链":
				$scope.queryConditionData.dangerousChecked = null;
				layerOfCold.setVisibility(false);
//				filterVechleByTypes("冷链车");
				break;
			case "危化品":
				$scope.queryConditionData.coldChecked = null;
				layerOfDangerous.setVisibility(false);
//				filterVechleByTypes("危化品");
				break;
			case "普通":
				$scope.queryConditionData.ordinaryChecked = null;
				layerOfOrdinary.setVisibility(false);
//				filterVechleByTypes("普通车");
				break;
			default:
				break;
			}
    	}
    	$scope.queryEarlyWarningInfoCounts();
    });
    
  //翻页
    $scope.pageChanged = function () {
	   	//当前页
	   	$scope.queryConditionData['currentPage'] = $scope.currentPage;
	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
	   	$scope.queryFunction();
//	   	$scope.queryWarningDisposalViewList();
    };
    
    $(document).ready(function(){
    	for(var i = 0;i<$scope.plateNumberLocations.length;i++){
    		$("#plateNumberLocations").append("<option value='"+$scope.plateNumberLocations[i]+"'>"+$scope.plateNumberLocations[i]+"</option>");
    	}
    	/*for(var i = 0;i<$scope.vehicleTypes.length;i++){
    		$("#vehicleTypes").append("<option value='"+$scope.vehicleTypes[i]+"'>"+$scope.vehicleTypes[i]+"</option>");
    	}*/
    })
	
//	var $j = jQuery.noConflict();//定义新的名称来代替$符号
//	$(document).ready(function(){
//    	var x=document.getElementById("disposalDiv");
//	    if(x){
//	    	x.style.height = $("#disposalDiv").height() - 60 +"px";//设置地图初始化高度
////	    	x.attr("style","display:none");
//	    }
//    })
    
	//根据车牌号搜索历史轨迹
	$scope.queryVehicleHisTrajectoryInfoByPlateNumber = function(){
		mapService.queryVehicleHisTrajectoryInfoByPlateNumber(pN,function (data) {
		$scope.realLocations = [];
		if (data.state == 200) {
			$scope.vehicleHisTrajectoryInfo = data.messageBody.vehicleHisTrajectoryInfoList;
			var result = $scope.vehicleHisTrajectoryInfo;
			for(var i=0;i<result.length;i++){
				var location = "";
				location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType;
				$scope.realLocations.push(location);
				}
			}
		}, function (err) {
		})
		}
    
     //根据车牌号搜索车辆信息
	 $scope.queryVehicleByPlateNumber = function(){
		 $scope.queryConditionData.plateNumber = "川" + $scope.plateInfo.location + $("#plateNumber").val();
		 $scope.queryConditionData.pageSize = 10;
		 mapService.queryByPlateNumber($scope.queryConditionData,function (data) {
//			 console.log($scope.queryConditionData.plateNumber);
	            if (data.state == 200) {
	            	$scope.vehicleInfo = data.messageBody.vehicleInfoList;
	            	$scope.totalItems = data.messageBody.page.count;
	            	$scope.currentPage = data.messageBody.page.page;
	            	$scope.pages = data.messageBody.page.pages;
//	            	console.log($scope.vehicleInfo);
	            }
	        }, function (err) {
	        })
	    }
	 //根据车牌号搜索一辆车辆信息(保留)
//	 $scope.queryOneVehicleByPlateNumber = function(){
//		 mapService.queryOneVehicleByPlateNumber(pN,function (data) {
//			 if (data.state == 200) {
//				 $scope.oneVehicleInfo = [];
//				 $scope.oneVehicleInfo = data.messageBody.vehicleInfoList;
//				 $scope.oneInfo = $scope.oneVehicleInfo[0];
//			 }
//		 }, function (err) {
//		 })
//	 }
	 
	//根据车辆类型过滤车辆信息并显示
	 $scope.queryVehicleInfoByVehicleType = function(vehicleType){
		 mapService.queryVehicleInfoByVehicleType(vehicleType,function (data) {
	            if (data.state == 200) {
	            	$scope.vehicleInfo = data.messageBody.vehicleInfoViewList;
	            }
	        }, function (err) {
	        })
	    }
	 
	 //根据车牌号码查询车辆卡口信息
	 $scope.queryAllRecPlateInfo = function(){
		 mapService.queryAllRecPlateInfo($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.bayonetData = data.messageBody.recPlateInfoList;
//				 console.log( $scope.bayonetData);
			 }
		 }, function (err) {
		 })
	 }
	 
	 //根据用户类型和部门名称获取预警处置信息
	 $scope.queryWarningDisposalViewList = function(){
		 $scope.queryConditionData.plateNumber = pN;
		 $scope.queryConditionData.userType = "1";
		 $scope.queryConditionData.department = "1";
		 $scope.queryConditionData.pageSize = 20;
		 //$scope.queryConditionData.vehicleType= "新能源";
		 mapService.queryWarningDisposalViewList($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
//				 console.log(data.messageBody.warningDisposalViewList);
				 $scope.warningDisposalViewList = data.messageBody.warningDisposalViewList;
//				 console.log($scope.warningDisposalViewList);
			 }
		 }, function (err) {
		 })
	 }
	 
	 /*//根据车辆类型搜索车辆信息
	 $scope.query = function(){
		 mapService.queryVehicleInfoByVehicleType($scope.vehicleModel.vehicleType,function (data) {
			 if (data.state == 200) {
					$scope.vehicleInfoView = data.messageBody.vehicleInfoViewList;
					$scope.locations = [];//清空集合
					var result = $scope.vehicleInfoView;
//					console.log("2");
//					console.log($scope.vehicleModel.vehicleType);
//					console.log(data.messageBody.vehicleInfoViewList);
					for(var i=0;i<result.length;i++){
						var location = "";
						location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType+"-"+result[i].plateNumber;
						$scope.locations.push(location);
						}
					$scope.showMap();
			}
		 }, function (err) {
		 })
		 
		 mapService.queryEarlyWarningInfoCounts($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.earlyWarningInfoCounts =data.messageBody.earlyWarningInfo; 
			 }
		 })
	 }*/
	 
	 //最新全部车辆位置信息--已废弃
	 /*$scope.newQuery = function(){
		 mapService.queryVehicleRealTimeInfo($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
					$scope.vehicleRealTimeInfo = data.messageBody.vehicleRealTimeInfo;
					var result = $scope.vehicleRealTimeInfo;
					for(var i=0;i<result.length;i++){
						var b = false;
						var newPoint;
						var grap;
						for(var j=0;j<graps.length;j++){
			        		if(graps[j].attributes.plateNumber==result[i].plateNumber){
			        			b = true;
			        			newPoint = graps[j].geometry;
			        			grap = graps[j];
			        			break;
			        		}
						}
						if(b){
							map.graphics.remove(grap);
							newPoint.setLatitude(result[i].latitude);
							newPoint.setLongitude(result[i].longitude);
		        			grap.setGeometry(newPoint);
		        			map.graphics.add(grap);
		        			map.graphics.redraw();
						}
					}
					var newGraps = [];
					if(result.length!=graps.length){
						for(var i=0;i<result.length;i++){
							var bo = true;
							for(var j=0;j<graps.length;j++){
				        		if(graps[j].attributes.plateNumber==result[i].plateNumber){
				        			bo = false;
				        			break;
				        		}
							}
							if(bo){
								newGraps.push(result[i]);
							}
						}
						for(var n=0;n<newGraps.length;n++){
							if(newGraps[n].vehicleType == "新能源"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/new-energy-vehicle.png",21,21);
			             	}else if(newGraps[n].vehicleType == "危化品"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/dangerous-goods-vehicle.png",21,21);
			             	}else if(newGraps[n].vehicleType == "冷链"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/cold-chain-vehicle.png",21,21);
			             	}else if(newGraps[n].vehicleType == "普通"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/ordinary-vehicle.png",21,21);
			             	}
		        			var pt = new esri.geometry.Point(newGraps[n].latitude,newGraps[n].longitude);//创建一个点对象
		        			var attr = {"vehicleType":newGraps[n].vehicleType,"plateNumber":newGraps[n].plateNumber,"ascriptionCompany":newGraps[n].ascriptionCompany};
		        			var infoTemplate = new esri.InfoTemplate("车牌号码：${plateNumber}","车辆类型：${vehicleType},所属企业：${ascriptionCompany}");
		                	var gp = new esri.Graphic(pt,pic,attr,infoTemplate);//设置样式
		                	graps.push(gp);
		                	map.graphics.add(gp);//添加到图层中 
		                	map.graphics.redraw();
						}
						//车辆图标添加点击事件(保留)
//	                    map.graphics.on("click",function(e){
//	                    	console.log(e);
//	                    	pN = e.graphic.attributes.plateNumber;
//	                    	$scope.oneInfo = e.graphic.attributes;
//	                    	$scope.showOneVehicleInfo();
//    	                    console.log(pN);
////    	                    map.infoWindow.show(e.mapPoint);
//	                    	e.stopPropagation();
//	                    	});
					}
					
					//console.log(result);
					//console.log(graps);
					//console.log(newGraps);
					//console.log("图层实际车辆数量===="+map.graphics.graphics.length);
					//console.log("图层备份车辆数量===="+graps.length);
					//console.log("数据库车辆数量==="+result.length);
			}
		 }, function (err) {
		 })
	 }*/
	 
	//根据车辆类型分类显示--暂时保留
	 /*$scope.filterpoint = function(selectOption){
		 mapService.queryVehicleInfoByVehicleType($scope.vehicleModel.vehicleType,function (data) {
			 if (data.state == 200) {
					$scope.vehicleInfoView = data.messageBody.vehicleInfoViewList;
					$scope.locations = [];//清空集合
					var result = $scope.vehicleInfoView;
					for(var i=0;i<result.length;i++){
						var location = "";
						if(result[i].vehicleType==selectOption){
							location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType;
							$scope.locations.push(location);
						}
					}
			 	}
				$scope.showMap();
		 }, function (err) {
		 })
	 }*/
	 
	//重置
	$scope.reset = function(){
		$("#plateNumber").empty();
		$scope.queryConditionData = {};
		};

	//查询车辆的实时信息
		$scope.queryVehicleRealTimeInfo = function () {
			mapService.queryVehicleRealTimeInfo($scope.queryConditionData,function (data) {
				if (data.state == 200) {
					$scope.vehicleRealTimeInfo = data.messageBody.vehicleRealTimeInfo;
					var result = $scope.vehicleRealTimeInfo;
					for(var i=0;i<result.length;i++){
						var location = "";
						location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType;
						$scope.locations.push(location);
						}
					$scope.showMap();
					}
				}, function (err) {
				})};

	//查询某段时间内某辆车的历史轨迹信息
	$scope.queryServiceLocation = function() {
		$scope.queryConditionData.startTime = $("#startTime").val();
        $scope.queryConditionData.endTime = $("#endTime").val();
        $scope.queryConditionData.plateNumber = pN;
        $scope.hisLocations = [];
	    mapService.queryLocations($scope.queryConditionData,function (data) {
	    //清空存储某段时间内某辆车的历史轨迹信息数组
	    if (data.state == 200) {
	    	$scope.movePaths = eval(data.messageBody.movePaths);
	        var result = $scope.movePaths;
	        for(var i=0;i<result.length;i++){
	        	var location = "";
//	        	console.log(result[0].vehicleType);
	            location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType+"-"+result[i].plateNumber;
	            $scope.hisLocations.push(location);
	            }
	        }
	    }, function (err) {
	    })
//	    console.log($scope.hisLocations);
	    }
	
	//查询所有车辆信息
    $scope.queryFunction = function () {
    	$scope.queryConditionData.pageSize = 10;
    	mapService.queryVehicleInfo($scope.queryConditionData,function (data) {
    	    if (data.state == 200) {
            	$scope.vehicleInfo = data.messageBody.vehicleInfo;
            	$scope.totalItems = data.messageBody.page.count;
            	$scope.currentPage = data.messageBody.page.page;
            	$scope.pages = data.messageBody.page.pages;
            }
        }, function (err) {
        })
    };
	
	$scope.timePreviousClick = function($event){
		var obj = $event.target;
		if($(obj).attr("id")!="diyTimePrevious"){
			$scope.queryConditionData.timePrevious = $(obj).find('.hiddenSpan').text();
	        $scope.queryConditionData.startTime = null;
	        $scope.queryConditionData.endTime = null;
	        }else{
	        	$scope.queryConditionData.timePrevious = null;
	        }
		}
	
	//点击车辆信息显示其基本信息和轨迹选择方框
	$scope.checkedVehicle = function(data,e){
		$scope.clearHisLine();
		hisRefresh = false;
		pN = data.plateNumber;
		globalPlateNumber = pN;
		$scope.oneInfo = data;
		$scope.showOneVehicleInfo(data);
		//选中行加色
		$(e.currentTarget).addClass("vehicleInfoTr").siblings().removeClass("vehicleInfoTr");
	}
	
	/*//点击卡口信息显示位置和图片
	$scope.bayonetOnClick = function(data){
		$scope.bayonetInfo  = data;
		$("#bayonetAddressDiv").attr("style","display:inline");
	}*/
	
	//点击一辆车辆，显示其相关的界面和信息
	$scope.showOneVehicleInfo = function(){
		if(driveInfoRefresh!=undefined && plateNumber!=globalPlateNumber){
			$interval.cancel(driveInfoRefresh);
		}
		$scope.hideAllGraphics();
		$scope.queryVehicleDriveInfo(pN);
		$scope.tabOnOneVehicle(pN);
		$scope.queryWarningDisposalViewList();
//        $("#carTypeDiv").attr("style","display:inline");
//		$("#rightDiv").attr("style","display:inline");
//		$scope.queryOneVehicleByPlateNumber();
		map.setZoom(6);
		
		//$("#earlyWarningTotalDiv").hide();
		$("#oneWarningTotalDiv").show();
		
		//刷新行驶信息
    	driveInfoRefresh = $interval(function(){
    		$scope.loadOneDriveInfo(globalPlateNumber);
        },10000,60);
	}
	
	//点击一个车标，显示车辆速度和预警
	$scope.tabOnVechicleIco = function(plateNumber){
		if(driveInfoRefresh!=undefined && plateNumber!=globalPlateNumber){
			$interval.cancel(driveInfoRefresh);
		}
//		$("#rightDiv").attr("style","display:inline");
		
		$scope.loadOneDriveInfo(plateNumber);
		
		/*$scope.queryWarningDisposalViewList();
		$("#infoDiv").attr("style","display:none");
    	$("#trajectoryDiv").attr("style","display:none");*/
//		$("#earlyWarningDiv").attr("style","display:inline");
    	/*earlyWarningIsClicked = true;
    	trajectoryIsClicked = false;
    	infoIsClicked = false;*/
//    	$scope.buttonClicked();
    	
    	//刷新行驶信息
    	driveInfoRefresh = $interval(function(){
    		$scope.loadOneDriveInfo(globalPlateNumber);
        },10000,60);
	}
	
	//加载车辆行驶信息
	$scope.loadOneDriveInfo = function(plateNumber){
//		console.log("---------------start loadOneDriveInfo--------------");
		globalPlateNumber = plateNumber;
		$scope.queryVehicleDriveInfo(plateNumber);
		//$("#earlyWarningTotalDiv").hide();
		$("#oneWarningTotalDiv").show();
	}
	
	//查某车预警及速度
	$scope.queryVehicleDriveInfo = function(plateNumber){
		mapService.queryVehicleDriveInfo(plateNumber,function (data) {
			 if (data.state == 200) {
				 $scope.vehicleDriveInfo = data.messageBody.vehicleDriveInfo;
			 }
		})
	}
	
	//标记出选定的车辆
	$scope.tabOnOneVehicle = function(plateNumber){
		mapService.queryOneVehicleRealTimeInfo(plateNumber,function (data) {
			 if (data.state == 200 && data.messageBody.oneVehicleRealTimeInfo!=null) {
				 	if(layerOfOnVehicle!=null & layerOfOnVehicle!=undefined){
		            	map.removeLayer(layerOfOnVehicle);
		            }
				 
					$scope.oneVehicleInfo = data.messageBody.oneVehicleRealTimeInfo;
					var result = $scope.oneVehicleInfo;
					//map.graphics.clear();
					$scope.hideAllGraphics();
					
					//添加车标
					var pt = new esri.geometry.Point(result.longitude,result.latitude);
					var pic;
					if(result.vehicleType == "新能源"){
	             		pic = new esri.symbol.PictureMarkerSymbol("assets/images/new-energy-vehicle.png",21,21);
	             	}else if(result.vehicleType == "危化品"){
	             		pic = new esri.symbol.PictureMarkerSymbol("assets/images/dangerous-goods-vehicle.png",21,21);
	             	}else if(result.vehicleType == "冷链车"){
	             		pic = new esri.symbol.PictureMarkerSymbol("assets/images/cold-chain-vehicle.png",21,21);
	             	}else if(result.vehicleType == "普通车"){
	             		pic = new esri.symbol.PictureMarkerSymbol("assets/images/ordinary-vehicle.png",21,21);
	             	}
		        	var gp = new esri.Graphic(pt,pic);
		        	layerOfOnVehicle = new esri.layers.GraphicsLayer();
		        	layerOfOnVehicle.add(gp);
        			//map.graphics.add(gp);
        			
        			//添加水滴标记
        			var picwater = new esri.symbol.PictureMarkerSymbol({"url":"assets/images/water_u803.png","height":35,"width":35,"yoffset": 20,});
					var ptwater = new esri.geometry.Point(result.longitude,result.latitude);
		        	var gpwater = new esri.Graphic(pt,picwater);
		        	layerOfOnVehicle.add(gpwater);
		        	map.addLayer(layerOfOnVehicle);
		        	//map.graphics.add(gpwater);
		        	if(singleCar != null && singleCar != ''){
		        		map.graphics.remove(singleCar);
		        	}
		        	singleCar = gpwater;
		        	map.graphics.redraw();
		        	//把地图中心定位到该车辆的位置
		        	map.centerAt(pt);
					
					/*for(var i=0;i<graps.length;i++){
						console.log("------------for each--------------->"+i);
						if(graps[i].attributes.plateNumber==result.plateNumber){
							console.log("-----------------catched it-------------");
							map.graphics.clear();
							//刷新实时位置
							var newPoint = graps[i].geometry;
		        			var grap = graps[i];
		        			//map.graphics.remove(grap);
							newPoint.setLatitude(result.latitude);
							newPoint.setLongitude(result.longitude);
		        			grap.setGeometry(newPoint);
		        			map.graphics.add(grap);
		        			
		        			//添加水滴标记
		        			var pic = new esri.symbol.PictureMarkerSymbol({"url":"assets/images/water_u803.png","height":35,"width":35,"yoffset": 20,});
							var oldPoint = graps[i].geometry;
							var pt = new esri.geometry.Point(result.longitude,result.latitude);
				        	var gp = new esri.Graphic(pt,pic);
				        	map.graphics.add(gp);
				        	if(singleCar != null && singleCar != ''){
				        		map.graphics.remove(singleCar);
				        	}
				        	singleCar = gp;
		        			
				        	//把地图中心定位到该车辆的位置
				        	map.centerAt(newPoint);
		        			//map.graphics.redraw();
						}else{
							map.graphics.remove(graps[i]);
						}
						map.graphics.redraw();
					}*/
					
					//console.log("times=="+loadLocalTimes);
					//console.log(realLocalRefresh);
					if(loadLocalTimes==0){
						realLocalRefresh = $interval(function(){
					    	$scope.tabOnOneVehicle(globalPlateNumber);
					    },10000,60);
					}
					loadLocalTimes++;
			 }/*else{
				 if(singleCar != null && singleCar != ''){
	        		 map.graphics.remove(singleCar);
	        	 }
				 //重新定位地图中心坐标及缩放大小
				 var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
				 map.centerAndZoom(pt,10);
				 $("#msgDiv").show().delay(1000).hide(300); 
			 }*/
		},function(err){
		})
		
		//不重新取数据，直接标记现有地图上的车
		/*if(graps.length>0){
			for(var i=0;i<graps.length;i++){
				if(graps[i].infoTemplate==plateNumber){
					var pic = new esri.symbol.PictureMarkerSymbol({"url":"assets/images/water_u803.png","height":35,"width":35,"yoffset": 20,});
					var oldPoint = graps[i].geometry;
					var pt = new esri.geometry.Point(oldPoint.getLongitude(),oldPoint.getLatitude());
		        	var gp = new esri.Graphic(pt,pic);//设置样式
		        	map.graphics.add(gp);//添加到图层中 
		        	singleCar = gp;
		        	map.graphics.redraw();
				}
			}
		}*/
	}

	     
	//点击查询车辆实时信息
    //$("#plateNumberButton").click(function(){
    /*$scope.showRealLocation = function(plateNumber){
    	hisRefresh = false;
    	$scope.queryVehicleHisTrajectoryInfoByPlateNumber();
    	if(!refresh){
    		refresh = true;
    		map.on("load", addPoint);
    	}
    	function addPoint(map){
        	setTimeout(function(){$scope.showPoint(map)}, 1);
    	};
    	setTimeout(function(){$scope.showPoint(map)}, refreshMap);
    //});
    };*/
    
  //实时信息
    /*$scope.showPoint = function(map){
    	var realLocations = $scope.realLocations;	//包含车辆经纬度的字符串
    	var local = realLocations[0].split("-");
    	showLocation(local[1]*1,local[0]*1);
        function showLocation(x, y) {  
        	//创建图片样式符合
        	var pic = new esri.symbol.PictureMarkerSymbol({"url":"assets/images/water_u803.png","height":35,"width":35,"yoffset": 20,});
        	var pt = new esri.geometry.Point(x,y);//创建一个点对象
        	var gp = new esri.Graphic(pt,pic);//设置样式
        	if(singleCar != null && singleCar != ''){
        		map.graphics.remove(singleCar);
        	}
        	map.graphics.add(gp);//添加到图层中 
        	singleCar = gp;
        	map.graphics.redraw();
        	if(refresh){
        		//js控制ID为plateNumberButton的按钮的点击
        		$("#plateNumberButton").trigger("click"); 
        	}
        }; 
    };*/
    
  //预警信息点击事件
    $scope.warningOnClick = function(data) {
    	$("#earlyWarningDisposalDiv").attr("style","display:inline");
    	//预警处置视图信息
    	$scope.warningDisposalView = data;
    	//处置流程信息
    	$scope.disposalProcess = data.disposalProcess;
    	//预警信息
    	$scope.earlyWarningInfo = data.earlyWarningInfo;
    	//预警事件、预警说明格式化
    	switch($scope.earlyWarningInfo.warningType)
    	{
	    	case '1':
	    		$scope.earlyWarningInfo['warningTypeExplain']="违规路线行驶";
	    		$scope.earlyWarningInfo['warningExplain'] = "车辆不按照规定路线行驶！";
	    		break;
	    	case '2':
	    		$scope.earlyWarningInfo['warningTypeExplain']="违规时间行驶";
	    		$scope.earlyWarningInfo['warningExplain'] = "车辆不按照规定时间行驶！";
	      	  	break;
	    	case '3':
	    		$scope.earlyWarningInfo['warningTypeExplain']="超速行驶";
	    		$scope.earlyWarningInfo['warningExplain'] = "车辆超速行驶，限速为100公里/小时，当前时速105公里/小时！";
	    		break;
	    	case '4':
	    		$scope.earlyWarningInfo['warningTypeExplain']="疲劳驾驶";
	    		$scope.earlyWarningInfo['warningExplain'] = "车辆连续行驶4小时以上未进行20分钟休息！";
	    		break;
    	}
    	//车辆信息
    	$scope.vehicleInfoEarlyWarning = data.vehicleInfo;
    	$scope.vehicleInfoEarlyWarning['vehicleKind'] = "物流车";
    	
    	//处置细则
    	var date = new Date().setTime($scope.earlyWarningInfo.warningStartTime.time);
    	var dateAsString = $filter('date')(date, "yyyy年MM月dd日 HH时mm分ss秒"); 
    	$scope.disposalRules = dateAsString + $scope.vehicleInfoEarlyWarning.vehicleType + $scope.vehicleInfoEarlyWarning.plateNumber + $scope.earlyWarningInfo.warningExplain;
    };
    
  //修改预警处置流程
    $scope.updateDisposalProcess = function () {
    	$("#earlyWarningDisposalDiv").attr("style","display:none");
    	// 设置处置时间
//		$scope.disposalProcess['jgDisposalTime'] = new Date();
		$scope.disposalProcess['jgDisposalTime'] = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
		// 设置处理人
		$scope.disposalProcess['jgUserId'] = "1";
    	var jgDisposalInstructions = "";
    	switch($scope.disposalMethods)
    	{
	    	case '处置不下发':
	    		// 获取处置原因
	    		if($("#wrong").is(':checked')){
	    			jgDisposalInstructions += $("#wrong").val();
	    		}
	    		if($("#repeat").is(':checked')){
	    			jgDisposalInstructions += ",";
	    			jgDisposalInstructions += $("#repeat").val();
	    		}
	    		// 设置处置原因
	    		$scope.disposalProcess['jgDisposalInstructions'] = $scope.disposalMethods + ",原因： " + jgDisposalInstructions;
	    		// 设置处置流程状态为结束
	    		$scope.disposalProcess['state'] = 1;
	    		break;
	    	case '处置下发':
	    		// 设置下发部门
	    		$scope.disposalProcess['hyDepartment'] = $scope.hyDepartment;
	    		$scope.disposalProcess['jgDisposalInstructions'] = $scope.disposalMethods + ",下发部门： " + $scope.hyDepartment;
	      	  	break;
    	}
    	mapService.updateDisposalProcess($scope.disposalProcess,function (data) {
			 if (data.state == 200) {
				 SweetAlert.swal("", "处置成功", "warning");
				 // 初始化页面
				 $scope.disposalProcess = {};
				 $scope.earlyWarningInfo = {};
				 $scope.vehicleInfoEarlyWarning = {};
				 $scope.disposalRules = "";
				 $scope.disposalMethods = "处置下发";
				 $scope.hyDepartment = "物流云平台";
				 $("#repeat").checked=false;
				 $("#wrong").checked=false;
            	 $scope.queryWarningDisposalViewList();
			 }else{
				 SweetAlert.swal("", "处置失败", "warning");
			 }
		 }, function (err) {
			 SweetAlert.swal("", "处置失败", "warning");
		 })
    };
    
	//模态窗口出不来加了个延时
	$timeout(function(){
		$(".form_datetime").datetimepicker({
			lang:'ch',
			timepicker:true,
			formatDate:'Y-m-d H:i'
		});
	},500);
	
	/**********************************地图图层显示start**********************************/
    $scope.showMap = function(){
//    	var map;
    	require([  
            "esri/map", "esri/layers/ArcGISTiledMapServiceLayer", "esri/geometry/Extent", "esri/geometry/Point", "esri/geometry/Polyline", "esri/SpatialReference",  
            "esri/symbols/SimpleMarkerSymbol","esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/layers/GraphicsLayer", "esri/graphic"  
        ], function(Map, ArcGISTiledMapServiceLayer, Extent, Point, Polyline, SpatialReference, SimpleMarkerSymbol,PictureMarkerSymbol, SimpleLineSymbol, GraphicsLayer, Graphic) {  
//    		var BASE_SERVER = 'http://20.0.56.14:8399/arcgis/rest/services/201406chengdu/cd_base_0716/MapServer'
   		var BASE_SERVER = 'http://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer';
            map = new Map("map", {  
//                basemap: "streets",  
                center: [104.0657754083, 30.6583098090],  
//                zoom: 4,
                zoom: 10,
                logo:false,
                nav:false,
                slider:false
            }); 
    		var layer = new ArcGISTiledMapServiceLayer(BASE_SERVER);
            
            map.addLayer(layer);
            layerOfNew = new GraphicsLayer();
            map.addLayer(layerOfNew);
            layerOfDangerous = new GraphicsLayer();
            map.addLayer(layerOfDangerous);
            layerOfCold = new GraphicsLayer();
            map.addLayer(layerOfCold);
            layerOfOrdinary = new GraphicsLayer();
            map.addLayer(layerOfOrdinary);
            //加载图层
//            map.addLayer(layer);
//            map.centerAndZoom(position, 14);
        });   
    }
    /**********************************地图图层显示end**********************************/
    
  //根据车辆类型搜索车辆信息
	 $scope.query = function(){
		 mapService.queryVehicleInfoByVehicleType($scope.vehicleModel.vehicleType,function (data) {
			 if (data.state == 200) {
					$scope.vehicleInfoView = data.messageBody.vehicleInfoViewList;
					$scope.locations = [];//清空集合
					var result = $scope.vehicleInfoView;
					var a;
//					console.log("2");
//					console.log($scope.vehicleModel.vehicleType);
//					console.log(data.messageBody.vehicleInfoViewList);
					for(var i=0;i<result.length;i++){
						a = "";
						var location = "";
//						console.log(result[i].warningEndTime.time);
//						console.log(time);
						if(result[i].warningEndTime != null){
							a = result[i].warningEndTime.time;
						}
						location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType+"-"+result[i].plateNumber+"-"+result[i].ascriptionCompany+"-"+result[i].competentAuthority+"-"+result[i].vehicleFrameNumber+"-"+result[i].warningType+"-"+a;
						$scope.locations.push(location);
						}
		            var vehicle = $scope.locations;	//包含车辆经纬度的字符串
		            len = vehicle.length;
		            graps = [];
//		            	console.log("1");
		            	for(var i = 0;i<vehicle.length;i++){
			             	var local = vehicle[i].split("-");
//			             	console.log(local);
			             	var pic;
			             	var type = local[2];
			             	var plateNumber = local[3];
			             	var ascriptionCompany = local[4];
			             	var competentAuthority = local[5];
			             	var vehicleFrameNumber = local[6];
			             	var warningType = local[7];
			             	switch(warningType)
			            	{
			        	    	case '1':
			        	    		warningType = "违规路线行驶";
			        	    		break;
			        	    	case '2':
			        	    		warningType = "违规时间行驶";
			        	      	  	break;
			        	    	case '3':
			        	    		warningType = "超速行驶";
			        	    		break;
			        	    	case '4':
			        	    		warningType = "疲劳驾驶";
			        	    		break;
			        	    	default:
			        	    		warningType = "";
									break;
			        	    	
			            	}
			             	var time = local[8];
			             	time = $filter("date")(time, "yyyy-MM-dd HH:mm:ss");
//			             	var speed = local[5];
			             	if(local[2] == "新能源"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/new-energy-vehicle.png",21,21);
			             	}else if(local[2] == "危化品"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/dangerous-goods-vehicle.png",21,21);
			             	}else if(local[2] == "冷链车"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/cold-chain-vehicle.png",21,21);
			             	}else if(local[2] == "普通车"){
			             		var pic = new esri.symbol.PictureMarkerSymbol("assets/images/ordinary-vehicle.png",21,21);
			             	}
			             	showLocation(local[1]*1,local[0]*1,pic,type,plateNumber,ascriptionCompany,competentAuthority,vehicleFrameNumber,warningType,time);
		            	}
			}
		 }, function (err) {
		 })
		 
	 }
	 
	 //统计车辆数据
	 $scope.queryEarlyWarningInfoCounts = function(){
		 mapService.queryEarlyWarningInfoCounts($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.earlyWarningInfoCounts =data.messageBody.earlyWarningInfo; 
			 }
		 });
	 }
	 
	 //点击查询车辆历史轨迹
     $scope.queryHistTra = function(){
     	refresh = false;
     	if(!hisRefresh){
     		hisRefresh = true;
     		$interval.cancel(realLocalRefresh);
     		loadLocalTimes = 0;
         	timeRefresh = setTimeout(function(){showLine(map);}, 1000, 1);
     	}
//     	setTimeout(function(){showLine(map)}, refreshMap);
//     	timeRefresh = setTimeout(function(){showLine(map)}, 10000);
     }
//     $("#hisButton").click(function()); 
     
     //清除所有车辆图层
     $scope.hideAllGraphics = function(){
    	 layerOfNew.setVisibility(false);
 		 layerOfDangerous.setVisibility(false);
 		 layerOfCold.setVisibility(false);
 		 layerOfOrdinary.setVisibility(false);
     }
     
    //显示所有车辆图层
     $scope.showAllGraphics = function(){
    	 layerOfNew.setVisibility(true);
 		 layerOfDangerous.setVisibility(true);
 		 layerOfCold.setVisibility(true);
 		 layerOfOrdinary.setVisibility(true);
     }
     
     //加点
     function showLocation(x, y, pic,type,plateNumber,ascriptionCompany,competentAuthority,vehicleFrameNumber,warningType,time) {  
     	//创建图片样式符合
//     	var pic = new PictureMarkerSymbol("assets/images/car.png",21,21);
     	var pt = new esri.geometry.Point(x,y);//创建一个点对象
//     	gra = new Graphic(pt,pic,type,plateNumber,infoTemplate);//设置样式
     	var attr = {"vehicleType":type,"plateNumber":plateNumber,"ascriptionCompany":ascriptionCompany,
     			"competentAuthority":competentAuthority,"vehicleFrameNumber":vehicleFrameNumber,"warningType":warningType,"time":time};
     	map.infoWindow.resize(500,200);
//     	console.log(map.infoWindow);
     	var infoTemplate = new esri.InfoTemplate("<font style='font-weight:bold;'>车牌号码：</font>${plateNumber}<br/><div style='margin-top:8px; height:1px; width:100%; background:#BABABA; overflow:hidden;'></div>",
     			"<p style='font-size:18px;'><font style='font-weight:bold;'>车辆类型：</font>${vehicleType}</br>" +
     			"<font style='font-weight:bold;'>所属企业：</font>${ascriptionCompany}</br>" +
     			"<font style='font-weight:bold;'>管理部门：</font>${competentAuthority}</br>" +
     			"<font style='font-weight:bold;'>车架号：</font>${vehicleFrameNumber}</br>" +
     			"<font style='font-weight:bold;'>预警类型：</font>${warningType}</br>" +
     			"<font style='font-weight:bold;'>预警时间：</font>${time}" +
     			"</p>");
     	gra = new esri.Graphic(pt,pic,attr,infoTemplate);//设置样式
     	//把图层实例放入数组中以便后面有针对性的移除
     	if(graps.length<=len){
     		graps.push(gra);
     	}
     	
     	switch(type){
     		case "新能源":
	     		layerOfNew.add(gra);
	     		//添加点击事件
	     		layerOfNew.on("mouse-up",function(e){
	            	if(e.graphic.attributes!=undefined){
	            		$scope.tabOnVechicleIco(e.graphic.attributes.plateNumber);
	            	}
	            });
	     		map.addLayer(layerOfNew);
	     		break;
     		case "危化品":
	     		layerOfDangerous.add(gra);
	     		//添加点击事件
	     		layerOfDangerous.on("mouse-up",function(e){
	            	if(e.graphic.attributes!=undefined){
	            		$scope.tabOnVechicleIco(e.graphic.attributes.plateNumber);
	            	}
	            });
	     		map.addLayer(layerOfDangerous);
	     		break;
     		case "冷链车":
	     		layerOfCold.add(gra);
	     		//添加点击事件
	     		layerOfCold.on("mouse-up",function(e){
	            	if(e.graphic.attributes!=undefined){
	            		$scope.tabOnVechicleIco(e.graphic.attributes.plateNumber);
	            	}
	            });
	     		map.addLayer(layerOfCold);
	     		break;
     		case "普通车":
	     		layerOfOrdinary.add(gra);
	     		//添加点击事件
	     		layerOfOrdinary.on("mouse-up",function(e){
	            	if(e.graphic.attributes!=undefined){
	            		$scope.tabOnVechicleIco(e.graphic.attributes.plateNumber);
	            	}
	            });
	     		map.addLayer(layerOfOrdinary);
	     		break;
     	}
     	$scope.hideAllGraphics();
     };
     
     function showAlert(){
    	 swal({
             title: "车牌号码不能为空！",
             type: "error",
             timer: 2000,
             confirmButtonText: "确定"
         });
     	}
    
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
//		   	map.graphics.clear();//清除地图上现有的点
//		   	graphicsLayer.clear();//清除所有graphics
		   	map.graphics.add(graphic2); 
		   	//map.addLayer(graphicsLayer);
		   	
		   	if(hisLocations.length > 0 ){
		   		//前面+n，这里就要-(n-1)
		   		var local = hisLocations[showLineLength-3].split("-");
//		   		console.log($scope.queryConditionData.vehicleType);
		   		if(local[2] == "新能源"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/new-energy-vehicle.png",21,21);
		   		}else if(local[2] == "危化品"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/dangerous-goods-vehicle.png",21,21);
		   		}else if(local[2] == "冷链车"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/cold-chain-vehicle.png",21,21);
		   		}else if(local[2] == "普通车"){
		   			var pic = new esri.symbol.PictureMarkerSymbol("assets/images/ordinary-vehicle.png",21,21);
		   		}
		   		showLocation(local[1]*1,local[0]*1,local[2]*1,local[3]*1,pic);
		   		
		   		var centerPoint = new esri.geometry.Point(local[1]*1,local[0]*1);
			   	map.centerAndZoom(centerPoint,12);
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
    
    //鼠标经过事件
   /* $scope.buttonClicked = function(){
    	$scope.isClicked(infoIsClicked,'info','#ffffff');
    	$scope.isClicked(trajectoryIsClicked,'trajectory','#ffffff');
    	$scope.isClicked(earlyWarningIsClicked,'earlyWarning','#ffffff');
    	$scope.isClicked(gpsIsClicked,'gps','#ffffff');
    	$scope.isClicked(bayonetIsClicked,'bayonet','#ffffff');
    	$scope.isClicked(hourIsClicked,'hour','#f2f2f2');
    	$scope.isClicked(dayIsClicked,'day','#f2f2f2');
    	$scope.isClicked(customizeIsClicked,'customize','#f2f2f2');
    };*/
    
    //按钮被点击和没有被点击所执行的方法
    /*$scope.isClicked = function(isClicked,id,bac){
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
    };*/
    
    //鼠标经过按钮时背景颜色和字体颜色的改变
    /*$scope.changeColor = function(id,bac){
    	document.getElementById(id).onmouseover = function(){this.style.background = '#aac1cb';this.style.color = bac;}
    	document.getElementById(id).onmouseout = function(){this.style.background = bac;this.style.color = '#979797';}
    };*/
    //当按钮已经被点击，鼠标经过按钮时背景颜色和字体颜色的不发生改变
   /* $scope.restoreColor = function(id,bac){
    	document.getElementById(id).onmouseover = function(){this.style.background = bac;this.style.color = '#979797';}
    };*/
    
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
	        $("#infoDiv").attr("style","display:inline");
	    	$("#trajectoryDiv").attr("style","display:none");
	    	$scope.query();
	    	/*realLocalRefresh = $interval(function(){
	        	$scope.newQuery();
	        },refreshMap);*/
		}
    }
    
    //重新加载车辆图标
	/*$scope.reloadPlateMark = function(){
		if(graps.length>0){
			for(var i=0;i<graps.length;i++){
				var newPoint = graps[i].geometry;
    			var grap = graps[i];
    			grap.setGeometry(newPoint);
    			map.graphics.add(grap);
			}
			map.graphics.redraw();
		}
	}*/
    
    //搜索车牌号码图标的点击事件
    $("#plateNumberSelect").click(function(){
        //根据类型选择过滤车辆图标
//        var selectOption = $("#childVehicleTypes option:selected").val();
//        console.log(selectOption);
//        filterVechleByTypes(selectOption);
        if(layerOfOnVehicle!=null & layerOfOnVehicle!=undefined){
        	map.removeLayer(layerOfOnVehicle);
        }
//    	$scope.showAllGraphics();
    	hisRefresh = false;
    	if($scope.plateInfo.location == null){
    		$scope.plateInfo.location = "A";
    	}
    	$scope.queryConditionData.onLineState = "";
    	$scope.queryConditionData.plateType = "";
    	$scope.queryConditionData.competentAuthority = "";
    	$scope.queryConditionData.ascriptionCompany = "";
    	$scope.queryVehicleByPlateNumber();
    	
//	    $("#carTypeDiv").attr("style","display:none");
	    
	    //$("#earlyWarningTotalDiv").show();
		$("#oneWarningTotalDiv").hide();
		$("#vehicleInfoDiv").attr("style","display:inline");
		
		//点击查询图标后把水滴标记去掉
		if(singleCar != null && singleCar != ''){
    		map.graphics.remove(singleCar);
    	}
		$scope.clearHisLine();
		//重新定位地图中心坐标及缩放大小
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
//		map.centerAndZoom(pt,10);
		map.centerAndZoom(pt,4);
		
		if(globalPlateNumber!=null && globalPlateNumber!=""){
			//$scope.reloadPlateMark();
		    //立即取消实时位置刷新
		   	$interval.cancel(realLocalRefresh);
		   	globalPlateNumber = "";
		   	loadLocalTimes = 0;
		}
		$interval.cancel(driveInfoRefresh);
		$scope.queryEarlyWarningInfoCounts();
    });
    
    //基本信息按钮的点击事件
   /* $("#info").click(function(){
    	$("#infoDiv").attr("style","display:inline");
    	$("#trajectoryDiv").attr("style","display:none");
    	$("#earlyWarningDiv").attr("style","display:none");
    	$("#earlyWarningDisposalDiv").attr("style","display:none");
    	infoIsClicked = true;
    	trajectoryIsClicked = false;
    	earlyWarningIsClicked = false;
    	$scope.buttonClicked();
    });*/
    //行驶轨迹按钮的点击事件
   /* $("#trajectory").click(function(){
    	$("#trajectoryDiv").attr("style","display:inline");
    	$("#infoDiv").attr("style","display:none");
    	$("#earlyWarningDiv").attr("style","display:none");
    	$("#earlyWarningDisposalDiv").attr("style","display:none");
    	trajectoryIsClicked = true;
    	infoIsClicked = false;
    	earlyWarningIsClicked = false;
    	$scope.buttonClicked();
    });*/
    //预警处置的点击事件
    /*$("#earlyWarning").click(function(){
    	$("#earlyWarningDiv").attr("style","display:inline");
    	$("#infoDiv").attr("style","display:none");
    	$("#trajectoryDiv").attr("style","display:none");
    	$scope.queryWarningDisposalViewList();
    	earlyWarningIsClicked = true;
    	trajectoryIsClicked = false;
    	infoIsClicked = false;
    	$scope.buttonClicked();
    });*/
    //GPS轨迹按钮的点击事件
   /* $("#gps").click(function(){
    	gpsIsClicked = true;
    	bayonetIsClicked = false;
    	$("#bayonetDiv").attr("style","display:none");
    	$scope.buttonClicked();
    });*/
    //卡口轨迹按钮的点击事件
    /*$("#bayonet").click(function(){
    	bayonetIsClicked = true;
    	gpsIsClicked = false;
    	$("#bayonetDiv").attr("style","display:inline");
    	$scope.buttonClicked();
    });*/
    
    //自定义按钮的点击事件
    /*$("#customize").click(function(){
		refresh = false;
		hisRefresh = false;
		customizeIsClicked = true;
		hourIsClicked = false;
		dayIsClicked = false;
		$scope.buttonClicked();
	});*/
    
    //一小时内的点击事件
	/*$("#hour").click(function(){
		refresh = false;
		hisRefresh = false;
		hourIsClicked = true;
		dayIsClicked = false;
		customizeIsClicked = false;
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
		$scope.buttonClicked();
		$scope.queryAllRecPlateInfo();
		$scope.queryHistTra();
	});*/
	//24小时内的点击事件
	/*$("#day").click(function(){
		refresh = false;
		hisRefresh = false;
		dayIsClicked = true;
		hourIsClicked = false;
		customizeIsClicked = false;
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
		$scope.buttonClicked();
		$scope.queryAllRecPlateInfo();
		$scope.queryHistTra();
	});*/
	//选择时间确定按钮的点击事件
	/*$("#hisButton").click(function(){
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
		$scope.queryAllRecPlateInfo();
		$scope.queryHistTra();
	});*/
	
	//开始时间的点击事件
	/*$("#startTime").click(function(){
		refresh = false;
		hisRefresh = false;
		$scope.queryConditionData.timePrevious = null;
	});*/
	//结束时间的点击事件
	/*$("#endTime").click(function(){
		refresh = false;
		hisRefresh = false;
		$scope.queryConditionData.timePrevious = null;
	});*/
	//刷新的点击事件
	/*$("#refresh").click(function(){
		refresh = false;
	 	hisRefresh = false;
	 	window.location.reload();
	});*/
	//高级搜索的点击事件
   /* $("#advanceSearch").click(function(){
    	$("#advanceSearchDiv").attr("style","display:inline");
	});*/
    //高级搜索中确定的点击事件
    /*$("#advanceSearchButton").click(function(){
    	hisRefresh = false;
    	if($scope.plateInfo.location == null){
    		$scope.plateInfo.location = "A";
    	}
    	var selectOption = $("#onOrOff option:selected").val();
		if(selectOption != null && selectOption != ""){
			$scope.queryConditionData.onLineState = selectOption;
		}
    	$scope.queryVehicleByPlateNumber();
    	$("#advanceSearchDiv").attr("style","display:none");
    });*/
    //取消卡口图片的点击事件
    /*$("#imgCancleBayonet").click(function(){
    	$("#bayonetAddressDiv").attr("style","display:none");
    });*/
    //车辆类型子选项的点击事件
    /*$("#childVehicleTypes").change(function(){
    	var selectOption = $("#childVehicleTypes option:selected").val();
    	filterVechleByTypes(selectOption);
    });*/
    //开启车辆类型二级选项
    /*$("#vehicleTypes").click(function(){
    	var selectOption = $("#vehicleTypes option:selected").val();
    	$("#childVehicleTypes").empty();
		switch (selectOption) {
		case "物流车":
			for(var i = 0;i<$scope.logisticsCars.length;i++){
	    		$("#childVehicleTypes").append("<option value='"+$scope.logisticsCars[i]+"'>"+$scope.logisticsCars[i]+"</option>");
	    	}
			break;
		case "123":
			for(var i = 0;i<$scope.testCars.length;i++){
				$("#childVehicleTypes").append("<option value='"+$scope.testCars[i]+"'>"+$scope.testCars[i]+"</option>");
			}
			break;

		default:
			break;
		}
	});*/
    
    
    $("#isline").click(function(){
    	var selectOption = $("#isline option:selected").val();
    	$scope.queryConditionData.onLineState = selectOption;
    	$scope.queryVehicleByPlateNumber();
    	$("#vehicleInfoDiv").attr("style","display:inline");
    });
    
    //选择车辆类型进行查找--单选按钮
    /*$("#carTypeDiv input[name='carType']").click(function(){
    	var selectOption = $('#carTypeDiv input[name="carType"]:checked ').val();
    	filterVechleByTypes(selectOption);
	});*/
    
    //根据分类筛选车辆
    function filterVechleByTypes(selectOption){
    	//map.graphics.clear();
    	if(selectOption==''){
    		layerOfNew.setVisibility(true);
    		layerOfDangerous.setVisibility(true);
    		layerOfCold.setVisibility(true);
    		layerOfOrdinary.setVisibility(true);
    		/*for(var i=0; i<graps.length; i++){
    			map.graphics.add(graps[i]);
        	}*/
    	}else{
			switch(selectOption)
	    	{
		    	case '新能源':
		    		layerOfNew.setVisibility(true);
		    		layerOfDangerous.setVisibility(false);
		    		layerOfCold.setVisibility(false);
		    		layerOfOrdinary.setVisibility(false);
		    		break;
		    	case '冷链车':
		    		layerOfNew.setVisibility(false);
		    		layerOfDangerous.setVisibility(true);
		    		layerOfCold.setVisibility(false);
		    		layerOfOrdinary.setVisibility(false);
		      	  	break;
		    	case '危化品':
		    		layerOfNew.setVisibility(false);
		    		layerOfDangerous.setVisibility(false);
		    		layerOfCold.setVisibility(true);
		    		layerOfOrdinary.setVisibility(false);
		    		break;
		    	case '普通车':
		    		layerOfNew.setVisibility(false);
		    		layerOfDangerous.setVisibility(false);
		    		layerOfCold.setVisibility(false);
		    		layerOfOrdinary.setVisibility(true);
		    		break;
	    	}
    		/*for(var i=0; i<graps.length; i++){
        		if(graps[i].attributes.vehicleType==selectOption){
        		    //清空图层后根据筛选条件重新添加相应图层
        			map.graphics.add(graps[i]);
        		}
        	}*/
    	}
    }
    
    //每10秒刷新一次车辆实时位置
    /*realLocalRefresh = $interval(function(){
    	$scope.newQuery();
    },refreshMap);*/
    
    //每10秒刷新一次预警信息
    warningRefresh = $interval(function(){
    	$scope.queryWarningDisposalViewList();
    },10000);
    
    //定时刷新车辆统计数据
    totalCountsRefresh = $interval(function(){
    	$scope.queryEarlyWarningInfoCounts();
    },10000);
    
    //确保关闭页面或浏览器后销毁定时器
    $scope.$on('$destroy',function(){  
    	$interval.cancel(realLocalRefresh); 
        loadLocalTimes = 0;
        $interval.cancel(driveInfoRefresh); 
        globalPlateNumber = null;
        $interval.cancel(totalCountsRefresh);
        $interval.cancel(warningRefresh);
    })
    
    //取消预警方框
    $("#cancleWarning").click(function(){
    	$("#earlyWarningDisposalDiv").attr("style","display:none");
    });
    
	//初始化查询条件
//	$scope.queryVehicleRealTimeInfo();
    $scope.showMap();
    $scope.queryEarlyWarningInfoCounts();
	$scope.query();
	$scope.queryFunction();
//	$scope.buttonClicked();
//	$scope.queryServiceLocation();
	     
} ]);


//预警类型格式化
app.filter('reverse', function() { //可以注入依赖
    return function(text) {
    	switch(text)
    	{
	    	case '1':
	    		return "违规路线行驶";
	    		break;
	    	case '2':
	    		return "违规时间行驶";
	      	  	break;
	    	case '3':
	    		return "超速行驶";
	    		break;
	    	case '4':
	    		return "疲劳驾驶";
	    		break;
    	}
    }
});

//状态格式转化
app.filter('chineseState', function() { 
    return function(text) {
		switch(text)
		{
			case 0:
				return "离线";
				break;
			case 1:
				return "在线";
				break;
		}
    }
});
	



 
  

