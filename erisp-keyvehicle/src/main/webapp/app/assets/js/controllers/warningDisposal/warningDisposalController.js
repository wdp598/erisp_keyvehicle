/**
 * 预警处置
 */

app.controller('warningDisposalController', ['$scope','$rootScope','$stateParams','$state','$modal', '$log','$filter','SweetAlert','warningDisposalService','smsService','$interval','SweetAlert',
  function($scope,$rootScope, $stateParams, $state, $modal, $log,$filter,SweetAlert,warningDisposalService,smsService,$interval,SweetAlert) {
	$scope.currentPage = 1;//初始化当前页
    $scope.pageSize = 10;//初始化每页大小
    $scope.queryConditionData = {
            'currentPage':  1,
            'pageSize': $scope.pageSize
    }
    $("#first").attr("disabled",true);//设置首页按钮不可用
	$("#previous").attr("disabled",true);//设置上一页按钮不可用
    
    $scope.disposalMethods = "处置";
    $scope.disposalProcess = {};
    $scope.otherReason = {};//用于存放选择其它时输入的原因
    var depName = $rootScope.depName;//分局名称
    var gpsData = [];//违规GPS集合
    var paths = [];
    var map;
    var graphicsLayer;
    var disposalRefresh;
    var isFrist = true;//第一次进入页面
    $scope.queryConditionData.departmentName = $rootScope.chineseDepName;
    
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
            	center:[104.0657754083, 30.6583098090],
                zoom: 4,
                logo:false,
                nav:false,
                slider:false
            }); 
    		var layer = new ArcGISTiledMapServiceLayer(BASE_SERVER);
    		graphicsLayer = new GraphicsLayer();//添加线的图层，方便清除上一个图层所画的线
            map.addLayer(layer);
            	$scope.showLine = function(){
            		if(null != gpsData && "" != gpsData){
//                    	paths = eval('(' + gpsData + ')' );
//                    	paths = eval('(0 || ' + gpsData + ')' );
                    	paths = JSON.parse(gpsData);
                    }
                    polylineJson={"paths": [paths],"spatialReference":{"wkid":4326}};    
                    map.centerAt(paths[0]);
             		var polyline=new esri.geometry.Polyline(polylineJson);
             		var sys=new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,new esri.Color([0,0,255]),3);
             		var graphic2=new esri.Graphic(polyline,sys);
             		graphicsLayer.clear();//清除所有graphics
             		graphicsLayer.add(graphic2); 
             		map.addLayer(graphicsLayer);
            	}
            	
        });   
    }
    /**********************************地图图层显示end**********************************/
    
	//翻页
    $scope.pageChanged = function () {
	   	//当前页
	   	$scope.queryConditionData['currentPage'] = $scope.currentPage;
	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
	   	$scope.queryWarningDisposal();
    };
    
    //浏览最大记录数
    $scope.pageQuery = function () {
	   	//当前页
	   	$scope.queryConditionData['currentPage'] = 1;
	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
    };
    
    //查询预警处置流程
    $scope.queryWarningDisposal = function () {
    	if(isFrist){
    		$("#dataLoad").attr("style","display:inline");
    		isFrist = false;
    	}
    	warningDisposalService.queryWarningDisposal($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				$scope.warningDisposalViewList = data.messageBody.warningDisposalViewList;
				$scope.totalItems = data.messageBody.total;
            	$scope.currentPage = data.messageBody.currentPage;
            	$scope.pages = data.messageBody.pages;
				 $("#dataLoad").attr("style","display:none"); 
			 }
		 }, function (err) {
			 $("#dataLoad").attr("style","display:none"); 
			 $("#errorDiv").show().delay(1000).hide(300); 
		 })
    };
    
    //查询首页
    $scope.query = function () {
        $scope.queryConditionData['currentPage'] = 1;
        $scope.queryConditionData['pageSize'] = $scope.pageSize;
        $scope.queryWarningDisposal();
        $("#first").attr("disabled",true);
		$("#previous").attr("disabled",true);
		$("#last").attr("disabled",false);
		$("#next").attr("disabled",false);
    };
    
    //查询上一页
    $scope.previousPage=function(){
 	   $("#last").attr("disabled",false);
 		 $("#next").attr("disabled",false);
 	   var number = $scope.currentPage-1;
 	   if(number>0){
 		   $scope.queryConditionData['currentPage'] = number;
 	   }else{
 		   $scope.queryConditionData['currentPage'] = 1;
 	   }
 	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
 	   $scope.queryWarningDisposal();
 	   	if(number==1 || number < 0){
 		   	 $("#first").attr("disabled",true);
 			 $("#previous").attr("disabled",true);
 		   	}
    }
    
  //查询下一页
    $scope.nextPage=function(){
 	   $("#first").attr("disabled",false);
 	   $("#previous").attr("disabled",false);
 	   if($scope.currentPage == $scope.pages){
 		   return;
 	   }
 	   
 	   var number = $scope.currentPage+1;
 	   $scope.queryConditionData['currentPage'] = number;
 	   if(number == $scope.pages || number > $scope.pages ){
 			  $scope.queryConditionData['currentPage'] = $scope.pages;
 			  $("#last").attr("disabled",true);
 			  $("#next").attr("disabled",true);
 		   }
 	   $scope.queryConditionData['pageSize'] = $scope.pageSize;
 	  $scope.queryWarningDisposal();
    }
    
    //查询最后一页
    $scope.lastPage=function(){
 	   $scope.queryConditionData['currentPage'] = $scope.pages;
 	   $scope.queryConditionData['pageSize'] = $scope.pageSize;
 	  $scope.queryWarningDisposal();
 	   $("#last").attr("disabled",true);
 	   $("#next").attr("disabled",true);
 	   $("#first").attr("disabled",false);
 	   $("#previous").attr("disabled",false);
    }
    
    //查询某一页
    $scope.go=function(){
    var anyNumber=$scope.anyPage;
 	   if(anyNumber>$scope.pages){
 		   anyNumber=$scope.pages;
 	   }else if(anyNumber<1){
 		  anyNumber=1;
 	   }
 	   $scope.queryConditionData['currentPage'] = anyNumber;
 	   $scope.queryConditionData['pageSize'] = $scope.pageSize;
 	  $scope.queryWarningDisposal();
	   $("#first").attr("disabled",false);
	   $("#previous").attr("disabled",false);
	   $("#last").attr("disabled",false);
	   $("#next").attr("disabled",false);
 	   if($scope.anyPage == $scope.pages || $scope.anyPage > $scope.pages ){
 			  $("#last").attr("disabled",true);
 			  $("#next").attr("disabled",true);
 		   }
 	   if($scope.anyPage == 1 || $scope.anyPage < 1){
 		  $("#first").attr("disabled",true);
 		  $("#previous").attr("disabled",true);
 	   }
    }
    
    //预警信息点击事件
    $scope.warningOnClick = function(data) {
    	//勿删--eddy
//    	var x,y,pos,txt;
//    	pos = data.earlyWarningInfo['warningStartLocation'];
//    	pos = pos.split(",");
//		getBaiduAddress(pos[0],pos[1],function(res){
			//预先处理根据GPS获取位置
//			data.earlyWarningInfo.warningStartLocation = res;
			//预警处置视图信息
	    	$scope.warningDisposalView = data;
	    	//处置流程信息
	    	$scope.disposalProcess = data.disposalProcess;
	    	//预警信息
	    	$scope.earlyWarningInfo = data.earlyWarningInfo;
	    	//预警信息
	    	$scope.warningSet = data.warningSet;
	    	//年度事故次数
	    	$scope.accidentTotal = data.accidentTotal;
	    	//年度违法次数
	    	$scope.illegalTotal = data.illegalTotal;
	    	if(null != $scope.earlyWarningInfo.warnGpsData && undefined != $scope.earlyWarningInfo.warnGpsData){
	    		gpsData = $scope.earlyWarningInfo.warnGpsData;
	    		$scope.showLine();
	    	}
	    	//预警事件、预警说明格式化
	    	switch($scope.earlyWarningInfo.warningType)
	    	{
		    	case '1':
		    		$scope.earlyWarningInfo['warningTypeExplain']="违反时间区域行驶";
		    		$scope.earlyWarningInfo['warningExplain'] = "车辆不按照时间区域行驶！【" +$scope.earlyWarningInfo.warningRuleName +"】";
		    		break;
		    	case '3':
		    		$scope.earlyWarningInfo['warningTypeExplain']="超速行驶";
			    		if(undefined == $scope.earlyWarningInfo.id || $scope.earlyWarningInfo.id == '' || $scope.earlyWarningInfo.id == null){
			    			if(null != $scope.earlyWarningInfo.speed && undefined != $scope.earlyWarningInfo.speed){
			    				$scope.earlyWarningInfo['warningExplain'] = "超速行驶，最大时速" 
			    					+ parseInt($scope.earlyWarningInfo.speed) + "公里/小时！【"
			    					+$scope.earlyWarningInfo.warningRuleName +"】";
			    			}else{
			    				$scope.earlyWarningInfo['warningExplain'] = "超速行驶【"
			    					+$scope.earlyWarningInfo.warningRuleName +"】";
			    			}
			    		}else{
			    			if(null != $scope.earlyWarningInfo.limitedMaxSpeed && undefined != $scope.earlyWarningInfo.limitedMaxSpeed
			    					&& null != $scope.earlyWarningInfo.speed && undefined != $scope.earlyWarningInfo.speed){
			    				$scope.earlyWarningInfo['warningExplain'] = "超速行驶，限速为" 
			    					+ $scope.earlyWarningInfo.limitedMaxSpeed 
			    					+ "公里/小时，最大时速" + parseInt($scope.earlyWarningInfo.speed) + "公里/小时！【"
			    					+$scope.earlyWarningInfo.warningRuleName +"】";
			    			}else{
			    				$scope.earlyWarningInfo['warningExplain'] = "超速行驶【"
			    					+$scope.earlyWarningInfo.warningRuleName +"】";
			    			}
			    		}
		    		break;
		    	case '4':
		    		$scope.earlyWarningInfo['warningTypeExplain']="疲劳驾驶";
		    		$scope.earlyWarningInfo['warningExplain'] = "疲劳驾驶！【"
		    			+$scope.earlyWarningInfo.warningRuleName +"】";
		    		break;
	    	}
	    	//车辆信息
	    	$scope.vehicleInfo = data.vehicleInfo;
	    	$scope.vehicleInfo['vehicleKind'] = "物流车";
	    	
	    	if(data.vehicleInfo.motTestDate!=null){
	    		var currentYear = new Date();
	    		//注册日期
	    		var rd = new Date().setTime(data.vehicleInfo.registrationDate.time);
	    		//最近年审日期
	    		var nmtd = new Date().setTime(data.vehicleInfo.motTestDate.time);
	    		var newmtd = new Date($filter('date')(nmtd, "yyyy-MM-dd"));
	    		//去年年审最后期限
	        	var lastmtd = new Date((currentYear.getFullYear()-1)+"-"+$filter('date')(rd, "MM-dd")); 
	        	if(lastmtd>=newmtd){
	        		$scope.vehicleInfo['motTestState'] = "未年审";
	        	}else{
	        		$scope.vehicleInfo['motTestState'] = "正常";
	        	}
	    	}else{
	    		$scope.vehicleInfo['motTestState'] = "正常";
	    	}
	    	
	    	//处置细则
	    	var date = new Date().setTime($scope.earlyWarningInfo.warningStartTime.time);
		    	var dateAsString = $filter('date')(date, "yyyy年MM月dd日 HH时mm分ss秒"); 
		    	if(undefined != $scope.vehicleInfo && null != $scope.vehicleInfo){
		    		if(undefined != $scope.vehicleInfo.vehicleType &&  null != $scope.vehicleInfo.vehicleType && undefined != $scope.earlyWarningInfo.warningExplain && null != $scope.earlyWarningInfo.warningExplain){
			    		$scope.disposalRules = dateAsString + $scope.vehicleInfo.vehicleType + "["+$scope.vehicleInfo.plateNumber+"]" + $scope.earlyWarningInfo.warningExplain;
			    	}else{
			    		$scope.disposalRules = "无";
			    	}
		    	}else{
		    		$scope.disposalRules = "未获取到该车辆的车辆信息，"+ $scope.earlyWarningInfo.warningExplain
		    		SweetAlert.swal("", "未获取到车辆信息", "warning");
		    	}
		    	
		    	if($scope.earlyWarningInfo.warningExplain == "" || $scope.earlyWarningInfo.warningExplain == null || $scope.earlyWarningInfo.warningExplain == undefined
		    			|| $scope.earlyWarningInfo.roadName == "" || $scope.earlyWarningInfo.roadName == null || $scope.earlyWarningInfo.roadName == undefined){
		    		$scope.earlyWarningInfo.content = "无";
		    	}else{
		    		$scope.earlyWarningInfo.content = "车牌号为【"+$scope.vehicleInfo.plateNumber+"】"+"车辆在"+$scope.earlyWarningInfo.roadName + $scope.earlyWarningInfo.warningExplain;
		    	}
    	
    };
    //修改预警处置流程
    $scope.updateDisposalProcess = function () {
    	// 设置处置时间
		$scope.disposalProcess['jgDisposalTime'] = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
		// 设置处理人
    	$scope.disposalProcess['jgDisposalInstructions'] = 0;
    	switch($scope.disposalMethods)
    	{
    	case '不处置':
    		if($("#ignoreReason #wrong").is(':checked')) {//错误预警
    			$scope.disposalProcess['jgDisposalInstructions'] = 3;
    			$scope.disposalRules = '不处置：错误预警信息!';
    			
    		} else if($("#ignoreReason #repeat").is(':checked')) {//重复预警
    			$scope.disposalProcess['jgDisposalInstructions'] = 4;
    			$scope.disposalRules = '不处置：重复预警信息!';
    			
    		} else if($("#ignoreReason #others").is(':checked')) {//其他原因
    			$scope.disposalProcess['jgDisposalInstructions'] = 5;
    			$scope.disposalRules = '不处置：其他原因!'+ $scope.otherReason.reason;
    			
    		}
    		// 设置处置流程状态为结束
    		$scope.disposalProcess['state'] = 1;
    		break;
    	case '处置':
    		if($("#dispatch").is(':checked')) {//派警处置
    			$scope.disposalProcess['jgDisposalInstructions'] = 1;
    			
    		} else if($("#copy").is(':checked')) {//抄告处置
    			$scope.disposalProcess['jgDisposalInstructions'] = 2;
    		}
    		
      	  	break;
    	}
    	//处置方式为0，表示未选择处置方式
    	if($scope.disposalProcess['jgDisposalInstructions'] == 0){
      		
      		if($("#warningEnterDetail #rules").val() == null 
      				|| $("#warningEnterDetail #rules").val() == undefined 
      				|| $("#warningEnterDetail #rules").val() == '') {
      			SweetAlert.swal("", "处置方式或细则不能为空！", "error");
      			return;
      		}
      		//如果都不匹配表明是处置录入
//			$scope.disposalProcess['jgDisposalInstructions'] = 6;
//			$scope.disposalRules = $("#warningEnterDetail #rules").val();
    	}
    	warningDisposalService.updateDisposalProcess($rootScope.fstrName,
    			$scope.earlyWarningInfo.id,
    			depName,
    			$scope.vehicleInfo.plateNumber,
    			$scope.disposalProcess.jgDisposalTime,
    			$scope.disposalProcess.jgDisposalInstructions,
    			$scope.disposalRules,function (data) {
    		if (data.status == 0) {
//    	warningDisposalService.updateDisposalProcess($scope.disposalProcess,function (data) {
//			 if (data.state == 200) {
//				 if($("#sendsms").is(":checked")){
//					 var smsText = $scope.hyDepartment+":"+$("#rules").val()+"请及时处理！";
//	            	 var smsMob = "";
//	            	 $scope.sendSMS(smsText,smsMob);
//				 }
				 SweetAlert.swal("", "处置成功", "success");
				 // 初始化页面
				 $scope.disposalProcess = {};
				 $scope.earlyWarningInfo = {};
				 $scope.vehicleInfo = {};
				 $scope.disposalRules = "";
				 $scope.disposalMethods = "处置";
				 $("#repeat").checked=false;
				 $("#wrong").checked=false;
				 $("#otherReason").attr("style","display:none");
            	 $scope.queryWarningDisposal();
			 }else{
				 SweetAlert.swal("", "处置失败", "warning");
			 }
		 }, function (err) {
			 SweetAlert.swal("", "处置失败", "warning");
		 })
    };
    
    /**
	  * 修改处置方式的时候，需要同步隐藏与显示下方的内容，注意这里的ID“disposalMethods”与其它地方de冲突了，这里改为了2
	  */
	 $("body").on("change","#disposalMethods2",function(){
		var data = $("#disposalMethods2").val();
    	switch (data) {
			case "不处置":
				$("#ignoreReason").attr("style","display:inline");
				$("#detailedMthod").attr("style","display:none");
				break;
			case "处置":
				$("#detailedMthod").attr("style","display:inline");
				$("#ignoreReason").attr("style","display:none");
				break;
		}
	 });
	 
	 /**
	  * 修改处置方式的时候，需要同步隐藏与显示下方的内容，注意这里的ID“disposalMethods”与其它地方de冲突了，这里改为了2
	  */
	$("body").on("click","input[name='disposalWay']:checkbox",function(){
		$("input[name='disposalWay']:checkbox").each(function() {
			$(this).attr("checked",false);
		});
		this.checked = true;
		if(this.checked){
			var selectOption = $(this).val();
			if(selectOption == '其它'){
				$("#otherReason").attr("style","display:inline");
			}else{
				$("#otherReason").attr("style","display:none");
			}
		}
	});
	
	//确保关闭页面或浏览器后销毁定时器
    $scope.$on('$destroy',function(){  
    	$interval.cancel(disposalRefresh); 
    })
    
    //进页面时默认加载
    $scope.queryWarningDisposal();
    
    //每10秒刷新一次车辆实时位置--暂定只刷新10次
    disposalRefresh = $interval(function(){
    	$scope.queryWarningDisposal();
    },10000);
    
    //查看车辆图片
    $scope.showVehiclePicture = function(data) {
    	if(data==undefined){return false;}
        $scope.temp = {
            'vehicleInfo':data
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
    };
    
    /**
     * 页面初始化之后，获取窗口大小，设置页面大小
     */
    $scope.setWindowSize = function() {
    	//debugger;
    	//窗口可是高度
    	var windowHeight = $(window).height();
    	var windowWidth = $(window).width();
    	
    	//获取标题div的高度，并计算高度只和
    	var preElementsHeight = 0;
    	var preElements = $("#warningContent").prevAll();
    	for(var i = 0; i < preElements.length; i ++) {
    		var temp = $(preElements[i]);
    		preElementsHeight += temp.height();
    	}
    	
    	var tableWidth = $("#warningTable").width();
    	/*var warningData = $("#warningData").width();
    	
    	if(tableWidth < 442) {
    		$("#warningTable").width(442);
    	}
    	
    	if(warningData < 730) {
    		$("#warningData").width(730);
    	}
    	tableWidth = $("#warningTable").width();
    	warningData = $("#warningData").width();
    	
    	$("#warningContainer").width($("#warningContent").width());*/
    	
    	//$("#warningContent").width(windowWidth - 199);
    	//设置右侧显示区域的div内容区域高度与宽度
    	$("#warningContent").height(windowHeight - preElementsHeight - 100);
    	$("#warningContent").css("overflow", "auto");
    };
    
    $scope.setWindowSize();
}]);

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

//预警内容车牌号说明
app.filter('noteOfPlateNumber', function() { //可以注入依赖
    return function(text) {
    	if(text!=null && text!=undefined){
    		return "车牌号为【"+text+"】的";
    	}
    }
});

//预警内容预警地点说明
app.filter('noteOfPlace', function() { //可以注入依赖
    return function(text) {
    	if(text!=null && text!=undefined){
    		return "车辆在"+text;
    	}
    }
});

//设置默认车辆图片
app.filter('defaultPic', function() { //可以注入依赖
    return function(text) {
    	if(text==null || text==undefined || text=='' || text.length<=12){
    		return "/vehiclePic/plate_none.png";
    	}else{
    		return text;
    	}
    }
});

//判断数据是否为空
app.filter('chineseIsNull', function() { //可以注入依赖
    return function(text) {
    	switch(text)
    	{
	    	case null:
	    	case undefined:
	    	case "":
	    		return "无";
	    		break;
	    	default :
	    		return text;
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
