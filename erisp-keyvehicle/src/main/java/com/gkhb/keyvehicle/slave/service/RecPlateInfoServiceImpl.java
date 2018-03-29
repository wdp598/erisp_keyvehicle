package com.gkhb.keyvehicle.slave.service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gkhb.keyvehicle.common.utils.DateUtils;
import com.gkhb.keyvehicle.exception.DtpException;
import com.gkhb.keyvehicle.model.param.QueryConditionData;
import com.gkhb.keyvehicle.model.view.RecPlateInfoView;
import com.gkhb.keyvehicle.slave.mapper.RecPlateInfoMapper;

@Service
public class RecPlateInfoServiceImpl implements RecPlateInfoService{
	
	@Autowired
	private RecPlateInfoMapper recPlateInfoMapper;

	@Override
	public List<RecPlateInfoView> queryAll(QueryConditionData queryConditionData){
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
		return recPlateInfoMapper.queryAll(queryConditionData);
	}
	
	@Override
	public List<RecPlateInfoView> queryRecPlateInfo(QueryConditionData queryConditionData){
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
		return recPlateInfoMapper.queryRecPlateInfo(queryConditionData);
	}

}
