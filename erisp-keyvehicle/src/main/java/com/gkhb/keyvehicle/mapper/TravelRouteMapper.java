package com.gkhb.keyvehicle.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.gkhb.keyvehicle.common.model.Page;
import com.gkhb.keyvehicle.model.TravelRoute;
import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.view.WarningSetView;


/**
 *	车辆行驶路线mapper
 *	@author weidongping
 *	@createTime 2017年9月7日 上午10:27:02
 */
@Repository
public interface TravelRouteMapper {

	/**
	 * 添加车辆行驶路
	 * @param travelroute
	 */
	public void addRoadTravelRoute(TravelRoute travelroute);

	
	/**
	 * 查询车辆行驶路
	 * @return
	 */
	public List<TravelRoute> queryTravelRoute();

	/**
	 * 修改车辆行驶路
	 * @param travelroute
	 * @return
	 */
	public int updateTravelRoute(TravelRoute travelroute);


    /**
     * 根据车辆id查询辆行驶路
     * @param id
     * @return
     */
    public TravelRoute queryTravelRouteByVehicleId(@Param("vehicleId")String vehicleId);


    /**
     * 根据车辆类型查询辆行驶路
     * @param vehicleType
     * @return
     */
    public TravelRoute queryTravelRouteByVehicleType(@Param("vehicleType")String vehicleType);
	
    /**
     * 查询预警信息-车辆行驶路
     * @return
     */
    public List<WarningSetView> queryWarningInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);
    
    /**
     * 根据id删除预警信息
     * @param id
     * @return
     */
    public int deleteWarningInfo(String id);


    /**
     * 根据id查询辆行驶路
     * @param warningSetId
     * @return
     */
    public TravelRoute queryTravelRouteById(String id);
}
