/**
 *	处置录入页面
 */

app.controller('disposalEntryController', ['$scope','$rootScope','$state','$modal', '$log','$filter','SweetAlert','warningDisposalService','smsService','$interval','SweetAlert',
  function($scope,$rootScope, $state, $modal, $log,$filter,SweetAlert,warningDisposalService,smsService,$interval,SweetAlert) {
	
	$scope.currentPage = 1;//初始化当前页
    $scope.pageSize = 16;//初始化每页大小
    $scope.queryConditionData = {
            'currentPage':  1,
            'pageSize': $scope.pageSize
    }
    $("#first").attr("disabled",true);//设置首页按钮不可用
	$("#previous").attr("disabled",true);//设置上一页按钮不可用
    
    $scope.disposalMethods = "处置";
    $scope.hyEntryDepartment = "一分局一大队";
    $scope.disposalEntry = {};
    var depName = $rootScope.depName;
    $scope.queryConditionData.departmentName = $rootScope.chineseDepName;
    var entryRefresh;//定时器
    var isFrist = true;//第一次进入页面
	
	//翻页
    $scope.pageChanged = function () {
	   	//当前页
	   	$scope.queryConditionData['currentPage'] = $scope.currentPage;
	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
	   	$scope.queryWarningDisposalViewList();
    };
    
    
    
    
    //浏览最大记录数
    $scope.pageQuery = function () {
	   	//当前页
	   	$scope.queryConditionData['currentPage'] = 1;
	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
    };
    
    //查询预警处置流程
    $scope.queryWarningDisposalViewList = function () {
    	if(isFrist){
    		$("#dataLoad").attr("style","display:inline");
    		isFrist = false;
    	}
    	warningDisposalService.queryDisposaledList($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				$scope.warningDisposalViewList = data.messageBody.warningDisposalViewList;
				$scope.totalItems = data.messageBody.total;
            	$scope.currentPage = data.messageBody.currentPage;
            	$scope.pages = data.messageBody.pages;
            	if(0 == $scope.warningDisposalViewList.length){
					 $("#dataLoad").attr("style","display:none"); 
					 $("#notData").show().delay(1000).hide(300); 
				 }
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
        $scope.queryWarningDisposalViewList();
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
 	   $scope.queryWarningDisposalViewList();
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
 	  $scope.queryWarningDisposalViewList();
    }
    
    //查询最后一页
    $scope.lastPage=function(){
 	   $scope.queryConditionData['currentPage'] = $scope.pages;
 	   $scope.queryConditionData['pageSize'] = $scope.pageSize;
 	  $scope.queryWarningDisposalViewList();
 	   $("#last").attr("disabled",true);
 	   $("#next").attr("disabled",true);
 	   $("#first").attr("disabled",false);
 	   $("#previous").attr("disabled",false);
    }
    
    //查询某一也
    $scope.go=function(){
    var anyNumber=$scope.anyPage;
 	   if(anyNumber>$scope.pages){
 		   anyNumber=$scope.pages;
 	   }else if(anyNumber<1){
 		  anyNumber=1;
 	   }
 	   $scope.queryConditionData['currentPage'] = anyNumber;
 	   $scope.queryConditionData['pageSize'] = $scope.pageSize;
 	  $scope.queryWarningDisposalViewList();
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
    
    //经纬度转化地址
    function getBaiduAddress(GpsX, GpsY,callback){
    	// 百度地图API功能
    	// 创建地理编码实例，用来获取坐标地址
    	var myGeo = new BMap.Geocoder();
    	//GPS坐标
    	var x = GpsX;
    	var y = GpsY;
    	var ggPoint = new BMap.Point(x,y);

    	var baiduPoint;
    	var baiduAddress;
    	
    	//gps坐标转换为百度坐标转换完之后的回调函数
    	translateCallback = function (data){
    		if(data.status === 0) {
    		
    			//根据坐标获取地址信息
    			myGeo.getLocation(data.points[0], function(result){
    				if (result){
    				baiduPoint = data.points[0];
    				baiduAddress = result.address;
    				//	alert(baiduAddress);
    				callback(baiduAddress);
    				}
    			});	 
    		}
    	}
    	
    	//将gps坐标转换为百度坐标
    	var convertor = new BMap.Convertor();
    	var pointArr = [];
    	pointArr.push(ggPoint);
    	convertor.translate(pointArr, 1, 5, translateCallback);
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
	    	//预警事件、预警说明格式化
	    	switch($scope.earlyWarningInfo.warningType)
	    	{
		    	case '1':
		    		$scope.earlyWarningInfo['warningTypeExplain']="违反时间区域行驶";
		    		$scope.earlyWarningInfo['warningExplain'] = "车辆不按照时间区域行驶！【"
		    			+$scope.earlyWarningInfo.warningRuleName +"】";
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
			    					+ $scope.earlyWarningInfo.limitedMaxSpeed + "公里/小时，最大时速" 
			    					+ parseInt($scope.earlyWarningInfo.speed) + "公里/小时！【"
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
//		});
    	
    };
    //修改预警处置流程
    $scope.updateDisposalEntry = function () {
    	// 设置处置时间
//		$scope.disposalProcess['jgDisposalTime'] = new Date();
		$scope.disposalEntry['EntryTime'] = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
		// 设置处理人
		
		$scope.disposalEntry['EntryUserId'] = $rootScope.fstrName;
		$scope.disposalProcess['EntryInstructions'] = 6;
		$scope.disposalRules = $("#warningEnterDetail #rules").val();
//		$scope.disposalEntry['id'] = $scope.disposalProcess.id;
//    	var jgEntryInstructions = "";
    	/*switch($scope.disposalMethods)
    	{
	    	case '忽略':
	    		// 获取处置原因
	    		$scope.disposalProcess['EntryInstructions'] = 5;
	    		if($("#wrong").is(':checked')){
//	    			jgEntryInstructions += $("#wrong").val();
	    			$scope.disposalProcess['jgDisposalInstructions'] = 2;
	    		}
	    		if($("#repeat").is(':checked')){
//	    			jgEntryInstructions += ",";
//	    			jgEntryInstructions += $("#repeat").val();
	    			$scope.disposalProcess['jgDisposalInstructions'] = 2;
	    		}
	    		// 设置处置原因
	    		$scope.disposalEntry['jgEntryInstructions'] = $scope.disposalMethods + ",录入情况： " + jgEntryInstructions;
	    		// 设置处置流程状态为结束
	    		$scope.disposalEntry['state'] = 1;
	    		break;
	    	case '录入':
	    		$scope.disposalProcess['EntryInstructions'] = 4;
	    		// 设置下发部门
//	    		$scope.disposalEntry['hyEntryDepartment'] = $scope.hyEntryDepartment;
//	    		$scope.disposalEntry['jgEntryInstructions'] = $scope.disposalMethods + ",录入部门： " + $scope.hyEntryDepartment;
	      	  	break;
    	}*/
//    	warningDisposalService.updateDisposalEntry($scope.disposalEntry,function (data) {
//			 if (data.state == 200) {
    	warningDisposalService.updateDisposalEntry(
    			$rootScope.fstrName,
    			$scope.earlyWarningInfo.id,
    			$scope.vehicleInfo.plateNumber,
    			depName,
    			$scope.disposalEntry.EntryTime,
    			$scope.disposalProcess.EntryInstructions,
    			$scope.disposalRules,function (data) {
    		if (data.status == 0) {
				 /*if($("#sendsms").is(":checked")){
					 var smsText = $scope.hyDepartment+":"+$("#rules").val()+"请及时处理！";
	            	 var smsMob = "";
	            	 $scope.sendSMS(smsText,smsMob);
				 }*/
				 SweetAlert.swal("", "录入成功", "success");
				 // 初始化页面
				 $scope.disposalEntry = {};
				 $scope.earlyWarningInfo = {};
				 $scope.vehicleInfo = {};
				 $scope.disposalRules = "";
//				 $scope.disposalMethods = "录入";
//				 $scope.hyEntryDepartment = "一分局一大队";
				 $("#repeat").checked=false;
				 $("#wrong").checked=false;
            	 $scope.queryWarningDisposalViewList();
			 }else{
				 SweetAlert.swal("", "录入失败", "warning");
			 }
		 }, function (err) {
			 SweetAlert.swal("", "录入失败", "warning");
		 })
    };
    
    /*$scope.sendSMS = function(smsText,smsMob){
    	$scope.queryConditionData['smsText'] = smsText;
    	$scope.queryConditionData['smsMob'] = smsMob;
    	smsService.sendSMS($scope.queryConditionData,function (data) {
    	}, function (err) {
		})
    }*/
    
    //进页面时默认加载
    $scope.queryWarningDisposalViewList();
    
    
    $scope.$on('$destroy',function(){  
    	$interval.cancel(entryRefresh); 
    })
    
    //每10秒刷新一次车辆实时位置--暂定只刷新10次
    entryRefresh = $interval(function(){
    	$scope.queryWarningDisposalViewList();
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
    	if(text==null || text==undefined || text==''){
    		return "plate_none.png";
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
