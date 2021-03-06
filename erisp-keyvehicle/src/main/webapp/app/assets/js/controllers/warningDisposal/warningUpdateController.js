/*
 * 预警添加
 */
app.controller('warningUpdateController', ['$timeout','$scope','$modal', 'params','$modalInstance','SweetAlert','warningSetService',
  function($timeout,$scope,$modal,params,$modalInstance,SweetAlert,warningSetService) {
	$scope.warningData={};
	//document.getElementById("vehicleTypeMain").readOnly='true';
     if(params.warningType=='超速'){
    	 var data=params.remark.split(" ");
		   $scope.warningData={
				     'id':params.id,
					'vehicleTypeMain':'物流车',
					'vehicleType':params.vehicleType,
					'plateNumber':params.plateNumber,
					'warningType':params.warningType,
					'limitSpeed':data[1],//需要截取其中的数字
					'routeName':params.routeName
				   };
	   }else if(params.warningType=='违规时间'){
		   var data=params.remark.split(" ");
		   $scope.warningData={
				   'id':params.id,
					'vehicleTypeMain':'物流车',
					'vehicleType':params.vehicleType,
					'plateNumber':params.plateNumber,
					'warningType':params.warningType,
					'startDate':data[1],
					'endDate':data[3],
					'startTime':data[5],
					'endTime':data[7],
					'routeName':params.routeName
				   };
		   
	   }else if(params.warningType=='违规路线'){
		   var data=params.remark.split(" ");
		   $scope.warningData={
				    'id':params.id,
					'vehicleTypeMain':'物流车',
					'vehicleType':params.vehicleType,
					'plateNumber':params.plateNumber,
					'warningType':params.warningType,
					'warningRoute':params.warningRoute
				   };
	   }else{
		   var data=params.remark.split(" ");
		   $scope.warningData={
				    'id':params.id,
					'vehicleTypeMain':'物流车',
					'vehicleType':params.vehicleType,
					'plateNumber':params.plateNumber,
					'warningType':params.warningType,
					'drivingTime':data[1]
				   };
	   }
     
	
	//预警修改
	$scope.update=function(){
		$scope.warningData.startDate=$("#startDate").val();
		$scope.warningData.endDate=$("#endDate").val();
		$scope.warningData.startTime=$("#startTime").val();
		$scope.warningData.endTime=$("#endTime").val();
		 var validationStr = validation();
		 if(validationStr) { 
	            SweetAlert.swal("注意", validationStr, "warning");
	        }else{
	        	warningSetService.updateWarning($scope.warningData,function(data){
	    			if(data.state==200 &&data.messageBody.result==1){
	    				$modalInstance.close(true);
	    			};
	    		},function(err){
	    			$modalInstance.close(false);
	    		});
	        }
	};
	//重置
   /* $scope.reset = function(){
        $scope.warningData = {};
    }*/
	 //取消
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    
    function validation () {
        if($scope.warningData.vehicleTypeMain == undefined || $scope.warningData.vehicleTypeMain == "") {
            return "主类车辆类型不能为空！";
        }else if($scope.warningData.vehicleType == undefined || $scope.warningData.vehicleType == "") {
            return "车辆类型不能为空！";
        }else if($scope.warningData.warningType == undefined || $scope.warningData.warningType == "") {
            return "预警类型不能为空！";
        }else if($("#startDate").val() == "") {
            return "开始日期不能为空！";
        }else if($("#endDate").val() == "") {
            return "开始日期不能为空！";
        }else if($("#startTime").val() == "") {
            return "开始时间不能为空！";
        }else if($("#endTime").val() == "") {
            return "结束时间不能为空！";
        }else if($("#route").val() == "") {
            return "违规路线设置不能为空！";
        }else if($("#drivingTime").val() == "") {
            return "疲劳驾驶时间不能为空！";
        }
    };
    //添加时间
   $scope.addtime=function(){
   	 $(".form_datetime").datetimepicker({
   			lang:'ch',
   			//timepicker:true,
   		  //  pickDate: false,
   		    pickTime:true,
   		    minuteStep:15,
   			format:'H:00:00',
   		//	startView: 2,
   		//	minView: 2,
   			showSecond:true
//   			formatDate:'Y-m-d H:i'
   			//formatDate: "yyyy-mm-dd"
   		});
    }
  //添加日期
   $scope.addDate=function(){
	   	 $(".form_date").datetimepicker({
	   			lang:'ch',
	   			timepicker:false,
	   			//format:'d/m/Y',
	   			format:'Y-m-d',
//	   			formatDate:'Y-m-d H:i'
	   			//formatDate: "yyyy-mm-dd"
	   			//minDate:'-1970/01/02', // yesterday is minimum date
	   			//maxDate:'+1970/01/02' // and tommorow is maximum date calendar
	   		
	   		});
	    }
	
}]);