package com.gkhb.keyvehicle.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.gkhb.keyvehicle.common.model.Page;
import com.gkhb.keyvehicle.model.VehicleInfo;
import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.view.VehicleInfoView;


/**
 *	车辆信息Mapper
 *	@author Colin
 *	@createTime 2017年7月3日 上午9:42:05
 */
@Repository
public interface VehicleInfoMapper {
	
	/**
	 * 添加车辆
	 * @param vehicleInfo
	 */
	boolean addVehicleInfo(VehicleInfo vehicleInfo);
	
	/**
	 * 删除车辆
	 * @param id
	 */
	boolean deleteVehicleInfoById(String id);
	
	/**
	 * 修改车辆信息
	 * @param vehicleInfo
	 * @return	返回类型
	 */
	boolean updateVehicleInfo(VehicleInfo vehicleInfo);
	
	/**
	 * 修改车辆图片--二进制
	 * @param vehicleInfo
	 * @return
	 */
	boolean updateVehiclePic(VehicleInfo vehicleInfo);
	
	/**
	 * 分页查询车辆信息
	 * @param queryConditionData
	 * @param page
	 * @return
	 */
	List<VehicleInfoView> queryVehicleInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);
	
	/**
	 * 分页查询预警车辆信息
	 * @param queryConditionData
	 * @param page
	 * @return
	 */
	List<VehicleInfoView> queryWarningVehicleInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);
	
	/**
	 * 查询所有车辆信息
	 * @return
	 */
	List<VehicleInfoView> queryVehicle();
	
	/**
	 * 根据条件查询所有车辆信息
	 * @return
	 */
	List<VehicleInfoView> queryVehicleByConditions(@Param("queryConditionData")QueryConditionData queryConditionData);
	
	/**
	 * 根据id查询车辆
	 * @param id
	 * @return
	 */
	VehicleInfo queryVehicleInfoById(String id);
	
	/**
	 * 根据车牌分页查询车辆
	 * @param queryConditionData
	 * @param page
	 * @return
	 */
	List<VehicleInfoView> searchVehicleInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);
//	List<VehicleInfo> searchVehicleInfo(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);
	
	/**
	 * 根据车牌查询所有车辆
	 * @param plateNumber
	 * @return
	 */
	List<VehicleInfoView> searchVehicleInfoByPlateNumber(@Param("plateNumber")String plateNumber);
	
	/**
	 * 根据车辆类型分页查询车辆
	 * @param queryConditionData
	 * @param vehicleType
	 * @return
	 */
	List<VehicleInfoView> searchVehicleInfoByVehicleType(@Param("queryConditionData")QueryConditionData queryConditionData,@Param("vehicleType")String vehicleType);

    /**
     * 根据车牌号码查询车辆信息
     * @param plateNumber
     * @return
     */
    VehicleInfo queryVehicleInfoByPlateNumber(@Param("queryConditionData")QueryConditionData queryConditionData);
    
    /**
     * 查询车辆年审预警
     * @param queryConditionData
     * @return
     */
    List<VehicleInfoView> queryVehicleMotTest(@Param("queryConditionData")QueryConditionData queryConditionData,Page page);

    /**
     * 处置车辆年审预警
     * @param vehicleInfo
     * @return
     */
    boolean dealMotTest(String id);
    
    /**
     * 根据车牌号查当前年度事故次数
     * @param plateNumber
     * @return
     */
    Integer countAccidentTotalByPlateNumber(@Param("plateNumber")String plateNumber);
    
    /**
     * 根据车牌号查当前年度违法次数
     * @param plateNumber
     * @return
     */
    Integer countIllegalTotalByPlateNumber(@Param("plateNumber")String plateNumber);
}
