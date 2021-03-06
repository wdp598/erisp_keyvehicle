package com.gkhb.keyvehicle.controller;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import net.sf.json.JSONArray;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.gkhb.keyvehicle.common.model.Page;
import com.gkhb.keyvehicle.common.utils.DateUtils;
import com.gkhb.keyvehicle.common.utils.JsonUtils;
import com.gkhb.keyvehicle.exception.DtpException;
import com.gkhb.keyvehicle.model.EarlyWarningInfo;
import com.gkhb.keyvehicle.model.GPSData;
import com.gkhb.keyvehicle.model.VehicleHisTrajectoryInfo;
import com.gkhb.keyvehicle.model.VehicleInfo;
import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.view.VehicleInfoView;
import com.gkhb.keyvehicle.service.EarlyWarningInfoService;
import com.gkhb.keyvehicle.service.VehicleHisTrajectoryInfoService;
import com.gkhb.keyvehicle.service.VehicleInfoService;

/**
 *	车辆历史轨迹信息控制器
 *	@author Colin
 *	@createTime 2017年7月4日 上午10:53:06
 */
@Controller
@RequestMapping(("/vehicleHisTrajectoryInfo"))
public class VehicleHisTrajectoryInfoController {
	
	@Autowired
	VehicleHisTrajectoryInfoService vehicleHisTrajectoryInfoService;
	
	@Autowired
	private VehicleInfoService vehicleInfoService;
	
	/**
     * 查询车辆历史轨迹信息
     * @return Model    返回类型
     */
    @RequestMapping(value = "/queryVehicleHisTrajectoryInfoByPlateNumber" , method = RequestMethod.GET)
    public Model queryVehicleInfoByPlateNumber(QueryConditionData queryConditionData,String plateNumber){
        Model model = new ExtendedModelMap();
        List<VehicleHisTrajectoryInfo> vehicleHisTrajectoryInfoList = vehicleHisTrajectoryInfoService.searchVehicleHisTrajectoryInfo(queryConditionData,plateNumber);
        model.addAttribute("vehicleHisTrajectoryInfoList", vehicleHisTrajectoryInfoList);
        return model;
    }
    
    /**
     * 根据车牌号码分页查询车辆信息
     * @param plateNumber
     * @return
     */
    @RequestMapping(value = "/queryByPlateNumber" , method = RequestMethod.GET)
    public Model queryByPlateNumber(QueryConditionData queryConditionData){
        Model model = new ExtendedModelMap();
        Page page = new Page(queryConditionData);
        List<VehicleInfoView> vehicleInfoList = 
        		vehicleInfoService.searchVehicleInfo(queryConditionData,page);
        model.addAttribute("vehicleInfoList", vehicleInfoList);
        model.addAttribute("page", page);
        return model;
    }
    
    /**
     * 根据车牌号码查询所有的车辆信息
     * @param plateNumber
     * @return
     */
    @RequestMapping(value = "/queryVehicleByPlateNumber" , method = RequestMethod.GET)
    public Model queryVehicleByPlateNumber(String plateNumber){
    	Model model = new ExtendedModelMap();
    	List<VehicleInfoView> vehicleInfoList = 
    			vehicleInfoService.searchVehicleInfoByPlateNumber(plateNumber);
    	for (VehicleInfoView v : vehicleInfoList) {
		}
    	model.addAttribute("vehicleInfoList", vehicleInfoList);
    	return model;
    }
    
    /**
     * 根据车辆类型查询所有的车辆信息
     * @param plateNumber
     * @return
     */
    @RequestMapping(value = "/queryVehicleInfoByVehicleType" , method = RequestMethod.GET)
    public Model queryVehicleInfoByVehicleType(QueryConditionData queryConditionData,String queryConditionParams){
    	String vehicleType = JsonUtils.getJsonString(queryConditionParams, "vehicleType");
    	Model model = new ExtendedModelMap();
    	List<VehicleInfoView> vehicleInfoViewList = 
    			vehicleInfoService.searchVehicleInfoByVehicleType(queryConditionData, vehicleType);
    	model.addAttribute("vehicleInfoViewList", vehicleInfoViewList);
    	return model;
    }
    
    /**
     * 查询某辆车的基本信息和违法事故统计及预警信息
     * @param plateNumber
     * @return
     */
    @RequestMapping(value = "/queryVehicleOfOtherInfoByPlateNumber" , method = RequestMethod.GET)
    public Model queryVehicleOfOtherInfoByPlateNumber(String plateNumber){
    	Model model = new ExtendedModelMap();
    	VehicleInfoView vehicleInfoView = vehicleInfoService.searchVehicleInfoOfOtherInfo(plateNumber);
    	model.addAttribute("vehicleInfo", vehicleInfoView);
    	return model;
    }
    
    /**
	 * 查询某段时间内某辆车的位置信息
	 */
	@RequestMapping(value = "/queryLocations" , method = RequestMethod.GET)
	public Model queryLocations(QueryConditionData queryConditionData){
		Model model = new ExtendedModelMap();
		String timePrevious = queryConditionData.getTimePrevious();
		String formatDateToString = null;//获取当前时间前1小时或24小时的时间字符串
		if(timePrevious != null && timePrevious != ""){
			try {
				Date timeByTime = DateUtils.acquireTimeByTime(new Date(),  Calendar.MINUTE, Integer.parseInt(timePrevious), -1);
				formatDateToString = DateUtils.formatDateToString(timeByTime, DateUtils.YYYY_MM_DD_HH_MM_SS);
			} catch (NumberFormatException e) {
				e.printStackTrace();
			} catch (DtpException e) {
				e.printStackTrace();
			}
			queryConditionData.setTimePrevious(formatDateToString);
		}
		if(queryConditionData.getStartTime() != null && queryConditionData.getStartTime() != ""){
			String startTime = queryConditionData.getStartTime()+":00";
			String replaceStartTime = startTime.replaceAll("/", "-");
			queryConditionData.setStartTime(replaceStartTime);
		}
		if(queryConditionData.getEndTime() != null && queryConditionData.getEndTime() != ""){
			String endTime = queryConditionData.getEndTime()+":00";
			String replaceEndTime = endTime.replaceAll("/", "-");
			queryConditionData.setEndTime(replaceEndTime);
		}
		List<GPSData> movePaths = vehicleHisTrajectoryInfoService.queryLocationsByRealTimeData(queryConditionData);
		movePaths.addAll(vehicleHisTrajectoryInfoService.queryLocationsByHistData(queryConditionData));
		model.addAttribute("movePaths", JSONArray.fromObject(movePaths));
		return model;
	}
}
