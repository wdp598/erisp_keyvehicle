app.factory("mapService",["$http",function($http) {
	
	// GET根据车牌号查询车辆历史轨迹
	function queryVehicleHisTrajectoryInfoByPlateNumber(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/vehicleHisTrajectoryInfo/queryVehicleHisTrajectoryInfoByPlateNumber";
        $http({
            url : dataUrl,
            method : "GET",
            params : {plateNumber:params}
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
	// 根据车牌号码分页查询车辆信息
	function queryByPlateNumber(params,success,error) {
		var dataUrl = "/erisp-keyvehicle/service/vehicleHisTrajectoryInfo/queryByPlateNumber";
		$http({
			url : dataUrl,
			method : "GET",
			params : params
		}).success(function(data) {
			success(data);
		}).error(function(data) {
			error(data)
		});
	}
	
	// 根据车牌号码查询所有车辆信息
	function queryVehicleByPlateNumber(params,success,error) {
		var dataUrl = "/erisp-keyvehicle/service/vehicleHisTrajectoryInfo/queryVehicleByPlateNumber";
		$http({
			url : dataUrl,
			method : "GET",
			params : {plateNumber:params}
		}).success(function(data) {
			success(data);
		}).error(function(data) {
			error(data)
		});
	}
	
	// 根据车牌号码查询一辆车辆信息
	function queryOneVehicleByPlateNumber(params,success,error) {
		var dataUrl = "/erisp-keyvehicle/service/vehicleHisTrajectoryInfo/queryVehicleByPlateNumber";
		$http({
			url : dataUrl,
			method : "GET",
			params : {plateNumber:params}
		}).success(function(data) {
			success(data);
		}).error(function(data) {
			error(data)
		});
	}
	
	// 根据车辆类型查询车辆信息
	function queryVehicleInfoByVehicleType(params,success,error) {
		var dataUrl = "/erisp-keyvehicle/service/vehicleHisTrajectoryInfo/queryVehicleInfoByVehicleType";
		$http({
			url : dataUrl,
			method : "GET",
			params : {vehicleType:params}
		}).success(function(data) {
			success(data);
		}).error(function(data) {
			error(data)
		});
	}
	
	// GET查询所有车辆实时信息
	function queryVehicleRealTimeInfo(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/vehicleRealTimeInfo/queryVehicleRealTimeInfo";
        $http({
            url : dataUrl,
            method : "GET",
            params : params
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
	//查询车某一辆车的实时信息
	function queryOneVehicleRealTimeInfo(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/vehicleRealTimeInfo/queryOneVehicleRealTimeInfo";
        $http({
            url : dataUrl,
            method : "GET",
            params : {plateNumber:params}
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
	//查询某段时间内某辆车的位置信息
	function queryLocations(params,success, error) {
        var dataUrl = "/erisp-keyvehicle/service/vehicleHisTrajectoryInfo/queryLocations";
        $http({
            url: dataUrl,
            method: "GET",
            params: params
        }).success(function (data) {
            success(data);
        }).error(function (data) {
            error(data)
        });
	}
	
	// GET查询所有车辆信息
	function queryVehicleInfo(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/vehicleInfo/queryVehicleInfo";
        $http({
            url : dataUrl,
            method : "GET",
            params : params
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
	// GET根据用户类型和部门名称获取预警处置信息
	function queryWarningDisposalViewList(params,success,error) {
		var dataUrl = "/erisp-keyvehicle/service/warningDisposal/queryWarningDisposalViewList";
		$http({
			url : dataUrl,
			method : "GET",
			params : params
		}).success(function(data) {
			success(data);
		}).error(function(data) {
			error(data)
		});
	}

	//查车辆数及预警数
	function queryEarlyWarningInfoCounts(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/earlyWarningInfo/queryEarlyWarningInfoCounts";
        $http({
            url : dataUrl,
            method : "GET",
            params : params
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
	//查车辆行驶时间和速度等
	function queryVehicleDriveInfo(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/vehicleRealTimeInfo/queryVehicleDriveInfo";
        $http({
            url : dataUrl,
            method : "GET",
            params : {plateNumber:params}
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
	// 获取预警处置流程列表信息
	function queryWarningDisposalViewList(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/warningDisposal/queryWarningDisposalViewList";
        $http({
            url : dataUrl,
            method : "GET",
            params : params
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
	// 修改预警处置流程信息
	function updateDisposalProcess(params,success,error) {
		var dataUrl = "/erisp-keyvehicle/service/warningDisposal/updateDisposalProcess";
		$http({
			url : dataUrl,
			method : "POST",
			params : {"disposalProcessJsonStr":params}
		}).success(function(data) {
			success(data);
		}).error(function(data) {
			error(data)
		});
	}
	
	//查车辆行驶时间和速度等
	function queryAllRecPlateInfo(params,success,error) {
        var dataUrl = "/erisp-keyvehicle/service/recPlateInfo/queryAllRecPlateInfo";
        $http({
            url : dataUrl,
            method : "GET",
            params : params
        }).success(function(data) {
            success(data);
        }).error(function(data) {
            error(data)
        });
	}
	
    return {
    	queryVehicleHisTrajectoryInfoByPlateNumber:queryVehicleHisTrajectoryInfoByPlateNumber,
    	queryByPlateNumber:queryByPlateNumber,
    	queryVehicleByPlateNumber:queryVehicleByPlateNumber,
    	queryOneVehicleByPlateNumber:queryOneVehicleByPlateNumber,
    	queryVehicleInfoByVehicleType:queryVehicleInfoByVehicleType,
    	queryVehicleRealTimeInfo:queryVehicleRealTimeInfo,
    	queryOneVehicleRealTimeInfo:queryOneVehicleRealTimeInfo,
    	queryLocations:queryLocations,
    	queryVehicleInfo:queryVehicleInfo,
    	queryWarningDisposalViewList:queryWarningDisposalViewList,
    	queryEarlyWarningInfoCounts:queryEarlyWarningInfoCounts,
    	queryVehicleDriveInfo:queryVehicleDriveInfo,
    	queryWarningDisposalViewList:queryWarningDisposalViewList,
    	updateDisposalProcess:updateDisposalProcess,
    	queryAllRecPlateInfo:queryAllRecPlateInfo
    }
}
])