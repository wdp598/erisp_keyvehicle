/**
 * 车辆年审预警
 */
app.controller('warningOfMotTestController', ['$scope','$state','$modal', '$log','$filter','SweetAlert','warningDisposalService','$interval',
  function($scope, $state, $modal, $log,$filter,SweetAlert,warningDisposalService,$interval) {
	
	$scope.currentPage = 1;//初始化当前页
    $scope.pageSize = 16;//初始化每页大小
    $scope.queryConditionData = {
            'currentPage':  1,
            'pageSize': $scope.pageSize
    }
    $("#first").attr("disabled",true);//设置首页按钮不可用
	$("#previous").attr("disabled",true);//设置上一页按钮不可用
    
    $scope.disposalMethods = "处置";
    $scope.hyDepartment = "物流云平台";
    $scope.disposalProcess = {};
	
	//翻页
    $scope.pageChanged = function () {
	   	//当前页
	   	$scope.queryConditionData['currentPage'] = $scope.currentPage;
	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
	   	$scope.queryWarningOfMotTestViewList();
    };
    
    //浏览最大记录数
    $scope.pageQuery = function () {
	   	//当前页
	   	$scope.queryConditionData['currentPage'] = 1;
	   	$scope.queryConditionData['pageSize'] = $scope.pageSize;
    };
    
    //查询预警处置流程
    $scope.queryWarningOfMotTestViewList = function () {
    	warningDisposalService.queryWarningOfMotTestViewList($scope.queryConditionData,function (data) {
			 if (data.state == 200) {
				$scope.vehicleOfNoMotTestList = data.messageBody.vehicleOfNoMotTestList;
				$scope.totalItems = data.messageBody.total;
            	$scope.currentPage = data.messageBody.currentPage;
            	$scope.pages = data.messageBody.pages;
			 }
		 }, function (err) {
		 })
    };
    
    //进入页面默认加载
    $scope.queryWarningOfMotTestViewList();
    
    //查询首页
    $scope.query = function () {
        $scope.queryConditionData['currentPage'] = 1;
        $scope.queryConditionData['pageSize'] = $scope.pageSize;
        $scope.queryWarningOfMotTestViewList();
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
 	   $scope.queryWarningOfMotTestViewList();
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
 	  $scope.queryWarningOfMotTestViewList();
    }
    
    //查询最后一页
    $scope.lastPage=function(){
 	   $scope.queryConditionData['currentPage'] = $scope.pages;
 	   $scope.queryConditionData['pageSize'] = $scope.pageSize;
 	  $scope.queryWarningOfMotTestViewList();
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
 	   $scope.queryWarningOfMotTestViewList();
 	   if($scope.anyPage == $scope.pages || $scope.anyPage > $scope.pages ){
 			  $("#last").attr("disabled",true);
 			  $("#next").attr("disabled",true);
 		   }
    }
    
    //预警信息点击事件
    $scope.warningOnClick = function(data) {
    	var currentYear = new Date();
    	$scope.vehicleInfo = data;
    	$scope.vehicleInfo['vehicleKind'] = "物流车";
    	$scope.vehicleInfo['warningExplain'] = "车牌号码为【"+data.plateNumber+"】的车辆在"+currentYear.getFullYear()+"年逾期未进行年审！";
    };
    
    //修改预警处置流程
    $scope.dealMotTest = function (id) {
    	warningDisposalService.dealMotTest(id,function (data) {
    		if(data.state==200){
    			var result = data.messageBody.result;
    			if(result == 1){
    	               SweetAlert.swal({
    	                   title: "处置成功!",
    	                   type: "success",
    	                   timer: 2000,
    	                   confirmButtonText: "确定"
    	               });
    	               $scope.vehicleInfo = {};
    	               $scope.disposalMethods = "处置";
    				   $scope.hyDepartment = "一分局一大队";
    				   $scope.queryWarningOfMotTestViewList();
    	           }else{
    	           	SweetAlert.swal({
    	                   title: "处置失败!",
    	                   type: "error",
    	                   timer: 2000,
    	                   confirmButtonText: "确定"
    	               });
    	           }
			};
		},function(err){
			SweetAlert.swal({
                title: "处置失败，请联系管理员~",
                type: "error",
                timer: 2000,
                confirmButtonText: "确定"
            });
		});
    };
    
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
    
    //每60秒刷新一次车辆年审预警
    var motTestRefresh = $interval(function(){
    	$scope.queryWarningOfMotTestViewList();
    },60000);
    
    $scope.$on('$destroy',function(){  
        $interval.cancel(motTestRefresh);
    })
	
}]);

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
