package com.gkhb.keyvehicle.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.gkhb.keyvehicle.common.model.Page;
import com.gkhb.keyvehicle.model.Speed;
import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.view.WarningSetView;

/**
 * 车辆速度mapper
 * @author WeiGuo
 * @data 2017年9月23日下午5:15:07
 */
@Repository
public interface SpeedMapper {
    
    /**
     * 查询预警信息-车辆速度
     * @return
     */
    public List<WarningSetView> queryWarningInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);

    /**
     * 根据车辆id查询行驶限速
     * @param id
     * @return
     */
    public Speed querySpeedByVehicleId(@Param("vehicleId")String id);

    /**
     * 根据车辆类型查询行驶限速
     * @param vehicleType
     * @return
     */
    public Speed querySpeedByVehicleType(@Param("vehicleType")String vehicleType);

    /**
     * 根据id删除预警信息
     * @param id
     * @return
     */
    public int deleteWarningInfo(String id);

    /**
     * 根据id查询行驶限速
     * 
     * @param id
     * @return
     */
    public Speed querySpeedById(String id);
}
