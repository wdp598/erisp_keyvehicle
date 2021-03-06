package com.gkhb.keyvehicle.slave.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.view.RecPlateInfoView;

@Repository
public interface RecPlateInfoMapper {

	/**
	 * 查询某段时间内的卡口信息
	 * @param queryConditionData
	 * @return
	 */
	public List<RecPlateInfoView> queryAll(@Param("queryConditionData")QueryConditionData queryConditionData);
	
	/**
	 * 查询某段时间内的过车卡口信息(无卡口设备gps坐标)
	 * @param queryConditionData
	 * @return
	 */
	public List<RecPlateInfoView> queryRecPlateInfo(@Param("queryConditionData")QueryConditionData queryConditionData);
	
}
