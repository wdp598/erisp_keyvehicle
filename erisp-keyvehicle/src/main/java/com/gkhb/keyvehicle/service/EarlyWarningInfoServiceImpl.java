package com.gkhb.keyvehicle.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gkhb.keyvehicle.common.model.Page;
import com.gkhb.keyvehicle.mapper.EarlyWarningInfoMapper;
import com.gkhb.keyvehicle.model.export.AccidentInfoExport;
import com.gkhb.keyvehicle.model.export.EarlyWarningInfoExport;
import com.gkhb.keyvehicle.model.export.IllegalInfoExport;
import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.EarlyWarningInfo;
import com.gkhb.keyvehicle.model.view.EarlyWarningInfoView;

/**
 * 预警信息
 * @author eddy
 *
 */
@Service
public class EarlyWarningInfoServiceImpl implements EarlyWarningInfoService {
	
	@Autowired
	private EarlyWarningInfoMapper earlyWarningInfoMapper;

	@Override
	public EarlyWarningInfoView queryEarlyWarningInfoCounts(QueryConditionData queryConditionData) {
		return earlyWarningInfoMapper.queryEarlyWarningInfoCounts(queryConditionData);
	}
	
	@Override
	public EarlyWarningInfo queryEarlyWarningInfoByVehicleId(String vehicleId) {
		return earlyWarningInfoMapper.queryEarlyWarningInfoByVehicleId(vehicleId);
	}

	@Override
	public List<EarlyWarningInfoView> queryEarlyWaringInfoList(
			QueryConditionData queryConditionData,Page page) {
		return earlyWarningInfoMapper.queryEarlyWaringInfoList(queryConditionData,page);
	}

	@Override
	public List<EarlyWarningInfoView> queryEarlyWaringInfoListCounts(QueryConditionData queryConditionData) {
		return earlyWarningInfoMapper.queryEarlyWaringInfoListCounts(queryConditionData);
	}

	@Override
	public List<EarlyWarningInfoExport> exportEarlyWarningInfo(
			QueryConditionData queryConditionData) {
		return earlyWarningInfoMapper.exportEarlyWarningInfo(queryConditionData);
	}

	@Override
	public List<AccidentInfoExport> exportAccidentInfo(
			QueryConditionData queryConditionData) {
		return earlyWarningInfoMapper.exportAccidentInfo(queryConditionData);
	}

	@Override
	public List<IllegalInfoExport> exportIllegalInfo(
			QueryConditionData queryConditionData) {
		return earlyWarningInfoMapper.exportIllegalInfo(queryConditionData);
	}

	@Override
	public List<AccidentInfoExport> queryAccidentInfo(
			QueryConditionData queryConditionData, Page page) {
		return earlyWarningInfoMapper.queryAccidentInfo(queryConditionData, page);
	}

	@Override
	public List<IllegalInfoExport> queryIllegalInfo(
			QueryConditionData queryConditionData, Page page) {
		return earlyWarningInfoMapper.queryIllegalInfo(queryConditionData, page);
	}

	@Override
	public List<EarlyWarningInfoView> queryEarlyWaring(QueryConditionData queryConditionData, Page page) {
		return earlyWarningInfoMapper.queryEarlyWaring(queryConditionData, page);
	}

	@Override
	public EarlyWarningInfo queryEarlyWarningInfoByPlateNumber(QueryConditionData queryConditionData) {
		return earlyWarningInfoMapper.queryEarlyWarningInfoByPlateNumber(queryConditionData);
	}
}
