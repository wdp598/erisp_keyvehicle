app.controller('demoMapCtrl', [
		'$scope',
		'$modal',
		'$filter',
		'$timeout',
		'$state',
		'$stateParams',
		'mapService',
		'$rootScope',
		'SweetAlert',
		'$interval',
		function($scope, $modal, $filter, $timeout, $state, $stateParams, mapService, $rootScope,SweetAlert, $interval) {
			
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
	var layerOfNew; //新能源图层
	var layerOfDangerous; //危化品图层
	var layerOfCold; //冷链车图层
	var layerOfOrdinary; //普通车图层
	var layerOfNewOff; //新能源离线图层
	var layerOfDangerousOff; //危化品离线图层
	var layerOfColdOff; //冷链车离线图层
	var layerOfOrdinaryOff; //普通车离线图层
	var layerOfOnVehicle; //定位某辆车的图层
	var textGrapLayer; //定位某辆车的车牌号图层
	var gra;
	var pN;		//选中车辆的车牌号码
	var refresh = false;//实时信息是否定时刷新，默认false
	var hisRefresh = false;//车辆历史轨迹是否定时刷新，默认为false
	var fristComing = true;//是否第一次进入,默认为true
	var timeClicked = false;//包含开始结束时间的div是否被点击，默认为false
	var infoIsClicked = false;//基本信息按钮是否被点击，默认为false
	var earlyWarningIsClicked = false;//预警处置按钮是否被点击，默认为false
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
    var layerOfOrdinaryText; //普通车标记图层
    var layerOfNewText; //新能源图层
	var layerOfDangerousText; //危化品图层
	var layerOfColdText; //冷链车图层
	var mapZoom = 16;
//	var mapZoom = 8;//内网地图缩放等级
	//标记当前图层是否在显示状态
	var layerOfOrdinaryFlag = false;
	var layerOfNewFlag = false;
	var layerOfDangerousFlag = false;
	var layerOfColdFlag = false;
	var departName = $rootScope.depName;
	
	$scope.showall = true;//panel显示全部左侧
	$scope.showright = false;//右侧
	
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
	
	$scope.changeLeftRigth = function(showFlag,position){
		if(position == "left"){
			$scope.showall = showFlag;
		}else if(position == "right"){
			$scope.showright = showFlag;
		}
		if(showFlag){
			if(layerOfOnVehicle != null & layerOfOnVehicle != undefined) {
				layerOfOnVehicle.clear();
			}
			if(textGrapLayer != null & textGrapLayer != undefined) {
				textGrapLayer.clear();
			}
			pt = new esri.geometry.Point(showCenterPoint[0], showCenterPoint[1]);
	        map.centerAndZoom(pt,showZoom);
	        $interval.cancel(realLocalRefresh);
			$scope.showAllGraphics();
			$scope.refresh();
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
	
    //监听复选框选中状态
    $scope.$watch('checkedName + checkedState',function(){
    	if(realLocalRefresh!=undefined){
			$interval.cancel(realLocalRefresh);
		}
    	if(queryRefresh!=undefined){
			$interval.cancel(queryRefresh);
		}
    	if($rootScope.checkedState){
    		if(layerOfOnVehicle!=null & layerOfOnVehicle!=undefined){
    			layerOfOnVehicle.suspend();
    			layerOfOnVehicle.clear();
            }
    		if(textGrapLayer != null & textGrapLayer != undefined) {
    			textGrapLayer.suspend();
    			textGrapLayer.clear();
            }
    		switch ($rootScope.checkedName) {
			case "新能源":
				if(layerOfNew.graphics.length<=0 && layerOfNewOff.graphics.length<=0){
					$scope.query("A1");
				}
				layerOfNewFlag = true;
				$scope.queryConditionData.newChecked = "新能源";
				layerOfNew.setVisibility(true);
				layerOfNewOff.setVisibility($scope.lineStateValue);
				$scope.queryConditionData.vehicleType = "新能源";
				if(map.getZoom()>mapZoom){
            		layerOfNewText.setVisibility(true);
            	}else{
            		layerOfNewText.setVisibility(false);
            	}
				var departName = "";
				$scope.queryConditionData['departName'] = departName;
				$scope.queryConditionData['type'] = "A1";
				$scope.queryEarlyWarningInfoCounts();
				$("#energy").attr("style","display:inline");
				break;
			case "冷链":
				if(layerOfCold.graphics.length<=0 && layerOfColdOff.graphics.length<=0){
					$scope.query("A2");
				}
				layerOfColdFlag = true;
				$scope.queryConditionData.dangerousChecked = "冷链车";
				layerOfCold.setVisibility(true);
				layerOfColdOff.setVisibility($scope.lineStateValue);
				$scope.queryConditionData.vehicleType = "冷链车";
				if(map.getZoom()>mapZoom){
            		layerOfColdText.setVisibility(true);
            	}else{
            		layerOfColdText.setVisibility(false);
            	}
				var departName = "";
				$scope.queryConditionData['departName'] = departName;
				$scope.queryConditionData['type'] = "A2";
				$scope.queryEarlyWarningInfoCounts();
				$("#coldChain").attr("style","display:inline");
				break;
			case "危化品":
				if(layerOfDangerous.graphics.length<=0 && layerOfDangerousOff.graphics.length<=0){
					$scope.query("A3");
				}
				layerOfDangerousFlag = true;
				$scope.queryConditionData.coldChecked = "危化品";
				layerOfDangerous.setVisibility(true);
				layerOfDangerousOff.setVisibility($scope.lineStateValue);
				$scope.queryConditionData.vehicleType = "危化品";
				if(map.getZoom()>mapZoom){
					layerOfDangerousText.setVisibility(true);
            	}else{
            		layerOfDangerousText.setVisibility(false);
            	}
				var departName = "";
				$scope.queryConditionData['departName'] = departName;
				$scope.queryConditionData['type'] = "A3";
				$scope.queryEarlyWarningInfoCounts();
				$("#dangerous").attr("style","display:inline");
				break;
			case "普通":
				if(layerOfOrdinary.graphics.length<=0 && layerOfOrdinaryOff.graphics.length<=0){
					$scope.query("A4");
				}
				layerOfOrdinaryFlag = true;
				$scope.queryConditionData.ordinaryChecked = "普通车";
				layerOfOrdinary.setVisibility(true);
				layerOfOrdinaryOff.setVisibility($scope.lineStateValue);
				$scope.queryConditionData.vehicleType = "普通车";
				if(map.getZoom()>mapZoom){
					layerOfOrdinaryText.setVisibility(true);
            	}else{
            		layerOfOrdinaryText.setVisibility(false);
            	}
				var departName = "";
				$scope.queryConditionData['departName'] = departName;
				$scope.queryConditionData['type'] = "A4";
				$scope.queryEarlyWarningInfoCounts();
				$("#ordinary").attr("style","display:inline");
				break;
			default:
				break;
			}
    		queryRefresh = $interval(function(){
    	    	 $scope.refresh();
    	    },30000);
    		$("#rightDiv").attr("style","display:inline;width:10%;position: absolute;z-index:4;top:0px;right:0px;");
    	}else{
    		switch ($rootScope.checkedName) {
			case "新能源":
				layerOfNewFlag = false;
				$scope.queryConditionData.newChecked = null;
				layerOfNew.setVisibility(false);
				layerOfNewOff.setVisibility(false);
				layerOfNewText.setVisibility(false);
				$("#energy").attr("style","display:none");
				break;
			case "冷链":
				layerOfColdFlag = false;
				$scope.queryConditionData.dangerousChecked = null;
				layerOfCold.setVisibility(false);
				layerOfColdOff.setVisibility(false);
				layerOfColdText.setVisibility(false);
				$("#coldChain").attr("style","display:none");
				break;
			case "危化品":
				layerOfDangerousFlag = false;
				$scope.queryConditionData.coldChecked = null;
				layerOfDangerous.setVisibility(false);
				layerOfDangerousOff.setVisibility(false);
				layerOfDangerousText.setVisibility(false);
				$("#dangerous").attr("style","display:none");
				break;
			case "普通":
				layerOfOrdinaryFlag = false;
				$scope.queryConditionData.ordinaryChecked = null;
				layerOfOrdinary.setVisibility(false);
				layerOfOrdinaryOff.setVisibility(false);
				layerOfOrdinaryText.setVisibility(false);
				$("#ordinary").attr("style","display:none");
				break;
			default:
				break;
			}
    	}
    });
    
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
	 
	 //根据车牌号码查询车辆卡口信息
	 $scope.queryAllRecPlateInfo = function(){
		 $("#bayonet").attr("style","display:inline");
		 $("#dataLoad").attr("style","display:inline"); 
		 mapService.queryRecPlateInfo($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.bayonetData = data.messageBody.recPlateInfoList;
				 if(0 == $scope.bayonetData.length){
					 $("#dataLoad").attr("style","display:none"); 
					 $("#notData").show().delay(1000).hide(300); 
				 }
				 $("#dataLoad").attr("style","display:none"); 
			 }
		 }, function (err) {
			 $("#dataLoad").attr("style","display:none"); 
			 $("#errorDiv").show().delay(1000).hide(300); 
		 })
	 }
	 
	 //根据用户类型和部门名称获取预警处置信息
	 $scope.queryWarningDisposalViewList = function(){
		 $scope.queryConditionData.userType = "1";
		 $scope.queryConditionData.department = "1";
		 $scope.queryConditionData.pageSize = 20;
		 mapService.queryWarningDisposalViewList($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.warningDisposalViewList = data.messageBody.warningDisposalViewList;
				 var result = $scope.warningDisposalViewList;
				 var showResult = [];
				 for(var i = 0;i<=result.length;i++){
					 if(undefined != result[i] && null != result[i]){
						 if(undefined != result[i].earlyWarningInfo && null != result[i].earlyWarningInfo){
							 var nowDate = new Date();
							 var today = Date.parse(new Date(nowDate.getFullYear()+"-"+(nowDate.getMonth()+1)+"-"+nowDate.getDate()));
							 var time = result[i].earlyWarningInfo.warningStartTime.time;
							 if(time > today){
								 showResult[i] = result[i];
							 }
						 }
					 }
				 }
				 $scope.showWarningDisposalViewList = showResult;
			 }
		 }, function (err) {
		 })
	 }
	 
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
	            location = result[i].latitude+"-"+result[i].longitude+"-"+result[i].vehicleType+"-"+result[i].plateNumber;
	            $scope.hisLocations.push(location);
	            }
	        }
	    }, function (err) {
	    })
	    }
	
	//查询所有车辆信息
    $scope.queryFunction = function () {
    	$scope.queryConditionData.plateNumber = "川" + $scope.plateInfo.location + $("#plateNumber").val().toUpperCase().trim();
    	$scope.queryConditionData.pageSize = 10;
    	$scope.queryConditionData.departmentName = $rootScope.chineseDepName;
    	mapService.queryVehicleInfo($scope.queryConditionData,function (data) {
    	    if (data.state == 200) {
            	$scope.vehicleInfoList = data.messageBody.vehicleInfo;
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
		hisRefresh = false;
		pN = data.plateNumber;
		globalPlateNumber = pN;
		$scope.oneInfo = data;
		$scope.showOneVehicleInfo(data.plateNumber);
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
//		$scope.queryWarningDisposalViewList();
		map.setZoom(14);
	}
	
	//加载车辆行驶信息
	$scope.loadOneDriveInfo = function(plateNumber){
		globalPlateNumber = plateNumber;
		$scope.queryVehicleDriveInfo(plateNumber);
		$scope.plateNumber = plateNumber;
	}
	
	//查某车预警及速度
	$scope.queryVehicleDriveInfo = function(plateNumber){
		$scope.plateNumber = plateNumber;
		mapService.queryVehicleDriveInfo(plateNumber,function (data) {
			 if (data.state == 200) {
				 $scope.vehicleDriveInfo = data.messageBody.vehicleDriveInfo;
			 }
		})
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
	    mapService.queryOneVehicleRealTimeInfoSyn(queryConditionParams)
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
	    		
		    	var vehicleType = "";
		        var onState = "";
		        var isRegister = "";
		        mapService.queryVehicleInfoByVehicleTypeSyn(vehicleType, departName, pn, onState, isRegister)
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
		        	
		        	mapService.queryDataOfDialogSyn(plateNumber, departName)
		            .then(function(data) {
		            	if (data.status == 0 && data.datas.length>0) {
	                        vehicleDriveInfo = data.datas[0];
	                    } else {
	                        vehicleDriveInfo["yearWarningTimes"] = "0";
	                        vehicleDriveInfo["warningTimes"] = "0";
	                    }
		            	
			            //添加车标
			        	if(vehicleRealInfo.longitude!="" && vehicleRealInfo.latitude!=""){
			        		$scope.hideAllGraphics();
				            pt = new esri.geometry.Point(vehicleRealInfo.longitude, vehicleRealInfo.latitude);
				            var textgraph = new esri.Graphic(pt,new esri.symbol.TextSymbol(plateNumber).setOffset(20, 10));
				            if (result.vehicleType == "新能源") {
				                pic = new esri.symbol.PictureMarkerSymbol("assets/images/new-energy-vehicle-online-90.png", imageSize, imageSize);
				            } else if (result.vehicleType == "危化品") {
				                pic = new esri.symbol.PictureMarkerSymbol("assets/images/dangerous-goods-vehicle-online-90.png", imageSize, imageSize);
				            } else if (result.vehicleType == "冷链车") {
				                pic = new esri.symbol.PictureMarkerSymbol("assets/images/cold-chain-vehicle-online-90.png", imageSize, imageSize);
				            } else if (result.vehicleType == "普通车") {
				                pic = new esri.symbol.PictureMarkerSymbol("assets/images/ordinary-vehicle-online-90.png", imageSize, imageSize);
				            }
				            attr = {
				                "vehicleType": result.vehicleType,
				                "plateNumber": result.plateNumber
				            };
			            	map.infoWindow.resize(400, 560);
		                    //离线车辆显示最后在线时间和最后所在地
		                    //在线车辆不显示最后在线时间，显示车辆所在地
		                    var onlineTime;
		                    var addrName;
		                    var stateDivWidth;
		                    if (vehicleRealInfo.gpsState == 1) {
		                        onlineTime = "";
		                        addrName = "车辆所在地";
		                        stateDivWidth = "170";
		                    } else {
		                        onlineTime = "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>车辆最后在线时间：</font>" + $scope.convertWarningTime(vehicleRealInfo.dateTime) + "</td></tr>";
		                        addrName = "车辆最后所在地";
		                        stateDivWidth = "200";
		                    }
	
		                    var vehicleType = result.vehicleType.replace(/车/, "");
		                    var title = "<div style='line-height:2;'><font style='font-weight:bold;font-size:16px;color:#000000;z-index:-1;'>" + 
		                    	"车牌号码：<label class='pn' style='font-size:16px;'>" + plateNumber + "</label>——" + vehicleType + "物流车</font></div>" + 
		                    	"<div style='height:2px;border:none;border-top:1px solid #919191;width:98%;'></div>";
		                    var content = "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:130px;z-index:-1;'>" + 
		                    	"<div class='col-md-12 font_black_famil'>" + 
		                    	"<div style='font-size: 16px;'>基本信息</div>" + 
		                    	"<div class='title_line_map' style='width:100%;'></div>" + 
		                    	"<table style='font-size:16px;width:100%;'>" +
			                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>入城证：</font>" + $scope.convertIntoCityCard(result.intoCityCard) + "</td>" + 
			                    "<td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>车牌类型：</font>" + $scope.convertPlateType(result.plateType) + "</td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>行业主管部门：</font>" + result.competentAuthority + "</td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>注册登记日期：</font>" + $scope.convertDate(result.registrationDate) + "</td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>所属企业：</font>" + result.ascriptionCompany + "</td></tr>" + 
			                    "</table></div></div>" + "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:" + stateDivWidth + "px;margin-top:10px;'>" + 
			                    "<div class='col-md-12 font_black_famil'>" + 
			                    "<div style='font-size: 16px;'>状态信息</div>" + 
			                    "<div class='title_line_map' style='width:100%;'></div>" + 
			                    "<table style='font-size:16px;width:100%'>" + 
			                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>年度累计报警次数：</font>" + vehicleDriveInfo.yearWarningTimes + "次</td>" + 
			                    "<td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>在线离线状态：</font>" + $scope.convertOnlineState(vehicleRealInfo.gpsState) + "</td></tr>" + 
			                    "<tr><td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>车辆速度：</font><font style='color: green;font-weight:bold;'>" + vehicleRealInfo.speed + "</font>km/h</td>" + 
			                    "<td style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>年审状态：</font>" + result.motTestState + "</td></tr>" + 
			                    "<tr><td><a style='color:red;font-size: 14px;' class='accidentTotal'><font style='font-weight:bold;font-size:14px;'>年度事故次数：</font>" + result.accidentTotal + "次</a></td>" + 
			                    "<td><a style='color:red;font-size: 14px;' class='illegalTotal'><font style='font-weight:bold;font-size:14px;'>年度违法次数：</font>" + result.illegalTotal + "次</a></td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>今日最高速度：</font><font style='color: green;font-weight:bold;'>" + vehicleRealInfo.maxSpeed + "</font>km/h</td></tr>" + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>今日行驶预警次数：</font><font style='color: red;font-weight:bold;'>" + vehicleDriveInfo.warningTimes + "</font>次</td></tr>" + onlineTime + 
			                    "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>" + addrName + "：</font>" + $scope.convertRoadname(vehicleRealInfo.roadName) + "</td></tr>" + 
			                    "</table></div></div>" + 
			                    "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:100px;margin-top:10px;'>" + 
			                    "<div class='col-md-12 font_black_famil'>" + "<div style='font-size: 16px; '>操作</div>" + 
			                    "<div class='title_line_map' style='width:100%;'></div>" + 
			                    "<table style='width:100%'><tr>" + 
			                    "<td>&nbsp;&nbsp;<img id='toRealLine' hideType='one' hideValue='" + plateNumber + "' src='assets/images/real_line_button.png' style='cursor:pointer;'></td>" + 
			                    "<td>&nbsp;&nbsp;<img id='toHisLine' hideType='one' hideValue='" + plateNumber + "' src='assets/images/his_line_button.png' style='cursor:pointer;'></td></tr>" + 
			                    "<tr><td style='height:32px;'>&nbsp;&nbsp;<img id='showPlatePic' hideValue='" + result.platePictureUrl + "' src='assets/images/show_pic_button.png' style='cursor:pointer;'></td>" + 
			                    "<td>&nbsp;&nbsp;<img id='bayonetButton' hideValue='" + plateNumber + "' src='assets/images/rec_button.png' style='cursor:pointer;'></td></tr></table>" + 
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
		                    map.graphics.redraw();
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
	    		$scope.earlyWarningInfo['warningTypeExplain']="违反时间区域行驶";
	    		$scope.earlyWarningInfo['warningExplain'] = "车辆不按照时间区域行驶！";
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
		$scope.disposalProcess['jgDisposalTime'] = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
		// 设置处理人
		$scope.disposalProcess['jgUserId'] = "1";
    	var jgDisposalInstructions = "";
    	switch($scope.disposalMethods)
    	{
	    	case '忽略':
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
	    	case '处置':
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
				 $scope.disposalMethods = "处置";
				 $scope.hyDepartment = "物流云平台";
				 $("#repeat").checked=false;
				 $("#wrong").checked=false;
//            	 $scope.queryWarningDisposalViewList();
			 }else{
				 SweetAlert.swal("", "处置失败", "warning");
			 }
		 }, function (err) {
			 SweetAlert.swal("", "处置失败", "warning");
		 })
    };

    //处置下发方式改变
    function checkDisposalMethods(value){
    	switch (value) {
		case "忽略":
			$("#reasonDiv").attr("style","display:inline");
			break;
		case "处置":
			$("#reasonDiv").attr("style","display:none");
			break;
		}
    }
    
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
            map = new Map("map", {  
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
            layerOfNew = new GraphicsLayer();
            map.addLayer(layerOfNew);
            //添加点击事件
     		layerOfNew.on("mouse-down",function(e){
     			$scope.showDialog(e);
            });
     		
            layerOfDangerous = new GraphicsLayer();
            map.addLayer(layerOfDangerous);
            //添加点击事件
     		layerOfDangerous.on("mouse-down",function(e){
     			$scope.showDialog(e);
            });
     		
            layerOfCold = new GraphicsLayer();
            map.addLayer(layerOfCold);
            layerOfCold.on("mouse-down",function(e){
            	$scope.showDialog(e);
            });
            
            layerOfOrdinary = new GraphicsLayer();
            map.addLayer(layerOfOrdinary);
            //添加点击事件
			/*layerOfOrdinary.onClick(function (e) {
				alert('23423');

            })*/
			layerOfOrdinary.on("mouse-down",function(e){
                $scope.showDialog(e);
            });

     		layerOfNewOff = new GraphicsLayer();
            map.addLayer(layerOfNewOff);
            //添加点击事件
     		layerOfNewOff.on("mouse-down",function(e){
     			$scope.showDialog(e);
            });
     		
            layerOfDangerousOff = new GraphicsLayer();
            map.addLayer(layerOfDangerousOff);
            //添加点击事件
     		layerOfDangerousOff.on("mouse-down",function(e){
     			$scope.showDialog(e);
            });
     		
            layerOfColdOff = new GraphicsLayer();
            map.addLayer(layerOfColdOff);
            layerOfColdOff.on("mouse-down",function(e){
            	$scope.showDialog(e);
            });
            
            layerOfOrdinaryOff = new GraphicsLayer();
            map.addLayer(layerOfOrdinaryOff);
            //添加点击事件
     		layerOfOrdinaryOff.on("mouse-down",function(e){
                $scope.showDialog(e);
            });
            
            layerOfNewText = new GraphicsLayer();
            map.addLayer(layerOfNewText);
            layerOfDangerousText = new GraphicsLayer();
            map.addLayer(layerOfDangerousText);
            layerOfColdText = new GraphicsLayer();
            map.addLayer(layerOfColdText);
            layerOfOrdinaryText = new GraphicsLayer();
            map.addLayer(layerOfOrdinaryText);
            
            map.on("zoom", function(e){
            	if(map.getZoom()>mapZoom){
            		layerOfNewText.setVisibility(layerOfNewFlag);
            		layerOfOrdinaryText.setVisibility(layerOfOrdinaryFlag);
            		layerOfDangerousText.setVisibility(layerOfDangerousFlag);
            		layerOfColdText.setVisibility(layerOfColdFlag);
            	}else{
            		layerOfNewText.setVisibility(false);
            		layerOfOrdinaryText.setVisibility(false);
            		layerOfDangerousText.setVisibility(false);
            		layerOfColdText.setVisibility(false);
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
       		 mapService.queryVehicleDriveInfo(plateNumber,function (data) {
      			if (data.state == 200) {
      				 vehicleBaseInfo = data.messageBody.vehicleInfo;
      				var plate = plateNumber.replace('川','');
      			mapService.queryDataOfDialog(plate,departName,function (data) {
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
              			stateDivWidth = "170";
              		}else{
              			onlineTime = "<tr><td colspan='2' style='font-size:14px;'><font style='font-weight:bold;font-size:14px;'>车辆最后在线时间：</font>"+$scope.convertWarningTime(dateTime)+"</td></tr>";
              			addrName = "车辆最后所在地";
              			stateDivWidth = "200";
              		}
              		var vehicleType;
        			if(null != vehicleBaseInfo.vehicleType && undefined != vehicleBaseInfo.vehicleType){
        				vehicleType = vehicleBaseInfo.vehicleType.replace(/车/, "");
        			}
        			var title = "<div style='line-height:2;'><font style='font-weight:bold;font-size:16px;color:#000000;z-index:-1;'>" +
	          			"车牌号码：<label class='pn' font-size:16px;>"+plateNumber+"</label>——"+vehicleType+"物流车</font></div>" +
	          			"<div style='height:2px;border:none;border-top:1px solid #919191;width:98%;'></div>";
     				var content = "<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:130px;z-index:-1;'>"+
	     				"<div class='col-md-12 font_black_famil'>"+
	    				"<div style='font-size: 16px;'>基本信息</div>"+
	    				"<div class='title_line_map' style='width:100%;'></div>"+
	         			"<table style='font-size:16px;width:100%;'>" +
	      	     		/*"<tr><td><font style='font-weight:bold;'>车辆类型：</font>"+vehicleBaseInfo.vehicleType+"</td>" +
	      	     		"<td><font style='font-weight:bold;'>牌照类型：</font>"+vehicleBaseInfo.plateType+"</td></tr>" +*/
	      	     	    "<tr><td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>入城证：</font>"+$scope.convertIntoCityCard(vehicleBaseInfo.intoCityCard)+"</td>" +
	      	     	    "<td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>车牌类型：</font>"+$scope.convertPlateType(vehicleBaseInfo.plateType)+"</td></tr>" +
	        			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>行业主管部门：</font>"+vehicleBaseInfo.competentAuthority+"</td></tr>" +
	        			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>注册登记日期：</font>"+$scope.convertDate(vehicleBaseInfo.registrationDate)+"</td></tr>" +
	         			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>所属企业：</font>"+vehicleBaseInfo.ascriptionCompany+"</td></tr>" +
	        			"</table></div></div>"+
	        			"<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:"+stateDivWidth+"px;margin-top:10px;'>"+
   	         			"<div class='col-md-12 font_black_famil'>"+
   	    				"<div style='font-size: 16px;'>状态信息</div>"+
   	    				"<div class='title_line_map' style='width:100%;'></div>"+
   	         			"<table style='font-size:16px;width:100%'>" +
   	         		    "<tr><td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>年度累计报警次数：</font>"+vehicleInfo.yearWarningTimes+"次</td>" +
   	         		    "<td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>在线离线状态：</font>"+$scope.convertOnlineState(gpsState)+"</td></tr>" +
   	         			"<tr><td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>车辆速度：</font><font style='color: green;font-weight:bold;'>"+parseInt(speed)+"</font>km/h</td>"+
	   	         		"<td style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>年审状态：</font>"+vehicleBaseInfo.motTestState+"</td></tr>" +
	         			"<tr><td><a style='color:red;font-size: 14px;' class='accidentTotal'><font style='font-weight:bold;font-size:14px;'>年度事故次数：</font>"+vehicleBaseInfo.accidentTotal+"次</a></td>" +
	        			"<td><a style='color:red;font-size: 14px;' class='illegalTotal'><font style='font-weight:bold;font-size:14px;'>年度违法次数：</font>"+vehicleBaseInfo.illegalTotal+"次</a></td></tr>"+
   	          			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>今日最高速度：</font><font style='color: green;font-weight:bold;'>"+parseInt(maxSpeed)+"</font>km/h</td></tr>" +
   	         			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>今日行驶预警次数：</font><font style='color: red;font-weight:bold;'>"+vehicleInfo.warningTimes+"</font>次</td></tr>" +
   	         			onlineTime+
   	         			"<tr><td colspan='2' style='font-size: 14px;'><font style='font-weight:bold;font-size:14px;'>"+addrName+":</font>"+$scope.convertRoadname(roadName)+"</td></tr>" +
   	        			"</table></div></div>"+
   	        			"<div class='row-fluid' style='border: 1px solid #ccc; width: 100%;height:100px;margin-top:10px;'>"+
	         			"<div class='col-md-12 font_black_famil'>"+
	    				"<div style='font-size: 16px; '>操作</div>"+
	    				"<div class='title_line_map' style='width:100%;'></div>"+
	        			"<table style='width:100%'><tr>"+
	        			"<td>&nbsp;&nbsp;<img id='toRealLine' hideType='all' hideValue='"+plateNumber+"' hideLongitude='"+longitude+"' hideLatitude='"+latitude+"' src='assets/images/real_line_button.png' style='cursor:pointer;'></td>" +
	        			"<td>&nbsp;&nbsp;<img id='toHisLine' hideType='all' hideValue='"+plateNumber+"' hideLongitude='"+longitude+"' hideLatitude='"+latitude+"' src='assets/images/his_line_button.png' style='cursor:pointer;'></td></tr>"+
	        			"<tr><td style='height:32px;'>&nbsp;&nbsp;<img id='showPlatePic' hideValue='"+vehicleBaseInfo.platePictureUrl+"' src='assets/images/show_pic_button.png' style='cursor:pointer;'></td>"+
	        			"<td>&nbsp;&nbsp;<img id='bayonetButton' hideValue='"+plateNumber+"' src='assets/images/rec_button.png' style='cursor:pointer;'></td></tr></table>"+
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
    			type:"map", typeCheckedName:typeCheckedName, rightCheckedName:rightCheckedName,pageType:pageType};
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
    			type:"map", typeCheckedName:typeCheckedName, rightCheckedName:rightCheckedName,pageType:pageType};
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
		 mapService.queryVehicleInfoByVehicleType(vehicleType,departName,pn,onlineStateCheck,isRegisterArea,function (data) {
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
	 
	 //根据车辆类型清除相应图层
	 function clearLayersByVehicleType(type){
		 switch(type){
	         case "A1":
	             layerOfNew.suspend();
	             layerOfNew.clear();
	             layerOfNewOff.suspend();
	             layerOfNewOff.clear();
	             layerOfNewText.suspend();
	             layerOfNewText.clear();
	             break;
	         case "A2":
	             layerOfCold.suspend();
	             layerOfCold.clear();
	             layerOfColdOff.suspend();
	             layerOfColdOff.clear();
	             layerOfColdText.suspend();
	             layerOfColdText.clear();
	             break;
	         case "A3":
	             layerOfDangerous.suspend();
	             layerOfDangerous.clear();
	             layerOfDangerousOff.suspend();
	             layerOfDangerousOff.clear();
	             layerOfDangerousText.suspend();
	             layerOfDangerousText.clear();
	             break;
	         case "A4":
	             layerOfOrdinary.suspend();
	             layerOfOrdinary.clear();
	             layerOfOrdinaryOff.suspend();
	             layerOfOrdinaryOff.clear();
	             layerOfOrdinaryText.suspend();
	             layerOfOrdinaryText.clear();
	             break;
	         default:
	             layerOfNew.clear();
	             layerOfNewOff.clear();
	             layerOfNewText.clear();
	             layerOfCold.clear();
	             layerOfColdOff.clear();
	             layerOfColdText.clear();
	             layerOfDangerous.clear();
	             layerOfDangerousOff.clear();
	             layerOfDangerousText.clear();
	             layerOfOrdinary.clear();
	             layerOfOrdinaryOff.clear();
	             layerOfOrdinaryText.clear();
	             break;
		 }
	 }
	 
	 //根据车辆类型刷新相应图层
	 function resumeLayersByVehicleType(type){
		 switch(type){
	         case "A1":
	             layerOfNew.resume();
	             layerOfNewOff.resume();
	             layerOfNewText.resume();
	             break;
	         case "A2":
	             layerOfCold.resume();
	             layerOfColdOff.resume();
	             layerOfColdText.resume();
	             break;
	         case "A3":
	             layerOfDangerous.resume();
	             layerOfDangerousOff.resume();
	             layerOfDangerousText.resume();
	             break;
	         case "A4":
	             layerOfOrdinary.resume();
	             layerOfOrdinaryOff.resume();
	             layerOfOrdinaryText.resume();
	             break;
	     }
	 }

	 function showLocation(type, result) {
		 var t;
		 var isArr = false;
		 if(type.indexOf(",")>=0){
			 t = type.split(",");
			 isArr = true;
		 }else{
			 t = type;
			 isArr = false;
		 }
		 if(isArr){
			 for (var i = 0; i < t.length; i++) {
				 clearLayersByVehicleType(t[i]);
			 }
		 }else{
			 clearLayersByVehicleType(t);
		 }
         
         for(var i = 0;i<result.length;i++){
             var pic;
             var vType = $scope.convertVehicleType(result[i].vehicleType);
             if(vType == "新能源"){
                 pic = $scope.showPicture(result[i].course,result[i].gpsState,"new-energy-vehicle");
             }else if(vType == "危化品"){
                 pic = $scope.showPicture(result[i].course,result[i].gpsState,"dangerous-goods-vehicle");
             }else if(vType == "冷链车"){
                 pic = $scope.showPicture(result[i].course,result[i].gpsState,"cold-chain-vehicle");
             }else if(vType == "普通车"){
                 pic = $scope.showPicture(result[i].course,result[i].gpsState,"ordinary-vehicle");
             }
             //创建图片样式符合
             var pt = new esri.geometry.Point(result[i].longitude,result[i].latitude);//创建一个点对象
             var attr = {"vehicleType":vType,"plateNumber":result[i].plateNumber,"warningType":result[i].warningType,
                 "warningStartTime":result[i].warningStartTime,"gpsState":result[i].gpsState,"dateTime":result[i].dateTime,
                 "longitude":result[i].longitude,"latitude":result[i].latitude,"roadName":result[i].roadName,"speed":result[i].speed,"maxSpeed":result[i].maxSpeed};
             map.infoWindow.resize(400,560);
             gra = new esri.Graphic(pt,pic,attr);//设置样式
             textgraph = new esri.Graphic(pt,new esri.symbol.TextSymbol(result[i].plateNumber).setOffset(20, 10));
             //把图层实例放入数组中以便后面有针对性的移除
             if(graps.length<=len){
                 graps.push(gra);
                 textgraphs.push(textgraph);
             }
             switch(vType){
                 case "新能源":
                     if(result[i].gpsState==1){
                         layerOfNew.add(gra);
                     }else{
                         layerOfNewOff.add(gra);
                     }
                     layerOfNewText.add(textgraph);
                     break;
                 case "危化品":
                     if(result[i].gpsState==1){
                         layerOfDangerous.add(gra);
                     }else{
                         layerOfDangerousOff.add(gra);
                     }
                     layerOfDangerousText.add(textgraph);
                     break;
                 case "冷链车":
                     if(result[i].gpsState==1){
                         layerOfCold.add(gra);
                     }else{
                         layerOfColdOff.add(gra);
                     }
                     layerOfColdText.add(textgraph);
                     break;
                 case "普通车":
                     if(result[i].gpsState==1){
                         layerOfOrdinary.add(gra);
                     }else{
                         layerOfOrdinaryOff.add(gra);
                     }
                     layerOfOrdinaryText.add(textgraph);
                     break;
             }
         }
         if(isArr){
			 for (var i = 0; i < t.length; i++) {
				 resumeLayersByVehicleType(t[i]);
			 }
		 }else{
			 resumeLayersByVehicleType(t);
		 }
     }
	 
	 //按角度加载车辆图标
	 $scope.showPicture = function(course,gpsState,type){
		 var picUrl;
		 if(gpsState==1){
			 if((338<=course && course<360) || (0<=course && course<23)){
				 //正北
				 picUrl = type+"-online-0.png";
			 }else if(23<= course && course < 68){
				 //东北
				 picUrl = type+"-online-45.png";
			 }else if(68<= course && course < 113){
				 //正东
				 picUrl = type+"-online-90.png";
			 }else if(113<= course && course < 158){
				 //东南
				 picUrl = type+"-online-135.png";
			 }else if(158<= course && course < 203){
				 //正南
				 picUrl = type+"-online-180.png";
			 }else if(203<= course && course < 248){
				 //西南
				 picUrl = type+"-online-225.png";
			 }else if(248<= course && course < 293){
				 //正西
				 picUrl = type+"-online-270.png";
			 }else if(293<= course && course < 338){
				 //西北
				 picUrl = type+"-online-315.png";
			 }
		 }else{
			 picUrl = type+"-offline.png";
		 }
		 var pms = new esri.symbol.PictureMarkerSymbol("assets/images/"+picUrl,imageSize,imageSize);
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
		 mapService.queryEarlyWarningInfoCounts($scope.queryConditionData.type,departName,isRegisterArea,function (data) {
				if (data.status == 0) {
					switch ($scope.queryConditionData.type) {
					case "A1":
						$scope.energyInfoCounts =data.datas[0]; 
						break;
					case "A2":
						$scope.coldChainInfoCounts =data.datas[0]; 
						break;
					case "A3":
						$scope.dangerousInfoCounts =data.datas[0]; 
						break;
					case "A4":
						$scope.ordinaryInfoCounts =data.datas[0]; 
						break;
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
		 if(queryRefresh!=undefined){
			$interval.cancel(queryRefresh);
		 }
		 var rightCheck = [];
	   	 $("input[type=checkbox].rightCheckbox:checked").each(function(){
	   		 rightCheck.push(this.name);
	   	 });
	   	 if($.inArray("register", rightCheck)>=0){
	   		isRegisterArea = true;
	   	 }
	   	 //只选在线
	   	 if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)<0){
//			layerOfNewOff.clear();
//			layerOfNewText.clear();
//			layerOfColdOff.clear();
//			layerOfColdText.clear();
//			layerOfDangerousOff.clear();
//			layerOfDangerousText.clear();
//			layerOfOrdinaryOff.clear();
//			layerOfOrdinaryText.clear();
	   		onlineStateCheck = "1";
	   	 //只选离线
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)>=0){
//	   		layerOfNew.clear();
//			layerOfNewText.clear();
//			layerOfCold.clear();
//			layerOfColdText.clear();
//			layerOfDangerous.clear();
//			layerOfDangerousText.clear();
//			layerOfOrdinary.clear();
//			layerOfOrdinaryText.clear();
	   		onlineStateCheck = "0";
	   	 //在线离线都选
	   	 }else if($.inArray("online", rightCheck)>=0 && $.inArray("offline", rightCheck)>=0){
	   		onlineStateCheck = "";
	     //在线离线都不选
	   	 }else if($.inArray("online", rightCheck)<0 && $.inArray("offline", rightCheck)<0){
//	   		layerOfNew.clear();
//			layerOfNewOff.clear();
//			layerOfNewText.clear();
//			layerOfCold.clear();
//			layerOfColdOff.clear();
//			layerOfColdText.clear();
//			layerOfDangerous.clear();
//			layerOfDangerousOff.clear();
//			layerOfDangerousText.clear();
//			layerOfOrdinary.clear();
//			layerOfOrdinaryOff.clear();
//			layerOfOrdinaryText.clear();
	   		onlineStateCheck = "-1";
	   	 }
 		 var types = $scope.getAllCheckedVehicleTypes();
 		 $scope.query(types);
 		 $scope.showAllGraphics();
 		 queryRefresh = $interval(function(){
 	    	 $scope.refresh();
 	     },30000);
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
     $scope.$watch('registerName + registerValue',function(newValue,oldValue){
    	 if(newValue == oldValue){
    		 return;
    	 }
    	 if(realLocalRefresh!=undefined){
 			$interval.cancel(realLocalRefresh);
 		 }
 		 if(queryRefresh!=undefined){
 			$interval.cancel(queryRefresh);
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
	   	 var types = $scope.getAllCheckedVehicleTypes();
	   	 $scope.query(types);
	   	 $scope.showAllGraphics();
	   	 queryRefresh = $interval(function(){
	    	 $scope.refresh();
	     },30000);
     });
     
     //获取所有选中的车辆类型
     $scope.getAllCheckedVehicleTypes = function(){
    	 var vType = [];
 		 $("input[type=checkbox].navCheckbox:checked").each(function(){
 			 var vName = $scope.convertVehicleTypeToA(this.name);
 			 vType.push(vName);
 		 });
 		 var types = vType.toString();
 		 return types;
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
     }
     
     //清除所有车辆图层
     $scope.hideAllGraphics = function(){
    	 layerOfNew.setVisibility(false);
 		 layerOfDangerous.setVisibility(false);
 		 layerOfCold.setVisibility(false);
 		 layerOfOrdinary.setVisibility(false);
 		 layerOfNewOff.setVisibility(false);
		 layerOfDangerousOff.setVisibility(false);
		 layerOfColdOff.setVisibility(false);
		 layerOfOrdinaryOff.setVisibility(false);
 		 layerOfNewText.setVisibility(false);
		 layerOfDangerousText.setVisibility(false);
		 layerOfColdText.setVisibility(false);
		 layerOfOrdinaryText.setVisibility(false);
     }
     
     //显示所有车辆图层
     $scope.showAllGraphics = function(){
    	 layerOfNew.setVisibility(true);
 		 layerOfDangerous.setVisibility(true);
 		 layerOfCold.setVisibility(true);
 		 layerOfOrdinary.setVisibility(true);
 		 layerOfNewOff.setVisibility(true);
		 layerOfDangerousOff.setVisibility(true);
		 layerOfColdOff.setVisibility(true);
		 layerOfOrdinaryOff.setVisibility(true);
     }
     
     //加点
     /*function showLocation(x, y, pic,type,plateNumber,warningType,warningStartTime,gpsState,dateTime,roadName,speed,maxSpeed) {
     	//创建图片样式符合
     	var pt = new esri.geometry.Point(x,y);//创建一个点对象
     	var attr = {"vehicleType":type,"plateNumber":plateNumber,"warningType":warningType,
     			"warningStartTime":warningStartTime,"gpsState":gpsState,"dateTime":dateTime,
     			"longitude":x,"latitude":y,"roadName":roadName,"speed":speed,"maxSpeed":maxSpeed};
     	map.infoWindow.resize(500,560);
     	gra = new esri.Graphic(pt,pic,attr);//设置样式
     	textgraph = new esri.Graphic(pt,new esri.symbol.TextSymbol(plateNumber).setOffset(20, 10));
     	//把图层实例放入数组中以便后面有针对性的移除
     	if(graps.length<=len){
     		graps.push(gra);
     		textgraphs.push(textgraph);
     	}
     	switch(type){
     		case "新能源":
     			if(gpsState==1){
     				layerOfNew.add(gra);
     			}else{
     				layerOfNewOff.add(gra);
     			}
	     		layerOfNewText.add(textgraph);
	     		break;
     		case "危化品":
     			if(gpsState==1){
     				layerOfDangerous.add(gra);
     			}else{
     				layerOfDangerousOff.add(gra);
     			}
	     		layerOfDangerousText.add(textgraph);
	     		break;
     		case "冷链车":
     			if(gpsState==1){
     				layerOfCold.add(gra);
     			}else{
     				layerOfColdOff.add(gra);
     			}
	     		layerOfColdText.add(textgraph);
	     		break;
     		case "普通车":
     			if(gpsState==1){
     				layerOfOrdinary.add(gra);
     			}else{
     				layerOfOrdinaryOff.add(gra);
     			}
	     		layerOfOrdinaryText.add(textgraph);
	     		break;
     	}
     };*/
     
     function showAlert(){
    	 swal({
             title: "车牌号码不能为空！",
             type: "error",
             timer: 2000,
             confirmButtonText: "确定"
         });
     	}
    
 	//设置div可拖动
    accident = document.getElementById("accident");
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
    $scope.mouseEvent(bayonetAddressDiv);
 	
 	//气泡中事故次数点击事件
 	$("body").on("click","a.accidentTotal",function(){
 		$scope.queryConditionData.plateNumber = $("label.pn").text();
 		$scope.queryConditionData.requestType = "accident";
 		mapService.searchAccidentInfoNoPage($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.accidentInfoList =data.messageBody.accidentInfoList; 
					 $("#illegal").attr("style","display:none");
					 $("#accident").attr("style","display:inline");
			 }
		 });
 	});
 	
 	//气泡中违法次数点击事件
 	$("body").on("click","a.illegalTotal",function(){
 		$scope.queryConditionData.plateNumber = $("label.pn").text();
 		$scope.queryConditionData.requestType = "illegal";
 		mapService.searchIllegalInfoNoPage($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				 $scope.illegalInfoList =data.messageBody.illegalInfoList; 
					 $("#accident").attr("style","display:none");
					 $("#illegal").attr("style","display:inline");
			 }
		 });
 	});
 	
 	//气泡中当日卡口过车查询点击事件
 	$("body").on("click","#bayonetButton",function(){
 		$scope.queryConditionData.plateNumber = $(this).attr("hideValue");
 		//从当天0点开始，保留--colin
// 		var nowDate = new Date();
// 		var today = Date.parse(new Date(nowDate.getFullYear()+"-"+(nowDate.getMonth()+1)+"-"+nowDate.getDate()));
// 		$scope.queryConditionData.startTime = $filter("date")(today, "yyyy-MM-dd HH:mm");
//	    $scope.queryConditionData.endTime = $filter('date')(new Date(), "yyyy-MM-dd HH:mm");
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
		//$scope.clearHisLine();
		//重新定位地图中心坐标及缩放大小
		var pt = new esri.geometry.Point(104.0657754083, 30.6583098090);
//		map.centerAndZoom(pt,10);
//		map.centerAndZoom(pt,4);
		
		if(globalPlateNumber!=null && globalPlateNumber!=""){
		    //立即取消实时位置刷新
		   	$interval.cancel(realLocalRefresh);
		   	globalPlateNumber = "";
		   	loadLocalTimes = 0;
		}
    });
    
    //根据分类筛选车辆
    function filterVechleByTypes(selectOption){
    	if(selectOption==''){
    		layerOfNew.setVisibility(true);
    		layerOfDangerous.setVisibility(true);
    		layerOfCold.setVisibility(true);
    		layerOfOrdinary.setVisibility(true);
    		layerOfNewOff.setVisibility(true);
    		layerOfDangerousOff.setVisibility(true);
    		layerOfColdOff.setVisibility(true);
    		layerOfOrdinaryOff.setVisibility(true);
    	}else{
			switch(selectOption)
	    	{
		    	case '新能源':
		    		layerOfNew.setVisibility(true);
		    		layerOfDangerous.setVisibility(false);
		    		layerOfCold.setVisibility(false);
		    		layerOfOrdinary.setVisibility(false);
		    		layerOfNewOff.setVisibility(true);
		    		layerOfDangerousOff.setVisibility(false);
		    		layerOfColdOff.setVisibility(false);
		    		layerOfOrdinaryOff.setVisibility(false);
		    		break;
		    	case '冷链车':
		    		layerOfNew.setVisibility(false);
		    		layerOfDangerous.setVisibility(true);
		    		layerOfCold.setVisibility(false);
		    		layerOfOrdinary.setVisibility(false);
		    		layerOfNewOff.setVisibility(false);
		    		layerOfDangerousOff.setVisibility(true);
		    		layerOfCold.offsetVisibility(false);
		    		layerOfOrdinaryOff.setVisibility(false);
		      	  	break;
		    	case '危化品':
		    		layerOfNew.setVisibility(false);
		    		layerOfDangerous.setVisibility(false);
		    		layerOfCold.setVisibility(true);
		    		layerOfOrdinary.setVisibility(false);
		    		layerOfNewOff.setVisibility(false);
		    		layerOfDangerousOff.setVisibility(false);
		    		layerOfColdOff.setVisibility(true);
		    		layerOfOrdinaryOff.setVisibility(false);
		    		break;
		    	case '普通车':
		    		layerOfNew.setVisibility(false);
		    		layerOfDangerous.setVisibility(false);
		    		layerOfCold.setVisibility(false);
		    		layerOfOrdinary.setVisibility(true);
		    		layerOfNewOff.setVisibility(false);
		    		layerOfDangerousOff.setVisibility(false);
		    		layerOfColdOff.setVisibility(false);
		    		layerOfOrdinaryOff.setVisibility(true);
		    		break;
	    	}
    	}
    }
    
    //每10秒刷新一次预警信息
//    warningRefresh = $interval(function(){
//    	$scope.queryWarningDisposalViewList();
//    },10000);
    
    //定时刷新车辆位置--5秒
    queryRefresh = $interval(function(){
    	 $scope.refresh();
    },30000);
    
    $scope.refresh = function(){
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
	   	 var types = $scope.getAllCheckedVehicleTypes();
	   	 $scope.query(types);
	   	 $scope.showAllGraphics();
	   	 $("input[type=checkbox].navCheckbox:checked").each(function(){
	   		var type;
	   		switch(this.name){
	   			case "新能源":
	   				type = "A1";
	   				/*layerOfNew.clear();
	   				layerOfNewOff.clear();
	   				layerOfNewText.clear();*/
	   				break;
	   			case "冷链":
	   				type = "A2";
	   				/*layerOfCold.clear();
	   				layerOfColdOff.clear();
	   				layerOfColdText.clear();*/
	   				break;
	   			case "危化品":
	   				type = "A3";
	   				/*layerOfDangerous.clear();
	   				layerOfDangerousOff.clear();
	   				layerOfDangerousText.clear();*/
	   				break;
	   			case "普通":
	   				type="A4";
	   				/*layerOfOrdinary.clear();
	   				layerOfOrdinaryOff.clear();
	   				layerOfOrdinaryText.clear();*/
	   				break;
	   		}
	   		$scope.queryEarlyWarningInfoCounts();
		});
    }
    
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
    	$("[name=新能源]:checkbox").prop("checked", false);
		$("[name=冷链]:checkbox").prop("checked", false);
		$("[name=危化品]:checkbox").prop("checked", false);
		$("[name=普通]:checkbox").prop("checked", false);
    	$interval.cancel(realLocalRefresh); 
    	$interval.cancel(queryRefresh);
        loadLocalTimes = 0;
        globalPlateNumber = null;
        $interval.cancel(warningRefresh);
        $rootScope.checkedName="";
        $rootScope.checkedState=false;
        dijit.popup.close(dialog);
        $("body").off("click");
    })
    
    //取消预警方框
    $("#cancleWarning").click(function(){
    	$("#earlyWarningDisposalDiv").attr("style","display:none");
    });
    
    $scope.convertVehicleType = function(type){
    	if(type!=undefined && type!=""){
    		switch(type)
	    	{
		    	case 'A1':
		    		return "新能源";
		    		break;
		    	case 'A2':
		    		return "冷链车"
		      	  	break;
		    	case 'A3':
		    		return "危化品"
		    		break;
		    	case 'A4':
		    		return "普通车"
		    		break;
	    	}
    	}
    }
    
    $scope.convertVehicleTypeToA = function(type){
    	if(type!=undefined && type!=""){
    		switch(type)
	    	{
		    	case '新能源':
		    		return "A1";
		    		break;
		    	case '冷链':
		    		return "A2"
		      	  	break;
		    	case '危化品':
		    		return "A3"
		    		break;
		    	case '普通':
		    		return "A4"
		    		break;
	    	}
    	}
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
	



 
  

